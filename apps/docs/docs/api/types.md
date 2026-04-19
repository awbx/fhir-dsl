---
sidebar_position: 8
title: "@fhir-dsl/types"
description: "Base FHIR datatypes, primitives, and the SearchParam discriminated union — shared by generated code and the core DSL."
---

# @fhir-dsl/types

## Overview
`@fhir-dsl/types` defines the base FHIR datatypes (`Reference`, `Coding`, `CodeableConcept`, `Quantity`, `Bundle`, `Parameters`, …), the primitive type aliases (`FhirString`, `FhirInteger`, `FhirDate`, …), and the `SearchParam` discriminated union that drives the core query builder's operator and modifier inference. This package does **not** contain generated resource types — users generate those via `fhir-gen generate` into their own project. `Reference<T>`, `Coding<T>`, and `CodeableConcept<T>` are generic so the generator can narrow references and bindings at each point of use.

## Installation
```bash
npm install @fhir-dsl/types
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `Element` / `Extension` / `BackboneElement` | interface | Base element shapes. |
| `Reference` | interface | `Reference<T extends string = string>` — `type` narrows to a resource-type union. |
| `Coding` / `CodeableConcept` | interface | Generic on a string union so ValueSet expansions can narrow `code`. |
| `Identifier` / `Period` / `HumanName` / `Address` / `ContactPoint` | interface | Complex datatypes. |
| `Quantity` / `Range` / `Ratio` / `Duration` / `Age` / `SimpleQuantity` / `Money` / `Attachment` / `Annotation` / `SampledData` | interface | Measurement + auxiliary datatypes. |
| `ContactDetail` / `UsageContext` / `RelatedArtifact` / `Expression` / `TriggerDefinition` / `DataRequirement` | interface | Metadata datatypes. |
| `Narrative` / `Meta` | interface | Resource metadata. |
| `Resource` / `DomainResource` | interface | Base resource types. |
| `Bundle` / `BundleLink` / `BundleEntry` | interface | FHIR Bundle shape. |
| `Parameters` / `ParametersParameter` | interface | Parameters resource. |
| `Timing` / `TimingRepeat` / `Dosage` / `DosageDoseAndRate` | interface | Time/dosage datatypes. |
| Primitive aliases — `FhirString`, `FhirBoolean`, `FhirDate`, `FhirDateTime`, `FhirInstant`, `FhirDecimal`, `FhirInteger`, `FhirPositiveInt`, `FhirUnsignedInt`, `FhirCode`, `FhirUri`, `FhirUrl`, `FhirCanonical`, `FhirId`, `FhirOid`, `FhirUuid`, `FhirMarkdown`, `FhirBase64Binary`, `FhirTime`, `FhirXhtml` | type | Primitives keyed on the underlying JS type (`string`, `number`, `boolean`). |
| `SearchParam` / `StringParam` / `TokenParam` / `DateParam` / `ReferenceParam` / `QuantityParam` / `NumberParam` / `UriParam` / `CompositeParam` / `SpecialParam` | type | The discriminated union that `SearchPrefixFor` pivots on. |

## API

### Entry points per FHIR version
Resource and profile types are emitted into the user's project by `fhir-gen generate`. Typical layout:

```text
src/fhir/
  r4/                ← generated for FHIR R4
    client.ts        ← createClient() returning a typed FhirClient<Schema>
    schema.ts        ← the Schema passed to FhirClient's generic
    resources/       ← Patient.ts, Observation.ts, ...
    profiles/
    search-params/
    schemas/         ← Standard Schema validators (when --validator is used)
```
The CLI supports `--version r4 | r4b | r5 | r6` — generate one directory per version you use. Nothing in `@fhir-dsl/types` is version-specific; the version selection happens at generation time.

**Example**
```ts
// Generate R4 once
// $ fhir-gen generate --version r4 --out ./src/fhir/r4

import { createClient } from "./src/fhir/r4/client";
import type { Patient } from "./src/fhir/r4/resources/Patient";

const fhir = createClient({ baseUrl: "https://hapi.fhir.org/baseR4" });
const patient: Patient = (await fhir.read("Patient", "123").execute());
```

---

### `Resource` union and `Reference<T>`
**Signature**
```ts
interface Resource {
  resourceType: string;
  id?: FhirId;
  meta?: Meta;
  implicitRules?: FhirUri;
  language?: FhirCode;
}
interface DomainResource extends Resource {
  text?: Narrative;
  contained?: Resource[];
  extension?: Extension[];
  modifierExtension?: Extension[];
}

interface Reference<T extends string = string> extends Element {
  reference?: FhirString;
  type?: T;
  identifier?: Identifier;
  display?: FhirString;
}
```
**Parameters**
- `Reference<T>` — The `type` field is narrowable to a resource-type literal union. The generator emits `subject: Reference<"Patient" | "Group" | "Device" | "Location">` on types that accept multiple targets, which is what lets `.include("subject")` infer the included resource's type.

**Example**
```ts
import type { Reference } from "@fhir-dsl/types";

const subject: Reference<"Patient"> = {
  reference: "Patient/123",
  type: "Patient",
  display: "Jane Doe",
};
```

---

### `Coding<T>` and `CodeableConcept<T>`
**Signature**
```ts
interface Coding<T extends string = string> extends Element {
  system?: FhirUri;
  version?: FhirString;
  code?: FhirCode<T>;
  display?: FhirString;
  userSelected?: FhirBoolean;
}
interface CodeableConcept<T extends string = string> extends Element {
  coding?: Coding<T>[];
  text?: FhirString;
}
```
**Example**
```ts
import type { CodeableConcept, Coding } from "@fhir-dsl/types";

type VitalSignsCode = "vital-signs" | "laboratory" | "imaging";
const category: CodeableConcept<VitalSignsCode> = {
  coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }],
};
```

**Notes** — When the generator resolves a binding to a ValueSet with `--expand-valuesets`, it plugs the code union into `T`, so `Observation.category` becomes `CodeableConcept<"vital-signs" | "laboratory" | ...>` at the edit point.

---

### `Bundle` / `BundleEntry`
**Signature**
```ts
interface Bundle extends Resource {
  resourceType: "Bundle";
  type: FhirCode<"document" | "message" | "transaction" | "transaction-response" | "batch" | "batch-response" | "history" | "searchset" | "collection">;
  timestamp?: FhirInstant;
  total?: FhirUnsignedInt;
  link?: BundleLink[];
  entry?: BundleEntry[];
}
interface BundleLink { relation: FhirString; url: FhirUri; }
interface BundleEntry {
  fullUrl?: FhirUri;
  resource?: Resource;
  search?: { mode?: FhirCode<"match" | "include" | "outcome">; score?: FhirDecimal };
  request?: { method: FhirCode<"GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "PATCH">; url: FhirUri; ifNoneMatch?: FhirString; ifModifiedSince?: FhirInstant; ifMatch?: FhirString; ifNoneExist?: FhirString };
  response?: { status: FhirString; location?: FhirUri; etag?: FhirString; lastModified?: FhirInstant; outcome?: Resource };
}
```

**Notes** — `BundleEntry` carries an optional `resource`; when you read a `Bundle<Patient | Observation>` you must discriminate on `entry.resource.resourceType` before narrowing.

---

### `Parameters` / `ParametersParameter`
**Signature**
```ts
interface Parameters extends Resource {
  resourceType: "Parameters";
  parameter: ParametersParameter[];
}
interface ParametersParameter {
  name: FhirString;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
  valueUri?: FhirUri;
  valueCode?: FhirCode;
  resource?: Resource;
  part?: ParametersParameter[];
}
```

---

### `SearchParam` discriminated union
**Signature**
```ts
interface StringParam    { type: "string";    value: string; }
interface TokenParam<T extends string = string>     { type: "token"; value: T; }
interface DateParam      { type: "date";      value: string; }
interface ReferenceParam { type: "reference"; value: string; }
interface QuantityParam  { type: "quantity";  value: string; }
interface NumberParam    { type: "number";    value: number | string; }
interface UriParam       { type: "uri";       value: string; }
interface CompositeParam<C extends Record<string, { type: string; value: string | number }> = Record<string, { type: string; value: string | number }>> {
  type: "composite";
  value: string;
  components: C;
}
interface SpecialParam   { type: "special";   value: string; }

type SearchParam =
  | StringParam
  | TokenParam
  | DateParam
  | ReferenceParam
  | QuantityParam
  | NumberParam
  | UriParam
  | CompositeParam
  | SpecialParam;
```
**Parameters** — Every search param is `{ type, value }`. The core type `SearchPrefixFor<P>` conditionally maps `P["type"]` to the operator + modifier union, so `where(name, op, value)` type-checks against the right prefix set without enumerating every param.

**Example**
```ts
// The Schema type you pass to FhirClient<S> looks like:
type Schema = {
  resources: { Patient: { resourceType: "Patient"; id?: string; name?: HumanName[] } };
  searchParams: {
    Patient: {
      family:    { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
      gender:    { type: "token"; value: "male" | "female" | "other" | "unknown" };
    };
  };
  includes: Record<string, never>;
  profiles: Record<string, never>;
};
```

**Notes** — The FHIR spec has several `Quantity`-shaped types (`Quantity`, `Duration`, `Age`, `Count`, `Distance`, `SimpleQuantity`, `Money`) — they are distinct TS types that differ only in `comparator` / `system` constraints; pick the right one for the semantics you mean.

---

### Primitive type aliases
**Signature**
```ts
type FhirString       = string;
type FhirBoolean      = boolean;
type FhirDate         = string;
type FhirDateTime     = string;
type FhirInstant      = string;
type FhirDecimal      = number;
type FhirInteger      = number;
type FhirPositiveInt  = number;
type FhirUnsignedInt  = number;
type FhirCode<T extends string = string> = T;
type FhirUri          = string;
type FhirUrl          = string;
type FhirCanonical    = string;
type FhirId           = string;
type FhirOid          = string;
type FhirUuid         = string;
type FhirMarkdown     = string;
type FhirBase64Binary = string;
type FhirTime         = string;
type FhirXhtml        = string;
```

**Notes** — These are plain aliases to `string` / `number` / `boolean`; the FHIR-level constraints (regex patterns, bounds) are enforced only by the generated Standard Schema validators, not the TypeScript type system.
