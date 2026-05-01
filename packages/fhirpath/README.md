# @fhir-dsl/fhirpath

Type-safe FHIRPath expression builder for TypeScript with IDE autocomplete, compilation to FHIRPath strings, and runtime evaluation.

Covers the pragmatic subset of the official FHIRPath spec that FHIR invariants and common navigation actually exercise — see the [coverage table](https://awbx.github.io/fhir-dsl/docs/fhirpath/overview#fhirpath-spec-coverage) for the canonical breakdown. Plus FHIR-specific extensions: native UCUM-aware `Quantity`, terminology resolver hooks, `setValue` / `createPatch` write-back, and synchronous `resolve()` against a Bundle frame or external store.

## Install

```bash
npm install @fhir-dsl/fhirpath @fhir-dsl/types
```

## Usage

### Build expressions with autocomplete

```ts
import { fhirpath } from "@fhir-dsl/fhirpath";
import type { Patient } from "./fhir/r4"; // generated types

const expr = fhirpath<Patient>("Patient").name.family;
expr.compile();  // "Patient.name.family"
```

Every step in the chain is type-checked — you get autocomplete for valid property names and can't navigate to fields that don't exist.

### Evaluate against resources

```ts
const families = fhirpath<Patient>("Patient").name.family.evaluate(patient);
// ["Smith", "Doe"]
```

### Expression predicates

Use `$this` for filtering with `where()`, `exists()`, `all()`, and more:

```ts
fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official")).given
  .compile();
// "Patient.name.where($this.use = 'official').given"
```

### Collection operations

```ts
fhirpath<Patient>("Patient").name.first().family.compile();
fhirpath<Patient>("Patient").name.count().compile();
fhirpath<Patient>("Patient").name.exists().compile();
fhirpath<Patient>("Patient").identifier.distinct().compile();
```

### String, math, and conversion functions

```ts
fhirpath<Patient>("Patient").name.family.upper().compile();
fhirpath<Patient>("Patient").name.family.startsWith("Sm").compile();
```

### `ofType()` for polymorphic fields

```ts
fhirpath<Observation>("Observation")
  .value.ofType("Quantity").value
  .compile();
// "Observation.value.ofType(Quantity).value"
```

### Write-back: `setValue` and `createPatch`

Every expression also exposes typed write helpers. `setValue` returns a new (deep-cloned) resource with the path updated; `createPatch` returns the equivalent RFC 6902 JSON Patch document.

```ts
const next = fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official")).given
  .setValue(patient, ["Maximilian"]);

const patch = fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official")).given
  .createPatch(patient, ["Maximilian"]);
// [{ op: "add", path: "/name", value: [{ use: "official" }] },
//  { op: "add", path: "/name/0/given", value: ["Maximilian"] }]
```

Supported subset: property navigation and `where($this => $this.field.eq(value))` (plus `and`-joined conjunctions of equalities). Filter ops (`first()`, `last()`, `index()`), `or`-joined predicates, and `not` throw `FhirPathSetterError` — they can't be inverted into a partial template.

## Evaluator hooks

`expr.evaluate(resource, options?)` accepts an `EvalOptions` argument so non-Bundle frames can still resolve references and terminology calls without a network round-trip:

```ts
fhirpath<Observation>("Observation")
  .performer.resolve()
  .evaluate(obs, {
    resolveReference: (ref) => myCache.get(ref) ?? undefined,
  });

fhirpath<Patient>("Patient")
  .conformsTo("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient")
  .evaluate(patient, {
    terminology: {
      conformsTo: (resource, profileUrl) => myValidator(resource, profileUrl),
    },
  });
```

All resolver methods are synchronous — pre-resolve any network-bound lookups into a local cache. `resolve()` consults `EvalOptions.resolveReference` only after the Bundle-walk path misses, so Bundle-rooted evaluations still work without configuration. `conformsTo` / `memberOf` / `subsumes` / `subsumedBy` compile to spec-correct strings (they round-trip through external evaluators) and dispatch through `EvalOptions.terminology` at evaluate-time. Missing methods raise `FhirPathEvaluationError` naming the option field to populate.

## Error classes

Every error this package raises extends [`FhirDslError`](https://awbx.github.io/fhir-dsl/docs/guides/error-handling) — pattern-match on `kind`, read structured `context`, and serialise with `toJSON()`:

| Class | `kind` | When |
|---|---|---|
| `FhirPathEvaluationError` | `fhirpath.evaluation` | Runtime evaluator errors (missing terminology resolver, malformed input, etc.) |
| `FhirPathSetterError` | `fhirpath.setter` | `setValue` / `createPatch` invoked on a non-invertible path |
| `FhirPathInvariantLexerError` | `fhirpath.invariant.lexer` | `compileInvariant()` lex failure |
| `FhirPathInvariantParseError` | `fhirpath.invariant.parser` | `compileInvariant()` parse failure |
| `FhirPathInvariantEvalError` | `fhirpath.invariant.evaluator` | `validateInvariants()` runtime failure |
| `UcumError` | `fhirpath.ucum` | UCUM parse/convert failures (offset units, multi-`/`, dimension mismatch) |

## Coverage gaps

The full coverage table — including the FHIR extensions (UCUM, write-back, `resolve()`, terminology) — lives in [the spec-coverage docs](https://awbx.github.io/fhir-dsl/docs/fhirpath/overview#fhirpath-spec-coverage). Items still pending:

- **`~` / `!~` (equivalence operators)** — tracked at [`spec-compliance.test.ts FP-EQ-003`](https://github.com/awbx/fhir-dsl/blob/main/packages/fhirpath/test/spec-compliance.test.ts).
- **UCUM offset / logarithmic units** — Celsius / Fahrenheit / pH / bel / dB throw `UcumError` at parse time so silent wrong answers don't slip through. Normalise upstream.
- **UCUM multi-`/` compound expressions** — `mol/(L.s)` is not parsed; single-`/` (`mg/dL`, `kg/m2`, `/min`) covers every healthcare case in current scope.
- **`setValue` / `createPatch`** only invert `eq`-shaped predicates joined by `and`. `or`-joined predicates, `not`, and filter ops (`first()`, `last()`, `index()`) throw `FhirPathSetterError` — there is no unique partial template to construct. Predicates passed to `evaluate()` have no such restriction.

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
