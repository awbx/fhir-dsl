# @fhir-dsl/types

Base TypeScript type definitions for FHIR resources, datatypes, and search parameters.

This package provides the foundational types used across the entire `fhir-dsl` ecosystem. It is automatically installed as a dependency of `@fhir-dsl/core`.

## Install

```bash
npm install @fhir-dsl/types
```

## What's Included

### FHIR Primitives

TypeScript type aliases for all FHIR primitive types:

```ts
import type { FhirString, FhirDateTime, FhirCode, FhirUri, FhirId } from "@fhir-dsl/types";
```

### Complex Datatypes

Interfaces for FHIR complex datatypes:

```ts
import type {
  Resource,
  Bundle,
  BundleEntry,
  HumanName,
  Address,
  ContactPoint,
  CodeableConcept,
  Coding,
  Identifier,
  Reference,
  Quantity,
  Period,
  Attachment,
  Extension,
  Meta,
  Narrative,
} from "@fhir-dsl/types";
```

### Search Parameter Types

Typed search parameter definitions used by the query builder:

```ts
import type {
  StringParam,
  TokenParam,
  DateParam,
  ReferenceParam,
  QuantityParam,
  NumberParam,
  UriParam,
  SearchParam,
} from "@fhir-dsl/types";
```

## Usage

These types are primarily consumed by other `@fhir-dsl` packages. For project-specific resource types (Patient, Observation, etc.), use [`@fhir-dsl/cli`](https://www.npmjs.com/package/@fhir-dsl/cli) to generate types from your target FHIR version and Implementation Guides.

```bash
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
