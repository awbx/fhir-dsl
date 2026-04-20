---
id: extending
title: "Extending `@fhir-dsl/core` — Consumer-Facing Helper Types"
sidebar_label: Extending (Helper Types)
description: "Kysely-style helper types for writing reusable, type-safe helpers on top of SearchQueryBuilder — AnySearchBuilder, SearchBuilderOf, FilterableBuilder, ResourceOf, IncludesOf."
---

# Extending `@fhir-dsl/core` — Consumer-Facing Helper Types

When you build your own abstractions on top of `SearchQueryBuilder` —
condition libraries, query composers, policy wrappers — you run into the same
problem every generic query builder has: **how do you accept "any builder"
without losing the caller's concrete type on the way back out?**

`@fhir-dsl/core` exports a Kysely-inspired set of type helpers so you don't
have to re-derive the answer. Pick the helper that matches your helper's
shape and you get zero-`any`, variance-safe composition.

## The five helpers

| Helper | What it is | When to use |
| --- | --- | --- |
| `AnySearchBuilder<S>` | Wildcard over every slot but the schema | Write helpers that take **any** builder, filter it, and hand it back |
| `SearchBuilderOf<S, RT>` | Wildcard bound to a known resource type | Helpers that only run on a specific resource (e.g. "must be an Encounter") |
| `FilterableBuilder<S, RT>` | Filter-only subset — no `.include()` / `.transform()` / `.execute()` | Pure predicates (nothing that terminates the chain) |
| `ResourceOf<QB>` | Extract `RT` from a builder | Read the resource type of the builder you were handed |
| `IncludesOf<QB>` | Extract the current include-map | Read which references have been `.include()`d |

All five come from `@fhir-dsl/core` — the same module that exports
`SearchQueryBuilder`.

```ts
import type {
  AnySearchBuilder,
  FilterableBuilder,
  IncludesOf,
  ResourceOf,
  SearchBuilderOf,
} from "@fhir-dsl/core";
```

## Why you need a wildcard: the variance trap

The naive approach fails:

```ts
// ❌ Breaks as soon as the caller .include()s anything
function applyFilters<S extends FhirSchema, RT extends string>(
  qb: SearchQueryBuilder<S, RT>,
  conditions: readonly ((q: SearchQueryBuilder<S, RT>) => SearchQueryBuilder<S, RT>)[],
): SearchQueryBuilder<S, RT> {
  // ...
}
```

`SearchQueryBuilder` carries six generics (`S`, `RT`, `SP`, `Inc`, `Prof`,
`Sel`). The moment the caller does `.include("patient")`, `Inc` widens, and
your signature — which froze the generics at the call site — stops matching.
TypeScript either rejects the call or collapses the return type to something
useless.

The fix is a **wildcard upper bound**:

```ts
// ✅ Preserves the caller's full builder type
function applyFilters<QB extends AnySearchBuilder>(
  qb: QB,
  conditions: readonly ((q: QB) => QB)[],
): QB {
  let out = qb;
  for (const c of conditions) out = c(out);
  return out;
}
```

`AnySearchBuilder` is structurally compatible with every concrete
`SearchQueryBuilder`, so the constraint accepts anything the caller hands you.
The `QB` generic then captures the caller's exact type and flows through the
return — so `.include()` and `.transform()` stay available after the call.

## Worked example — a reusable `applyFilters`

A policy-style helper that threads a list of conditions through a builder.
Zero `any`, full inference preserved:

```ts
import type { AnySearchBuilder, FhirSchema } from "@fhir-dsl/core";

type FhirCondition<S extends FhirSchema = FhirSchema> = (
  qb: AnySearchBuilder<S>,
) => AnySearchBuilder<S>;

function applyFilters<QB extends AnySearchBuilder>(
  qb: QB,
  conditions: readonly FhirCondition[],
): QB {
  let out = qb;
  for (const c of conditions) out = c(out) as QB;
  return out;
}

// Somewhere else — library of reusable filters
const isFinished: FhirCondition = (qb) => qb.where("status", "eq", "finished");
const recent: FhirCondition = (qb) => qb.where("date", "gt", "2024-01-01");

// Call site — post-call chaining still works
const rows = await fhir
  .search("Encounter")
  .$call((q) => applyFilters(q, [isFinished, recent]))
  .include("patient")
  .transform((t) => ({
    id: t("id", ""),
    patientId: t.ref("subject.reference"),
  }))
  .execute();
```

The `.include("patient")` call after `applyFilters` still activates path
auto-dereferencing inside `.transform()` — because `QB` carried the full
concrete builder through the helper.

## Resource-scoped helpers with `SearchBuilderOf<S, RT>`

When a helper only makes sense for one resource:

```ts
function onlyActivePatients<QB extends SearchBuilderOf<Schema, "Patient">>(qb: QB): QB {
  return qb.where("active", "eq", true) as QB;
}
```

The caller can't pass an Observation builder — TypeScript rejects it at the
call site.

## Filter-only helpers with `FilterableBuilder<S, RT>`

If your helper genuinely doesn't need `.include()` / `.transform()` /
`.execute()` / `.stream()`, use `FilterableBuilder<S, RT>` instead of
`SearchBuilderOf`. It exposes only the filter surface, which sidesteps the
variance trap entirely (no method on the filter surface references `Inc` or
`Scope`):

```ts
function addTenantScope<RT extends string>(
  qb: FilterableBuilder<Schema, RT>,
): FilterableBuilder<Schema, RT> {
  return qb.where("_tag", "eq", "tenant|acme");
}
```

## Introspection — `ResourceOf` and `IncludesOf`

When you need to branch on what kind of builder you got, extract the generics:

```ts
type MyBuilder = ReturnType<typeof buildQuery>;

type RT  = ResourceOf<MyBuilder>;   // e.g. "Encounter"
type Inc = IncludesOf<MyBuilder>;   // e.g. { patient: "Patient" }
```

Useful for writing typed serializers, cache keys, or row-shape derivations
that mirror the state of the builder.

## Picking the right helper

```
Is your helper filter-only (no terminal calls)?
├── Yes → FilterableBuilder<S, RT>
└── No  → Does it care which resource?
          ├── Yes → SearchBuilderOf<S, RT>
          └── No  → AnySearchBuilder<S>
```

When in doubt, start with `AnySearchBuilder<S>` — it's the most permissive
and the one that best preserves caller types through a helper.

## Migration from v0.22.0

`v0.22.0` shipped the helper types initially but `Scope` collapsed to `never`
against real generated schemas (the `includeExpressions` interface didn't
satisfy the internal `Record<string, unknown>` gate), which silently broke any
helper signature that referenced `AnySearchBuilder`. `v0.22.1` fixes the
underlying constraint and the wildcard now works as documented — no caller
code needs to change.

If you wrote a workaround (`SearchQueryBuilder<S, string, any, any, any, any>`
cast, or an ad-hoc wildcard interface), you can delete it in favor of
`AnySearchBuilder<S>`.
