---
sidebar_position: 5
title: "Parallel Reference Fetch"
description: "Resolve Reference<T> fields in bulk with Promise.all, with an _include fallback once cardinality outgrows parallel GETs."
---

# Parallel Reference Fetch

## Problem

You have a page of Observations and need the referenced Patient for each.
With 10 observations, 10 parallel `read` calls are fine. With 500, you'll
hammer the server and trigger rate-limiting; with 5000 you'll blow past
connection limits. The right answer depends on cardinality: parallel
fetches below a threshold, `_include` above it. This recipe shows both
paths and how to decide.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`, `@fhir-dsl/runtime`
- Server: any FHIR R4 server. `_include` support is near-universal;
  parallel reads work anywhere but may hit rate limits.

## Steps

### 1. Start with parallel reads (small N)

`Promise.all` over distinct ids is idiomatic and type-safe: each
`fhir.read("Patient", id).execute()` returns a typed `Patient`.

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });

const observations = await fhir
  .search("Observation")
  .where("code", "eq", "8480-6")
  .count(20)
  .execute();

const subjectIds = new Set<string>();
for (const o of observations.data) {
  const ref = o.subject?.reference;
  if (!ref) continue;
  const [type, id] = ref.split("/");
  if (type === "Patient" && id) subjectIds.add(id);
}

const patients = await Promise.all(
  Array.from(subjectIds).map((id) =>
    fhir
      .read("Patient", id)
      .execute()
      .catch((err) => {
        // Tolerate 404 / 410 for deleted references
        if (err?.status === 404 || err?.status === 410) return undefined;
        throw err;
      }),
  ),
);
```

### 2. Cap concurrency for medium N

Without a cap, `Promise.all` fires every request immediately. Above ~50
requests, most servers rate-limit or you exceed socket pools. A small
worker pool keeps throughput smooth.

```ts
async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

const patients = await mapWithConcurrency(Array.from(subjectIds), 8, (id) =>
  fhir
    .read("Patient", id)
    .execute()
    .catch(() => undefined),
);
```

### 3. Switch to `_include` once N is high or references repeat

One request with `_include=Observation:subject` returns the Observations
*and* every referenced Patient in a single bundle. Crucially, the server
deduplicates: if 500 observations point at 50 unique patients, you get
50 Patient rows back — not 500 round trips.

```ts
const page = await fhir
  .search("Observation")
  .where("code", "eq", "8480-6")
  .include("subject")
  .count(500)
  .execute();

// page.data is Observation[]
// page.included is (Patient | Group | Device | Location | ...)[]
const subjectsById = new Map<string, unknown>();
for (const inc of page.included ?? []) {
  const id = (inc as { id?: string }).id;
  if (id) subjectsById.set(`${(inc as { resourceType: string }).resourceType}/${id}`, inc);
}

for (const o of page.data) {
  const ref = o.subject?.reference;
  const patient = ref ? subjectsById.get(ref) : undefined;
  // ... render ...
}
```

### 4. Transitive includes with `:iterate`

When a Patient's `generalPractitioner` also needs resolving, add a second
`include` with `{ iterate: true }`. The server follows the chain on
your behalf.

```ts
const page = await fhir
  .search("Observation")
  .where("code", "eq", "8480-6")
  .include("subject")
  .include("subject", { iterate: true }) // pulls Patient.generalPractitioner
  .count(500)
  .execute();
```

### 5. Pick a strategy by cardinality

| Unique refs | Strategy |
| --- | --- |
| 1–20 | Parallel `Promise.all` of `read()` |
| 20–200 | Bounded-concurrency pool (8–16 workers) |
| 200+ or `_include` target is always the same type | `_include` in the search |
| Mixed target types | `_include` (server dedupes across types) |
| Need the Patient's `generalPractitioner` too | `_include:iterate` |

## Final snippet

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});

export async function resolveObservationSubjects(
  observations: readonly { subject?: { reference?: string } }[],
): Promise<Map<string, unknown>> {
  const refs = new Set<string>();
  for (const o of observations) {
    if (o.subject?.reference) refs.add(o.subject.reference);
  }
  if (refs.size === 0) return new Map();

  // Threshold: below 50 unique refs, parallel reads are cheaper than
  // re-issuing the search with _include.
  const THRESHOLD = 50;

  if (refs.size <= THRESHOLD) {
    const entries = await mapWithConcurrency(Array.from(refs), 8, async (fullRef) => {
      const [type, id] = fullRef.split("/");
      if (type !== "Patient" || !id) return [fullRef, undefined] as const;
      try {
        const patient = await fhir.read("Patient", id).execute();
        return [fullRef, patient] as const;
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 404 || status === 410) return [fullRef, undefined] as const;
        throw err;
      }
    });
    return new Map(entries);
  }

  // Large cardinality — re-run the search with _include so the server dedupes.
  const enriched = await fhir
    .search("Observation")
    .whereIn(
      "_id",
      observations
        .map((o) => (o as { id?: string }).id)
        .filter((id): id is string => typeof id === "string"),
    )
    .include("subject")
    .execute();

  const byRef = new Map<string, unknown>();
  for (const inc of enriched.included ?? []) {
    const id = (inc as { id?: string }).id;
    if (id) byRef.set(`${(inc as { resourceType: string }).resourceType}/${id}`, inc);
  }
  return byRef;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}
```

## Troubleshooting

- **`Promise.all` throws on the first 404** → add a per-item `.catch()`
  that swallows 404/410 (deleted targets), rethrows other statuses.
- **Server rate-limits you** → cap concurrency. Retry-after will come
  through as `FhirRequestError.status === 429`; the client's `retry`
  config (`retry: { retryStatuses: new Set([429, 503]) }`) handles it
  automatically but only up to `maxAttempts`.
- **`_include` brings back nothing** → the server may use `searchset`
  bundle shapes that put includes in `entry[].search.mode === "include"`
  which `unwrapBundle` already splits. If `page.included` is empty,
  confirm the server actually honours `_include` with a raw curl.
- **Cross-type references (`subject` could be Patient or Group)** → use
  the `Reference<T>` narrowing: check `o.subject?.type` before the
  split, or parse `reference` and dispatch on the type prefix.
- **`_include` blows past the 1900-byte URL cap** → the builder auto-
  upgrades to `POST _search` at the threshold (see edge cases). If the
  server rejects POST search, chop the `whereIn` into batches.
