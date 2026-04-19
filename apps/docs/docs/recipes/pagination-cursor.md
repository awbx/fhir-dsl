---
sidebar_position: 4
title: "Cursor Pagination"
description: "Walk every page of a searchset using link.next, handling servers that omit total, cap _count silently, or hand back a missing next link."
---

# Cursor Pagination

## Problem

FHIR pagination is cursor-based: each page carries zero or more `link`
entries, and the one with `relation === "next"` points at the next
cursor. The spec lets servers omit `total`, cap `_count` below what you
asked for, omit `next` entirely on the last page, or even return a
`next` link on the last page that yields an empty bundle. A robust
client has to cope with all four.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`, `@fhir-dsl/runtime`
- Server: any FHIR server. HAPI emits `total` and consistent `next`;
  Epic and several vendors skip `total`; some cap `_count`.

## Steps

### 1. Prefer `stream()` for full-traversal

`SearchQueryBuilder.stream()` yields every match-mode resource across
every page and terminates on the first page without a `next` link. It
uses `paginate()` from `@fhir-dsl/runtime` under the hood, which detects
cycles (a page's `next` pointing back at an earlier URL) and halts.

```ts
import { createClient } from "./fhir/r4/client.js";

const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });

let count = 0;
for await (const p of fhir
  .search("Patient")
  .where("active", "eq", "true")
  .count(200)
  .stream()) {
  count++;
  if (count >= 10_000) break; // client-side upper bound
}
```

### 2. Don't trust `total`

`SearchResult.total` is optional. Servers may omit it, return an
`estimate`, or only compute an `accurate` total when you pass
`total("accurate")`.

```ts
const page = await fhir.search("Patient").count(50).execute();
console.log("total:", page.total ?? "unknown");

// Accurate total (server may still reject)
const accurate = await fhir.search("Patient").total("accurate").count(1).execute();
console.log("accurate total:", accurate.total);
```

### 3. Don't trust `_count`

Many servers cap page size at 100 or 1000 and silently apply that cap.
Defensive clients pass a conservative `.count()` and check
`page.data.length`.

```ts
const page = await fhir.search("Patient").count(500).execute();
console.log("requested 500, actually got:", page.data.length);
```

### 4. Drive pagination manually when you need per-page `included`

`stream()` yields only match entries. When you also need `_include`/
`_revinclude` rows, drive pagination manually with the runtime
`FhirExecutor` + `unwrapBundle` so each page's includes stay accessible.

```ts
import { FhirExecutor, unwrapBundle } from "@fhir-dsl/runtime";

const executor = new FhirExecutor({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});

let url: string | undefined = "Observation?code=8480-6&_include=Observation:subject&_count=50";
while (url) {
  const bundle = await executor.executeRequest<{
    resourceType: "Bundle";
    link?: { relation: string; url: string }[];
  }>({ method: "GET", path: url });
  const page = unwrapBundle(bundle as never);
  // page.data / page.included / page.total / page.link
  url = page.link?.find((l) => l.relation === "next")?.url;
}
```

### 5. Cycle protection

`paginate()` tracks visited `next` URLs and throws if the server points
back at a URL it has already issued. Broken servers (or mid-migration
load balancers) occasionally loop; this safety net prevents an infinite
fetch storm. If you drive pagination manually (Step 4), add the same
visited-set check yourself.

```ts
const visited = new Set<string>();
while (url) {
  if (visited.has(url)) throw new Error(`pagination cycle at ${url}`);
  visited.add(url);
  // ... fetch and advance `url = next` ...
}
```

## Final snippet

```ts
import { createClient } from "./fhir/r4/client.js";
import { FhirExecutor, unwrapBundle } from "@fhir-dsl/runtime";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.TOKEN! },
});

// Style A — fastest, matches only
export async function allActivePatients(): Promise<unknown[]> {
  const out: unknown[] = [];
  for await (const p of fhir
    .search("Patient")
    .where("active", "eq", "true")
    .count(200)
    .stream()) {
    out.push(p);
  }
  return out;
}

// Style B — per-page includes, manual cursor walk, cycle-safe
export async function observationsWithSubjects(): Promise<{
  observations: unknown[];
  subjects: unknown[];
}> {
  const executor = new FhirExecutor({
    baseUrl: "https://hapi.fhir.org/baseR4",
    auth: { type: "bearer", credentials: process.env.TOKEN! },
  });

  const visited = new Set<string>();
  let url: string | undefined =
    "Observation?code=8480-6&_include=Observation:subject&_count=50";

  const observations: unknown[] = [];
  const subjects: unknown[] = [];

  while (url) {
    if (visited.has(url)) throw new Error(`pagination cycle at ${url}`);
    visited.add(url);

    const bundle = await executor.executeRequest<never>({ method: "GET", path: url });
    const page = unwrapBundle(bundle);
    observations.push(...page.data);
    for (const inc of page.included ?? []) {
      if ((inc as { resourceType?: string }).resourceType === "Patient") subjects.push(inc);
    }
    url = page.link?.find((l) => l.relation === "next")?.url;
  }

  return { observations, subjects };
}
```

## Troubleshooting

- **Iterator never terminates** → check for a server that always emits
  `next`. `stream()` raises a cycle error once the same URL repeats;
  clamp with a client-side page counter as a belt-and-braces.
- **`page.total` is `0` but `page.data.length > 0`** → some servers
  treat `total: 0` as "not computed". Treat absent and zero equally;
  rely on `data.length`.
- **401 on the second page** → `next` pointed at a different origin;
  the executor stripped `Authorization` per RFC 6750 §5.3 (see the
  edge-cases page). Ask the server to emit same-origin `next` URLs.
- **Server caps `_count` at 100** → you asked 500, got 100. The builder
  honoured your request on the wire; the server imposed its own cap.
  Lower your asking price or pass `summary("count")` to only need the
  total.
- **Last page has `next` but is empty** → the cycle check lets this
  succeed once (one extra round trip). Check `page.data.length === 0`
  and break early if that matters for performance.
