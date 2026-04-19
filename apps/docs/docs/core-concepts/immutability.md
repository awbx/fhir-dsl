---
id: immutability
title: Immutable Builders
sidebar_label: Immutability
sidebar_position: 5
---

# Immutable Builders

Every chainable method on every fhir-dsl builder returns a **new instance**. The builder you started with is never mutated. This section explains why that matters, how to exploit it, and the composition patterns it unlocks.

## The rule

Each call clones the builder state and constructs a fresh instance. From `packages/core/src/search-query-builder.ts` (and the analogous transaction / batch builders):

```typescript
// Inside every .where(), .include(), .sort(), .count(), etc.
return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
  this.#state.resourceType,
  this.#executor,
  { ...this.#state, /* new slice */ },
  undefined,
  this.#urlExecutor,
  this.#schemas,
);
```

There is no `this.#state = ...` anywhere. The constructor is the only thing that writes state, and it runs once per new builder. The same pattern holds for `TransactionBuilderImpl`, `BatchBuilderImpl`, `ReadQueryBuilderImpl`, and so on.

## Why immutable?

Three concrete wins:

1. **Forking.** A partial builder is a reusable fragment. Call `.where(...)` again on the same base to produce a sibling.
2. **Re-use across requests.** Store a pre-built base in a module constant, refine per-request, fire many `execute()`s.
3. **Composition.** `$if()` and `$call()` can hand the builder to arbitrary callbacks without risk; the caller is guaranteed not to see the callback's edits unless it chooses to.

## Forking

```typescript
const activePatients = fhir.search("Patient").where("active", "eq", "true");

// Branch — neither call mutates `activePatients`
const smiths = await activePatients.where("family", "eq", "Smith").execute();
const jones  = await activePatients.where("family", "eq", "Jones").execute();

// Still usable unchanged
const everyone = await activePatients.count(100).execute();
```

Because builders are cheap (they hold a state object, a couple of references, and nothing else), forking has negligible cost.

:::note Gotcha — do not treat chained calls as "apply to self"
If you come from a jQuery / Express style, you might write:
```typescript
const qb = fhir.search("Patient");
qb.where("active", "eq", "true");   // ← does nothing to `qb`!
qb.count(10);                       // ← also does nothing
await qb.execute();                 // still an unfiltered, uncounted search
```
You must assign the return value: `const qb2 = qb.where(...).count(...)`.
:::

## Reuse across requests

A partial builder can live in a module scope and be refined per handler call:

```typescript
// shared/queries.ts
export const recentObservations = (fhir: FhirClient<Schema>) =>
  fhir
    .search("Observation")
    .whereLastUpdated("ge", new Date(Date.now() - 86_400_000).toISOString())
    .sort("date", "desc")
    .count(50);

// handlers/patient.ts
app.get("/patient/:id/labs", async (req, res) => {
  const page = await recentObservations(fhir)
    .where("subject", "eq", `Patient/${req.params.id}`)
    .where("category", "eq", "laboratory")
    .execute();
  res.json(page.data);
});

// handlers/vitals.ts
app.get("/patient/:id/vitals", async (req, res) => {
  const page = await recentObservations(fhir)
    .where("subject", "eq", `Patient/${req.params.id}`)
    .where("category", "eq", "vital-signs")
    .execute();
  res.json(page.data);
});
```

The `recentObservations` fragment is never mutated; every handler forks it.

## Composition: `$if` and `$call`

Two universal helpers are exposed on every builder (`search`, `read`, `transaction`, `batch`). They exist specifically because builders are immutable — otherwise they would not be safe.

### `$if(condition, callback)` — optional fragments

Applies the callback only when `condition` is truthy; otherwise returns `this` unchanged:

```typescript
async function search(query: { name?: string; bornAfter?: string }) {
  return fhir
    .search("Patient")
    .$if(Boolean(query.name),      (qb) => qb.where("family",    "eq", query.name!))
    .$if(Boolean(query.bornAfter), (qb) => qb.where("birthdate", "ge", query.bornAfter!))
    .count(25)
    .execute();
}
```

No spread-and-reassign; no temporary `let qb = ...`. The callback receives the same `this` type via polymorphic `this`, so every generic slot (`Inc`, `Prof`, `Sel`) narrows correctly inside the callback body.

### `$call(callback)` — always-apply transformers

Always runs the callback and returns whatever it returns:

```typescript
// A reusable fragment, typed generically
const onlyFinal = <QB extends SearchQueryBuilder<any, any, any, any, any, any>>(qb: QB): QB =>
  qb.where("status", "eq", "final") as QB;

const labs = await fhir
  .search("Observation")
  .where("category", "eq", "laboratory")
  .$call(onlyFinal)
  .execute();

const vitals = await fhir
  .search("Observation")
  .where("category", "eq", "vital-signs")
  .$call(onlyFinal)
  .execute();
```

`$call` can also return a non-builder — it is typed as `$call<R>(cb: (qb: this) => R): R`. This lets you commit to the compiled plan mid-chain:

```typescript
const plan = fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .$call((qb) => qb.compile());
// plan: CompiledQuery, not a builder
```

## Transactions and batches

The same immutability rule holds for `TransactionBuilder` and `BatchBuilder`. Each `.create(...)`, `.update(...)`, `.delete(...)` call clones the pending entry list:

```typescript
const base = fhir.transaction().create({ resourceType: "Patient", /* ... */ });

// Two independent transactions — both include the Patient, each adds a different Observation
const withBp = base.create({ resourceType: "Observation", code: /* BP */ });
const withHr = base.create({ resourceType: "Observation", code: /* HR */ });

await withBp.execute();
await withHr.execute();
// `base` still has exactly one pending entry; withBp and withHr each have two.
```

`$if` and `$call` work here too:

```typescript
const tx = fhir
  .transaction()
  .create(patient)
  .$if(wantObservation, (t) => t.create(observation))
  .$call((t) => t.update(updatedMedication));

await tx.execute();
```

## Interaction with generics

Because builders thread their full type state through the six generics (see [Types & Generics](./types-and-generics.md)), immutability is what keeps the generic chain narrow inside `$if` and `$call`. If the builder mutated, the callback would have to decide whether to return the (mutated) `this` or a new instance; with immutability, the signature `(qb: this) => this` is honest and the callback cannot accidentally widen the type.

This is exactly the Kysely pattern: `<DB, TB, O>` carried through every call, with no mutation at runtime.

## Summary

- Builders are cloned on every chainable call; the original is never touched.
- Fork freely — each branch is independent and cheap.
- Assign the return value every time. A bare `qb.where(...)` is a dropped value.
- `$if` and `$call` are the blessed composition escape hatches and exist **because** builders are immutable.
- Storing a partial builder as a module constant and refining per handler is idiomatic.
