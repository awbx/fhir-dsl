---
sidebar_position: 5
title: FHIRPath + Query Builder
description: How to combine @fhir-dsl/fhirpath with the @fhir-dsl/core query builder — server-side _filter, post-fetch projection, client-side filtering, and aggregates.
---

# FHIRPath + Query Builder

`@fhir-dsl/core` and `@fhir-dsl/fhirpath` ship as independent packages. There is **one built-in integration point** — `.filter(expr)` on the search builder — and everything else composes via plain JavaScript. This page lists every pattern, when to reach for it, and the gotchas.

## When to combine them

| You want to… | Use |
|---|---|
| Filter beyond what FHIR search params support, server-side | **Pattern A** — compile to `_filter` |
| Project / reshape data after it lands | **Pattern B** — post-fetch `expr.evaluate(resource)` |
| Drop rows client-side using a typed predicate | **Pattern C** — filter `result.data` with `.evaluate()` |
| Reduce a bundle to a summary (counts, sums) | **Pattern D** — `.aggregate()` on the result set |

FHIRPath is **not** a replacement for typed search params (`.where("family", "eq", "Smith")`). Use search params first; reach for FHIRPath only when search params can't express the question.

---

## Pattern A — FHIRPath → server-side `_filter`

**Problem.** The server supports `_filter`, but you don't want to hand-assemble a FHIRPath string.

**Code.**
```ts
import { fhirpath } from "@fhir-dsl/fhirpath";
import { createClient } from "./fhir/r4";

const client = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });

const officialFamilyIsSmith = fhirpath<"Patient">("Patient")
  .name.where(($) => $.use.eq("official"))
  .family.eq("Smith");

const result = await client
  .search("Patient")
  .filter(officialFamilyIsSmith)
  .execute();
```

**Expected wire URL.**
```
GET /Patient?_filter=Patient.name.where(use%20%3D%20%27official%27).family%20%3D%20%27Smith%27
```

**Explanation.** `.filter()` accepts either a raw string or anything with a `compile(): string` method. Passing a `FhirPathExpr` directly avoids the `.compile()` call at the call site and keeps your query end-to-end type-safe.

**Notes.**
- Not every server supports `_filter`. Check `CapabilityStatement.rest.searchParam` before committing to this path.
- The expression is sent verbatim — if the server rejects it, you'll get a `400 OperationOutcome`, not a TypeScript error.

---

## Pattern B — Post-fetch projection

**Problem.** You already have a `SearchResult`, and you want to pull out a specific nested field across every row without writing `.map().flat()` yourself.

**Code.**
```ts
import { fhirpath } from "@fhir-dsl/fhirpath";

const result = await client.search("Patient").count(50).execute();

const cityExpr = fhirpath<"Patient">("Patient").address.city;
const cities: unknown[] = result.data.flatMap((p) => cityExpr.evaluate(p));
```

**Expected output shape.**
```ts
// cities: ["Boston", "Austin", "Providence", ...]
```

**Explanation.** `.evaluate(resource)` returns a flat `unknown[]` (FHIRPath collection semantics — empty inputs produce empty outputs). Build the expression once outside the loop and reuse it; the ops array is compiled on construction, not on every call.

**Notes.**
- The return is `unknown[]`. Narrow with a predicate (`.filter((x): x is string => typeof x === "string")`) when you need a concrete type.
- `included` resources are separate from `data` — project over them too if you need cross-reference fields.

---

## Pattern C — Client-side filtering

**Problem.** The server returned 100 rows, and you want to keep only those satisfying a FHIRPath predicate that can't be expressed as a search param.

**Code.**
```ts
import { fhirpath } from "@fhir-dsl/fhirpath";

const result = await client.search("Observation").count(100).execute();

const highBloodPressure = fhirpath<"Observation">("Observation")
  .component.where(($) => $.code.coding.code.eq("8480-6"))
  .valueQuantity.value.where(($) => $.gt(140))
  .exists();

const matches = result.data.filter((r) => highBloodPressure.evaluate(r)[0] === true);
```

**Explanation.** A FHIRPath predicate returns a boolean as the first element of a single-item collection, so the idiomatic pattern is `.evaluate(r)[0] === true`. This runs locally — no extra HTTP round-trip — but it burns memory on rows you'll throw away. When the matching fraction is small, prefer Pattern A.

---

## Pattern D — Aggregates over the result set

**Problem.** You want a count, sum, or fold across a fetched bundle without a second request.

**Code.**
```ts
import { fhirpath, $total } from "@fhir-dsl/fhirpath";

const result = await client.search("Patient").count(1000).execute();

// Count patients with deceased = true
const deceasedCount = result.data.reduce(
  (n, p) => n + (p.deceasedBoolean === true ? 1 : 0),
  0,
);

// Or use FHIRPath's own aggregate over a nested collection on one resource:
const patient = result.data[0];
const addressCount = fhirpath<"Patient">("Patient")
  .address.aggregate(($) => $total.add(1), 0)
  .evaluate(patient);
// addressCount: [3] — always a single-element collection
```

**Explanation.** FHIRPath's `.aggregate(fn, init)` folds over a collection inside one resource; it is not a cross-resource reducer. For cross-resource folds (totals across `result.data`), plain `Array.reduce` is simpler and keeps types intact. Inside `.aggregate()`, `$total` is the current accumulator; `$this` is the current item.

---

## Cheatsheet

| Pattern | Runs | Builder hook | Fhirpath surface |
|---|---|---|---|
| A — `_filter` | server | `.filter(expr)` | `fhirpath<T>(rt)` + `.compile()` |
| B — project | client | none (pure TS) | `.evaluate(resource)` |
| C — filter | client | none (pure TS) | `.evaluate(resource)[0]` |
| D — aggregate | client | none (pure TS) | `.aggregate(fn, init)` or `Array.reduce` |

---

## Write-back: `setValue` and `createPatch`

Every typed builder leaf also exposes write helpers (v0.53.0+).

```ts
import { fhirpath } from "@fhir-dsl/fhirpath";
import type { Patient } from "./fhir/r4";

const path = fhirpath<Patient>("Patient")
  .name.where(($this) => $this.use.eq("official")).given;

// Returns a NEW resource (deep-cloned). The original is untouched.
const next = path.setValue(patient, ["Maximilian"]);

// Or emit an RFC 6902 JSON Patch document for transport / external apply.
const patch = path.createPatch(patient, ["Maximilian"]);
// [{ op: "add", path: "/name", value: [{ use: "official" }] },
//  { op: "add", path: "/name/0/given", value: ["Maximilian"] }]
```

**Supported subset.** Property navigation and `where($this => $this.field.eq(value))`, plus `and`-joined conjunctions of equalities. Filter ops (`first()`, `last()`, `index()`), `or`-joined predicates, and `not` throw `FhirPathSetterError` — they cannot be inverted into a partial template.

When the where()-matched element does not exist, the setter creates it with the predicate's fields populated (so `.where(use=official)` seeds `{ use: "official" }` into the array). The patch output collapses "create empty array" + "append template" into a single seeded `add` patch.

---

## Quantity comparisons (UCUM-aware, v1.1.0+)

`Quantity` equality and ordering go through a native UCUM core with no third-party dependency. Same-dimension values compare by their canonical SI value:

```ts
import { fhirpath } from "@fhir-dsl/fhirpath";

const obs = {
  resourceType: "Observation" as const,
  valueQuantity: { value: 5, unit: "mg" },
};

fhirpath<typeof obs>("Observation")
  .valueQuantity.where(($) => $.eq({ value: 0.005, unit: "g" }))
  .exists()
  .evaluate(obs);
// → [true]
```

**Coverage** — SI base units + prefixes, common healthcare units (`mmHg`, `mmol/L`, `mg/dL`, `[iU]`…), single-`/` compounds (`kg/m2`, `/min`), and the bracketed `mm[Hg]` form. `Quantity.code` is preferred over `Quantity.unit` when both are present (FHIR convention: code is the UCUM symbol, unit is the human display).

**Out of scope** — Offset units (Celsius, Fahrenheit) and logarithmic units (pH, decibel) throw `UcumError` at parse time so silent wrong answers don't slip through. Multi-`/` compound expressions like `mol/(L.s)` are not parsed; normalise upstream of FHIRPath if you hit them.

---

## Resolve and terminology hooks (v1.1.0+)

`resolve()` consults `EvalOptions.resolveReference` after the Bundle-walk path misses, so non-Bundle frames can still resolve references against an external store:

```ts
fhirpath<Observation>("Observation")
  .performer.resolve()
  .evaluate(obs, {
    resolveReference: (ref) => myCache.get(ref) ?? undefined,
  });
```

The terminology functions (`conformsTo`, `memberOf`, `subsumes`, `subsumedBy`) compile to spec-correct FHIRPath strings — so they round-trip through external evaluators — and at evaluate-time consult `EvalOptions.terminology`:

```ts
fhirpath<Patient>("Patient")
  .conformsTo("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
  .evaluate(patient, {
    terminology: {
      conformsTo: (resource, profileUrl) => myValidator(resource, profileUrl),
    },
  });
```

All resolver methods are synchronous; pre-resolve any network-bound terminology lookups into a local cache and expose them through these hooks. Missing methods throw `FhirPathEvaluationError` with a clear message naming the option field to populate.

---

## Gotchas

- **Empty propagates.** FHIRPath returns `[]` for missing properties, which means `empty()` / `exists()` / `.eq(x)` all behave predictably — but JS `undefined` checks do not translate. Never mix `x === undefined` into a FHIRPath chain; use `.exists()` / `.empty()`.
- **No string parser.** FHIRPath expressions currently have to be built via the typed proxy — you cannot pass a raw `"Patient.name.family='Smith'"` to `.evaluate()`. If you need to evaluate strings from `StructureDefinition.constraint.expression`, that isn't supported yet. For `_filter` only, a raw string still works via `.filter("name eq 'Smith'")`.
- **`.evaluate()` loses type info.** The return is `unknown[]`. If you need a typed projection, wrap the result in a narrowing guard.
- **Bundle size matters.** Pattern C evaluates per row; on 10k-row bundles that adds up. Prefer Pattern A (server-side) when the server supports it.
- **`_filter` isn't universal.** Many production servers disable it. Test with a `400` case before relying on it in a pipeline.

---

## Related

- [`@fhir-dsl/fhirpath` API reference](../api/fhirpath.md)
- [`@fhir-dsl/core` API reference](../api/core.md) — see `.filter()`, `.where()`, `.select()`
- [Error handling](./error-handling.md) — `FhirPathEvaluationError`, `FhirPathSetterError`, `UcumError` all extend `FhirDslError` with the `kind` discriminator and `Result<T, E>` integration
- [Edge cases](../edge-cases.md) — condition-tree compile paths and `_filter` server compat
- [LLM usage guide](../llm-usage.md) — safe generation patterns when producing this combination
