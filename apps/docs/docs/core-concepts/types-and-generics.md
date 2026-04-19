---
id: types-and-generics
title: Types and Generics
sidebar_label: Types and Generics
sidebar_position: 4
---

# Types and Generics

`SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>` carries **six** type parameters. Each slot tracks a different dimension of the query, and each chainable method mutates exactly one (or sometimes none) of them. Understanding the six slots is what unlocks the DSL: autocomplete, error messages, and result-type narrowing all flow from them.

```typescript
SearchQueryBuilder<
  S      extends FhirSchema,       // the generated schema registry
  RT     extends string,            // the resource type ("Patient", "Observation", ...)
  SP,                               // search params available on RT
  Inc    extends string  = never,   // union of include'd resource type names
  Prof   extends string | undefined = undefined,  // selected profile name
  Sel    extends string  = never    // union of .select()ed top-level fields
>
```

Source: `packages/core/src/query-builder.ts:116`.

## The six slots, one by one

### `S` — the schema

`S extends FhirSchema` is the generated registry (`{ resources, searchParams, includes, revIncludes?, profiles }`). You pass it exactly once, at client construction:

```typescript
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir/r4/client";

const fhir = createFhirClient<FhirSchema>({ baseUrl });
```

Everything downstream reads `S` to look up the resource interface, its search params, its include targets, and its profiles. `S` never changes mid-chain.

### `RT` — the resource type

`RT extends string` is set by `fhir.search(RT)` and is the string literal `"Patient"`, `"Observation"`, etc. The rest of the chain uses `RT` to key into `S["resources"][RT]`, `S["searchParams"][RT]`, and `S["includes"][RT]`.

```typescript
fhir.search("Patient")
// SearchQueryBuilder<FhirSchema, "Patient", SearchParamFor<S,"Patient">, never, undefined, never>

fhir.search("Observation")
// SearchQueryBuilder<FhirSchema, "Observation", SearchParamFor<S,"Observation">, never, undefined, never>
```

`RT` never changes mid-chain either.

### `SP` — the search params

`SP` starts as `SearchParamFor<S, RT>` = `S["searchParams"][RT]`. This gives the `where()` method its typed autocomplete:

```typescript
fhir.search("Patient").where("family", "eq", "Smith")
//                            ^^^^^^^^  autocomplete lists every key of S["searchParams"]["Patient"]
//                                      ^^^^  operator list narrows based on SP["family"]["type"] === "string"
//                                            → "eq" | "contains" | "exact"
```

The `type` discriminator on each search-param record is the pivot. `SearchPrefixFor<P>` (`types.ts:74`) maps `P["type"]` to the operator union:

```typescript
export type SearchPrefixFor<P> =
  P extends { type: "date" }      ? DatePrefix
  : P extends { type: "number" }   ? NumberPrefix
  : P extends { type: "quantity" } ? QuantityPrefix
  : P extends { type: "string" }   ? StringModifier
  : P extends { type: "token" }    ? TokenModifier
  : P extends { type: "reference" }? ReferenceModifier
  : P extends { type: "uri" }      ? UriModifier
  : "eq";
```

So TypeScript rejects `where("birthdate", "contains", "1990")` (contains is string-only), autocompletes `eq | ne | gt | ge | lt | le | sa | eb | ap` after `birthdate`, and infers `value: string` because `DateParam = { type: "date"; value: string }`.

`SP` does not change mid-chain — every resource carries one fixed search-param map.

:::note One snippet — the discriminator in action
```typescript
type PatientParams = {
  family:    { type: "string"; value: string };
  birthdate: { type: "date";   value: string };
  active:    { type: "token";  value: "true" | "false" };
};

// .where() overloads type-check against SP[K]["type"] and SP[K]["value"]:
.where("family",    "contains", "Smi")         // OK: contains ∈ StringModifier
.where("birthdate", "ge",       "1990-01-01")  // OK: ge ∈ DatePrefix
.where("active",    "eq",       "true")        // OK: "true" ∈ SP["active"]["value"]
.where("birthdate", "contains", "1990")        // ERROR: contains ∉ DatePrefix
.where("active",    "eq",       "maybe")       // ERROR: "maybe" ∉ "true" | "false"
```

**Gotcha.** This is also why user tests can write a minimal `TestSchema` by hand — any `{ type, value }` record satisfies the constraint. See `packages/core/src/fhir-client.test.ts:4–14`.
:::

### `Inc` — the `.include()` / `.revinclude()` slot

`Inc extends string` starts at `never` and **widens** every time you call `.include(...)` or `.revinclude(...)`. Each call unions in the target resource type names, which `ResolveIncluded<S, Inc>` then resolves into the union of included resource interfaces on the result.

```typescript
fhir.search("Observation")
// Inc = never → result.included: []

  .include("subject")
// Inc = "Patient" | "Group" | "Device" | "Location"

  .include("performer")
// Inc = "Patient" | ... | "Practitioner" | "PractitionerRole" | "Organization"

  .revinclude("Provenance", "target")
// Inc = ... | "Provenance"
```

On `.execute()`, `result.included` is typed as the union of every included resource:

```typescript
// result.included : (Patient | Group | Device | Location | Practitioner | ... | Provenance)[]
for (const inc of result.included) {
  // Narrow by discriminant:
  if (inc.resourceType === "Patient")    console.log(inc.name?.[0]?.family);
  else if (inc.resourceType === "Provenance") console.log(inc.recorded);
}
```

`.include()` gets this list from the generated `S["includes"][RT]` map, which the generator builds from each `Reference<...>` field's target list.

### `Prof` — `.withProfile()` and the `search()` overload {#prof---withprofile-and-search-overload}

`Prof extends string | undefined` starts as `undefined`. It is **not** widened mid-chain — it is *swapped* (and only once) by passing a profile name to `search()`:

```typescript
fhir.search("Patient")
// Prof = undefined → result type is the full Patient interface

fhir.search("Patient", "us-core-patient")
// Prof = "us-core-patient" → result type is S["profiles"]["Patient"]["us-core-patient"]
```

`ResolveProfile<S, RT, Prof>` (`types.ts:50`) looks up the profile, falling back to `S["resources"][RT]` when `Prof` is `undefined`. Profile-required fields (e.g. `gender` under US Core) become non-optional in the returned type.

:::note One gotcha — profile also retargets `.select()`
`.select()` is keyed to `ResolveProfile<S, RT, Prof>`, not the plain resource. So under a profile, you can only select fields the profile declares:
```typescript
fhir.search("Patient", "us-core-patient").select(["identifier", "gender"]);
//                                                 ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                 keys of USCorePatient, not plain Patient
```
:::

### `Sel` — `.select()` narrows the result shape

`Sel extends string` starts at `never`. `.select(fields)` sets `Sel` to the union of field names you passed. `ApplySelection<Prof, Sel>` (`query-builder.ts:30`) then narrows the result:

```typescript
export type ApplySelection<R, Sel extends string> = [Sel] extends [never]
  ? R
  : Prettify<Pick<R, Extract<Sel | "resourceType", keyof R>>>;
```

Translation: when `Sel = never`, you get the full resource; otherwise you get `Pick<R, Sel | "resourceType">` (the `resourceType` is always preserved because servers include it regardless).

```typescript
const slim = await fhir
  .search("Patient")
  .select(["id", "name", "birthDate"])
  .execute();
// slim.data[0] : { resourceType: "Patient"; id?: string; name?: HumanName[]; birthDate?: FhirDate }
```

:::note Gotcha — `.select()` replaces, not accumulates
Calling `.select()` a second time **replaces** `Sel` with the new union. This matches the wire behaviour (`_elements=...` only has one value). Source: `search-query-builder.ts:521`.
:::

At the wire level, `.select(["id","name"])` emits `_elements=id,name`:

```typescript
fhir.search("Patient").select(["id", "name"]).compile()
// → { method: "GET", path: "Patient",
//     params: [{ name: "_elements", value: "id,name" }] }
```

## The full picture

Every chainable method signature can now be read as a description of *which slot changes*:

```typescript
// From packages/core/src/query-builder.ts:116
where(...)         : SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>                 // nothing changes
whereMissing(...)  : SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>                 // nothing changes
include<K>(...)    : SearchQueryBuilder<S, RT, SP, Inc | NewTargets, Prof, Sel>    // Inc widens
revinclude<K>(...) : SearchQueryBuilder<S, RT, SP, Inc | SrcRT,      Prof, Sel>    // Inc widens
withProfile<P>(...): SearchQueryBuilder<S, RT, SP, Inc, P,           Sel>          // Prof swaps
select<K>(fields)  : SearchQueryBuilder<S, RT, SP, Inc, Prof,        K>            // Sel narrows
```

And the final `execute()` pulls every slot together:

```typescript
execute(): Promise<SearchResult<
  ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource,     // primary
  [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource // included
>>;
```

## IntelliSense walk-through

Watch the hovers as you chain:

```typescript
const b0 = fhir.search("Patient");
// b0: SearchQueryBuilder<Schema, "Patient", SearchParamFor<S,"Patient">, never, undefined, never>

const b1 = b0.where("family", "eq", "Smith");
// b1: same shape — `where` does not change any slot

const b2 = b1.include("general-practitioner");
// b2: Inc widens to "Practitioner" | "Organization" | "PractitionerRole"

const b3 = b2.select(["id", "name", "birthDate"]);
// b3: Sel narrows to "id" | "name" | "birthDate"

const result = await b3.execute();
// result.data[0]    : { resourceType: "Patient"; id?: ...; name?: ...; birthDate?: ... }
// result.included   : (Practitioner | Organization | PractitionerRole)[]
```

## Generic datatypes that feed the schema

Three datatypes are themselves generic, and the generator narrows them when it emits `S["resources"]`:

- **`Reference<T extends string = string>`** (`packages/types/src/datatypes.ts:209`) — `type?: T`. The generator emits `Observation.subject: Reference<"Patient" | "Group" | "Device" | "Location">`. That target list is what `.include("subject")` widens `Inc` with.
- **`Coding<T extends string = string>`** — `code?: T`. When a binding resolves to a VS, the generator plugs the code union in.
- **`CodeableConcept<T extends string = string>`** — `coding?: Coding<T>[]`.

The search-param types (`StringParam`, `TokenParam`, `DateParam`, …) in `packages/types/src/search-param-types.ts` are the `{ type, value }` metadata records that drive `SP` — the discriminator is the type, the payload shape lives on `value`.

## Working with the six-generic builder type

You usually do not write the full type by hand — the chain infers it. But when you need a helper that operates on any builder, use `any` for the slots you do not care about:

```typescript
import type { SearchQueryBuilder } from "@fhir-dsl/core";

function addRecent<QB extends SearchQueryBuilder<any, any, any, any, any, any>>(qb: QB): QB {
  return qb.whereLastUpdated("ge", new Date(Date.now() - 86_400_000).toISOString()) as QB;
}

const patients = await fhir.search("Patient").$call(addRecent).execute();
const obs      = await fhir.search("Observation").$call(addRecent).execute();
```

The `$call` escape hatch preserves every slot through polymorphic `this`, so the chain stays inferred after the generic helper runs. See [Immutable Builders](./immutability.md) for more on composition patterns.
