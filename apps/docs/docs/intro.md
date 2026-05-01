---
id: intro
title: Introduction
sidebar_label: Introduction
description: Type-safe FHIR query builder and code generator for TypeScript, inspired by Kysely.
slug: /
---

# fhir-dsl

Type-safe FHIR queries in TypeScript, with types generated straight from the official FHIR StructureDefinitions and any Implementation Guide you point it at.

## What you get

- **Compile-time checked queries** — resource types, search parameters, operators, includes, chained params, `_has`, composites, and profile fields are all narrowed by TypeScript before you ever hit the network.
- **A generator, not a schema download** — `@fhir-dsl/cli` emits real `.ts` files into your repo from FHIR R4/R4B/R5/R6 plus any `hl7.fhir.*` IG package; optional Standard Schema validators (zod or zero-dep native) come with the same flag.
- **A Kysely-style fluent builder** — immutable, composable, with `.include()` / `.revinclude()` / `.whereChained()` / `.has()` / `.transaction()` / `.batch()` / `.operation()` plus `$if` / `$call` escape hatches.
- **Typed FHIRPath** — proxy-based expression builder with autocomplete on every step, native UCUM-aware Quantity comparisons (`5 'mg' = 0.005 'g'` is `true`), `setValue` / `createPatch` write-back, and a synchronous resolver hook for terminology functions.
- **Unified error handling** — every error in the monorepo extends `FhirDslError` with a `kind` discriminator, structured `context`, and `toJSON()` for transport-safe serialisation. A `Result<T, E>` + `tryAsync` toolkit gives Effect-style typed handling without `try`/`catch`.

## Stability

**v1.0.0 shipped on 2026-05-01.** The public surface across all 10 packages is locked at the [`surface-v1.0.0`](https://github.com/awbx/fhir-dsl/releases/tag/surface-v1.0.0) tag — minor releases add to it, patch releases fix bugs in it, breaking changes wait for v2. The CI gate (`pnpm audit:export-surface:check`) blocks accidental drift on every PR.

## 60 seconds in

```ts
import { createClient } from "./fhir/r4";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
});

const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data: Patient[]
// result.included: (Practitioner | Organization)[]
// result.total?: number
for (const p of result.data) console.log(p.name?.[0]?.family);
```

The `./fhir/r4` import is produced by one CLI call — see [Quick Start](/docs/getting-started/quick-start).

## Next

- [Installation](/docs/getting-started/installation) — packages, peer versions, and the full `generate` flag set.
- [Quick Start](/docs/getting-started/quick-start) — under five minutes from install to typed response.
- [Core Concepts](/docs/core-concepts/overview) — how the schema, search-param discriminator, and profile narrowing thread together.
- [Error Handling](/docs/guides/error-handling) — `FhirDslError` contract and the `Result<T, E>` toolkit.
- [FHIRPath + Query Builder](/docs/guides/fhirpath-and-queries) — server-side `_filter`, post-fetch projection, write-back, terminology hooks, UCUM-aware Quantity comparisons.
- [Roadmap](/docs/roadmap) — what shipped on the v1.x line and what's queued for v2.
