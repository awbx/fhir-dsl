---
id: overview
title: Core Concepts
description: The three pillars of fhir-dsl — typed builders, the SpecCatalog-driven generated schema, and the async compile/execute contract.
sidebar_label: Overview
sidebar_position: 1
---

# Core Concepts

fhir-dsl is a Kysely-inspired, type-safe FHIR client. It is **generator-first**: the CLI reads official FHIR StructureDefinitions (R4 / R4B / R5 / R6) plus any Implementation Guides you pass, emits a `FhirSchema` type, and hands that schema to `createFhirClient`. Every subsequent `.search()`, `.read()`, `.create()`, `.transaction()` call is then statically validated against the schema — wrong resource names, wrong search params, wrong operators, and wrong value types all fail at compile time rather than against a running server.

## The mental model

Every query flows through the same pipeline, and every stage is inspectable:

```
  FHIR StructureDefinitions + IGs
              │
              ▼  (build time, one-shot)
       @fhir-dsl/cli ──► generates ──► FhirSchema + Resource types
                                                 │
                                                 ▼  (runtime)
    createFhirClient<FhirSchema>(cfg)  ──► fhir.search("Patient")
                                                 │
                                                 │  .where(...).include(...).select(...)
                                                 ▼
                               SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>
                                                 │
                                                 │  .compile()
                                                 ▼
                               CompiledQuery { method, path, params, headers, body }
                                                 │
                                                 │  .execute()  →  fetch()
                                                 ▼
                              HTTP 200 + Bundle     │    HTTP 202 + Content-Location
                                                 │         │
                                                 │         ▼ poll (Retry-After)
                                                 │    HTTP 200 + Bundle
                                                 ▼
                              SearchResult<Primary, Included>  — fully typed
```

`.compile()` returns the plan (no network I/O). `.execute()` runs it. `.stream()` yields pages lazily. You can log the `CompiledQuery`, replay it in tests, or hand it to your own fetch layer.

## Two phases

### Phase 1 — generate (build time)

```bash
fhir-gen generate --version r4 --out ./src/fhir --ig hl7.fhir.us.core@6.1.0
```

Produces, under `./src/fhir/r4/`:

- `resources/*.ts` — an interface per resource, with typed `Reference<T>` fields.
- `search-params/*.ts` — `{ type, value }` metadata records keyed by resource.
- `profiles/*.ts` — narrowed resource shapes per profile (US Core, etc.).
- `schemas/*.ts` — Standard Schema v1 validators (`--validator zod|native`).
- `client.ts` — the `FhirSchema` type that wires all four registries together.

The CLI is a thin commander wrapper over `generate(options)` (`packages/cli/src/commands/generate.ts`), so anything the CLI does you can do from a build script.

:::note Gotcha — per-version types
`SpecCatalog` (`packages/generator/src/spec/catalog.ts`) is the single source of truth for type resolution and is built fresh for each FHIR version (R4 / R4B / R5 / R6). Generate against the version your server speaks; re-generate when it upgrades.
:::

### Phase 2 — query (runtime)

```typescript
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir/r4/client";

const fhir = createFhirClient<FhirSchema>({ baseUrl: "https://hapi.fhir.org/baseR4" });

const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();
// result.data     : Patient[]
// result.included : (Practitioner | Organization | PractitionerRole)[]
// result.total    : number | undefined
```

`createFhirClient<S>` is defined in `packages/core/src/fhir-client.ts` and returns a `FhirClient<S>` whose surface is: `search`, `read`, `vread`, `history`, `capabilities`, `transaction`, `batch`, `operation`, `create`, `update`, `delete`, `patch`.

:::note Gotcha — the schema is a type, not a runtime value
`FhirSchema` is a pure TypeScript type. You pass it as a generic (`createFhirClient<FhirSchema>(...)`), not as a value. There is nothing to import at runtime from it; the client works against whatever the server returns. Validation is opt-in via `schemas` on the client config.
:::

## Client, builder, execution

The three layers map cleanly to three questions:

1. **Client — what can I call?** `FhirClient<S>` (`packages/core/src/fhir-client.ts`) exposes one method per REST interaction. It holds no per-query state; each method returns a builder.
2. **Builder — what does the request look like?** Every builder is immutable (see [Immutable Builders](./immutability.md)). Chaining produces a new instance and threads new type information through the generics. Call `.compile()` to see the plan.
3. **Execution — what came back?** `.execute()` runs the compiled query, unwraps bundles into `SearchResult`, polls 202 async jobs when configured (see [Async Pattern](./async-pattern.md)), and throws `FhirRequestError` on non-2xx.

```typescript
// 1. Client
const fhir = createFhirClient<FhirSchema>({ baseUrl });

// 2. Builder (immutable; returns a new instance on every call)
const builder = fhir.search("Patient").where("family", "eq", "Smith");

// 3. Execution
const plan = builder.compile();      // CompiledQuery — no I/O
const page = await builder.execute(); // SearchResult<Patient>
```

:::note Gotcha — search params are `{ type, value }` objects, not bare strings
`S["searchParams"][RT][K]` is always `{ type: "string" | "token" | "date" | "number" | "quantity" | "reference" | "uri" | "composite" | "special"; value: <primitive> }`. The `type` discriminator is the pivot that lets `SearchPrefixFor<P>` pick the right operator union without listing every param by name (`packages/core/src/types.ts:74`). See [Types & Generics](./types-and-generics.md).
:::

## Compile vs execute

Every builder splits **planning** from **running**:

```typescript
// Inspect — no network I/O
const q = fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .compile();
// q = { method: "GET", path: "Patient", params: [{ name: "family", value: "Smith" }] }

// Run — fires fetch, parses bundle, returns typed result
const r = await fhir.search("Patient").where("family", "eq", "Smith").execute();
```

`CompiledQuery` is `{ method, path, params, headers?, body? }` (`packages/core/src/compiled-query.ts`). Logging it, diffing it in tests, or handing it to a custom transport are all first-class workflows.

:::note Gotcha — `.usePost()` silently auto-upgrades at 1900 UTF-8 bytes
When the serialized GET URL (`resourceType + "?" + query string`, measured in UTF-8 bytes) would exceed **1900 bytes**, `.compile()` switches to `POST <Resource>/_search` with `Content-Type: application/x-www-form-urlencoded`. `_format` and `_pretty` stay on the URL; everything else moves to the body. Source: `packages/core/src/search-query-builder.ts:61` (`DEFAULT_AUTO_POST_THRESHOLD = 1900`). Override with `.usePost()` (force now) or `.getUrlByteLimit(bytes)` (raise/lower the ceiling — despite the name, this is a *setter* that returns a new builder).
:::

## Why not raw FHIR REST?

Raw FHIR REST is string concatenation. You URL-encode commas (but not always — §3.1.0.1.5.7 has separator rules), decide when to promote a long GET to `POST _search`, expand `_include` targets into concrete resource types by hand when unpacking the bundle, and keep `:not` vs `_filter ne` null semantics straight. fhir-dsl folds all of that into typed methods:

- **Query-string composition** — `where(name, op, value)` routes prefixes (`gt`, `le`, …) to the value and modifiers (`:exact`, `:not`, …) to the name; you never glue `:missing=true` onto a param by hand.
- **Bundle handling** — `.execute()` unwraps the `searchset` Bundle into `{ data, included, total, link, raw }`, splitting entries by `entry.search.mode === "include"`. The raw bundle is still available on `result.raw`.
- **`_include` / `_revinclude` expansion** — the `Inc` generic slot tracks every include you add, so `result.included` is a typed union of the exact resources the server will return.
- **Transport upgrades** — GET → POST auto-switch, redirect-safe auth stripping (`packages/runtime/src/executor.ts`), and async-pattern polling (202 → `Content-Location`) all happen below the builder surface.

## When NOT to use fhir-dsl

fhir-dsl is oriented at **application code** that speaks FHIR against a known schema: EHR integrations, SMART apps, ingestion pipelines, internal tools. It is less suited for:

- **Schema-less relay proxies** — if your service blindly forwards whatever clients send, you do not benefit from generating types.
- **Ad-hoc one-off scripts** where you would rather `curl` a URL than run a codegen step.
- **Servers implementing FHIR** (as opposed to consuming it) — the builder is a client DSL; use a dedicated server toolkit for the inbound side.
- **Dynamically discovered schemas** where the resource shape is not known until runtime. `FhirSchema` is compile-time by design; a fully runtime-typed client would erase the whole value proposition. For those cases, drop down to the raw `CompiledQuery` plus `FhirExecutor` and skip the builder.
