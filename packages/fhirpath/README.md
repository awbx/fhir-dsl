# @fhir-dsl/fhirpath

Type-safe FHIRPath expression builder for TypeScript with IDE autocomplete, compilation to FHIRPath strings, and runtime evaluation.

Covers ~85% of the official FHIRPath spec including 60+ functions, expression predicates, and operators.

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

## Supported Functions

Navigation, filtering, subsetting, string manipulation, math, type conversion, utility, and boolean operators — 60+ FHIRPath functions are supported. See the [FHIRPath docs](https://awbx.github.io/fhir-dsl/docs/fhirpath/overview) for the full list.

## Coverage Gaps

The evaluator targets a pragmatic subset of FHIRPath. The following are intentionally **not** implemented in v1; track issues for v2 if you hit one in production:

### UCUM (units of measure)

Same-dimension `Quantity` comparisons and conversions are supported via a
native UCUM core (no third-party deps). `5 'mg' = 0.005 'g'` evaluates
to `true`; `5 'mg' < 1 'g'` evaluates to `true`; `convert(760, 'mmHg', 'atm')`
returns ≈ 1.

Coverage:

- SI base units (m, g, s, mol, K, A, cd) and SI prefixes (n μ m c d k M G T)
- Common derived/healthcare units: L, Hz, Pa, N, J, W, V, Ω, mmHg, bar, atm
- Time: s, min, h, d, wk, mo, a (with conversion to seconds)
- Compound forms with one `/`: `mg/dL`, `mmol/L`, `/min`, `kg/m2`
- Bracketed UCUM specials: `mm[Hg]` → mmHg
- Quantity.code is preferred over Quantity.unit for unit lookup (FHIR
  convention: code is the UCUM symbol, unit is the human display)

Out of scope (parser throws `UcumError` to avoid silent wrong answers):

- Offset units: Celsius, Fahrenheit (not pure scale)
- Logarithmic units: pH, bel, decibel, neper
- Multi-`/` compound expressions like `mol/(L.s)`

For unsupported special units, normalise upstream of FHIRPath.

### FHIRPath functions not implemented at evaluate time

Tracked for post-v1 in [#52](https://github.com/awbx/fhir-dsl/issues/52). These compile to a valid expression string (so they round-trip through FHIRPath servers and `.compile()`), but `evaluate()` will throw `FhirPathEvaluationError` if reached:

- `resolve()` — would need a Bundle/reference resolver injected at evaluate time.
- `extension(url)` — partial; works for the common `extension.where(url=…)` shape but not the full StructureDefinition-aware variant.
- `descendants()` and `repeat(projection)` — recursion is bounded, but the operators are not surface-frozen for v1.
- `conformsTo(...)`, `memberOf(...)`, `subsumes(...)`, `subsumedBy(...)` — terminology-server-bound; out of scope for the in-process evaluator.

### Predicate and write-back caveats

- `setValue` / `createPatch` only invert `eq`-shaped predicates joined by `and`. `or`/`not` throw deliberately — there is no unique partial template to construct.
- `where()` predicates passed to evaluator do support the full op set; the restriction is specific to write-back.

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
