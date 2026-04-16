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

## Supported Functions

Navigation, filtering, subsetting, string manipulation, math, type conversion, utility, and boolean operators — 60+ FHIRPath functions are supported. See the [FHIRPath docs](https://awbx.github.io/fhir-dsl/docs/fhirpath/overview) for the full list.

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
