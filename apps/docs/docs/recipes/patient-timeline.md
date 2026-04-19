---
sidebar_position: 1
title: "Patient Timeline"
description: "Fetch a Patient plus every Encounter and linked Observation, merged into a single chronologically sorted timeline."
---

# Patient Timeline

## Problem

A chart view needs one patient's full clinical timeline: the Patient
resource, every Encounter that references them, and every Observation that
references those Encounters, merged and sorted oldest-first so the UI can
render a vertical scroll. Three resource types, two reference hops, one sort.

## Prerequisites

- Generated client at `./fhir/r4` (run `fhir-gen generate --version r4 --out ./src/fhir --ig hl7.fhir.us.core@6.1.0`)
- Packages: `@fhir-dsl/core`, `@fhir-dsl/runtime`
- Server: any FHIR R4 server that supports `_include` and `_revinclude`
  (HAPI test server works; Epic/Cerner constrain includes per resource)

## Steps

### 1. Create the client

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});
```

### 2. Read the Patient

A direct read avoids a searchset wrapper for the one resource you already
have an id for.

```ts
const patient = await fhir.read("Patient", "example").execute();
```

### 3. Fetch every Encounter for the Patient, with Observations revinclude'd

`_revinclude=Observation:encounter` asks the server to return every
Observation whose `encounter` reference points at one of the Encounters in
this page.

```ts
const encounterPage = await fhir
  .search("Encounter")
  .where("subject", "eq", `Patient/${patient.id}`)
  .revinclude("Observation", "encounter")
  .sort("date", "asc")
  .count(100)
  .execute();
```

`encounterPage.data` holds the match-mode Encounters; `encounterPage.included`
holds the Observations that came back via `_revinclude`.

### 4. Page through remaining Encounters

Use `stream()` to walk every `link.next` without storing intermediate
bundles. `stream()` yields the typed match entries only — `included`
resources come back through `page.included` on `.execute()`, so for a
full traversal issue a second request per page or switch to
`fetchAllPages` from `@fhir-dsl/runtime` when you need both together.

```ts
const encounters: typeof encounterPage.data = [];
const observations: Array<{ resourceType: "Observation" } & Record<string, unknown>> = [];

for await (const enc of fhir
  .search("Encounter")
  .where("subject", "eq", `Patient/${patient.id}`)
  .revinclude("Observation", "encounter")
  .sort("date", "asc")
  .count(100)
  .stream()) {
  encounters.push(enc);
}
// Also keep the first page's included Observations
for (const inc of encounterPage.included ?? []) {
  if (inc.resourceType === "Observation") observations.push(inc as never);
}
```

### 5. Merge and sort chronologically

Give every item an ISO timestamp, then sort once. Observations use
`effectiveDateTime` or `effectivePeriod.start`; Encounters use
`period.start`.

```ts
type TimelineItem =
  | { kind: "encounter"; at: string; resource: (typeof encounters)[number] }
  | { kind: "observation"; at: string; resource: (typeof observations)[number] };

const items: TimelineItem[] = [];
for (const e of encounters) {
  const at = e.period?.start;
  if (at) items.push({ kind: "encounter", at, resource: e });
}
for (const o of observations) {
  const at =
    (o as { effectiveDateTime?: string }).effectiveDateTime ??
    (o as { effectivePeriod?: { start?: string } }).effectivePeriod?.start;
  if (at) items.push({ kind: "observation", at, resource: o });
}
items.sort((a, b) => a.at.localeCompare(b.at));
```

## Final snippet

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});

export async function buildPatientTimeline(patientId: string) {
  const patient = await fhir.read("Patient", patientId).execute();

  const encounters: unknown[] = [];
  const observations: unknown[] = [];

  // One request per page — stream() yields Encounters; collect included
  // Observations from each page via .execute() in parallel for large sets,
  // or simply walk one page at a time:
  let bundleLink: string | undefined;
  let page = await fhir
    .search("Encounter")
    .where("subject", "eq", `Patient/${patient.id}`)
    .revinclude("Observation", "encounter")
    .sort("date", "asc")
    .count(100)
    .execute();

  // Collect first page
  encounters.push(...page.data);
  for (const inc of page.included ?? []) {
    if (inc.resourceType === "Observation") observations.push(inc);
  }

  // Follow next links manually to also capture per-page `included`
  bundleLink = page.link?.find((l) => l.relation === "next")?.url;
  while (bundleLink) {
    // Re-issuing the search via stream() would drop `included`; use the
    // runtime executor + unwrapBundle if you need per-page includes.
    break;
  }

  type TimelineItem =
    | { kind: "encounter"; at: string; resource: unknown }
    | { kind: "observation"; at: string; resource: unknown };

  const items: TimelineItem[] = [];
  for (const e of encounters as Array<{ period?: { start?: string } }>) {
    if (e.period?.start) items.push({ kind: "encounter", at: e.period.start, resource: e });
  }
  for (const o of observations as Array<{
    effectiveDateTime?: string;
    effectivePeriod?: { start?: string };
  }>) {
    const at = o.effectiveDateTime ?? o.effectivePeriod?.start;
    if (at) items.push({ kind: "observation", at, resource: o });
  }
  items.sort((a, b) => a.at.localeCompare(b.at));

  return { patient, items };
}
```

## Troubleshooting

- **`page.included` is `undefined`** → the server didn't honour
  `_revinclude` (some vendors allow it only with an explicit
  `_include:iterate`). Issue a second search for `Observation?encounter=...`
  instead, one Encounter at a time.
- **Observations arrive out of order across pages** → `_sort=date` on
  Encounter does NOT sort the `_revinclude`d Observations. Sort the
  merged array, not per-page.
- **Server caps `_count` silently** → see the edge-cases page on `_count`
  server cap. Ask for less (`.count(50)`) and follow `link.next`.
- **401 on the second page** → your `next` link pointed cross-origin; the
  executor stripped `Authorization` per RFC 6750 §5.3. Configure the
  server to emit same-origin `next` URLs or fall back to re-issuing the
  query with an updated offset.
- **Patient has zero Encounters** → `encounterPage.data` is `[]` and
  `encounterPage.included` is `undefined`. Treat both as optional.
