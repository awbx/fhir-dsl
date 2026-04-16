# @fhir-dsl/core

A fully type-safe FHIR query builder for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Construct FHIR REST queries with compile-time safety for resource types, search parameters, includes, and profiles. No more guessing parameter names or hoping your query string is valid.

## Install

```bash
npm install @fhir-dsl/core @fhir-dsl/types
```

## Setup

### 1. Generate your FHIR types

Before using the query builder, generate typed definitions for your FHIR version and profiles using [`@fhir-dsl/cli`](../cli):

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

This generates a `FhirSchema` type along with typed resources, search parameters, profiles, and a pre-configured client — everything the query builder needs for compile-time safety.

### 2. Create a client

```ts
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir"; // generated in step 1

const fhir = createFhirClient<FhirSchema>({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: {
    type: "bearer",
    credentials: "your-token",
  },
});
```

## Usage

### Search resources

```ts
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data     - Patient[] (typed)
// result.total    - total count from server
// result.included - included resources (typed)
// result.link     - pagination links
// result.raw      - raw Bundle response
```

Every method is fully typed. `where("family", ...)` only accepts valid search parameters for `Patient`, and the operator is constrained to what makes sense for that parameter type (string, token, date, etc.).

### Include related resources

```ts
const result = await fhir
  .search("Patient")
  .where("name", "eq", "Smith")
  .include("general-practitioner")
  .execute();

// result.data     - Patient[]
// result.included - Practitioner[] (inferred from include target)
```

The `include` parameter is typed to only accept valid include paths for the resource, and the included resource type is automatically inferred.

### Narrow returned fields

Use `.select()` to request only specific top-level fields. The result type narrows to match, and the query compiles to FHIR's `_elements` search parameter:

```ts
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .select(["id", "name", "birthDate"])
  .execute();

// result.data[0]: { resourceType: "Patient"; id?: string; name?: HumanName[]; birthDate?: FhirDate }
```

Only top-level element names are accepted (matches the `_elements` spec). `resourceType` is always preserved. Calling `.select()` twice replaces the earlier selection.

### Profile-aware queries

```ts
const vitals = await fhir
  .search("Observation", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .execute();

// vitals.data is typed as USCoreVitalSignsProfile[]
```

When you pass a profile URL as the second argument, the result type narrows to that profile's interface.

### Read a single resource

```ts
const patient = await fhir.read("Patient", "123").execute();
// patient is typed as Patient
```

### Transactions

```ts
const result = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
  })
  .update({
    resourceType: "Patient",
    id: "456",
    name: [{ family: "Smith" }],
  })
  .delete("Observation", "789")
  .execute();
```

### Batch operations

```ts
const result = await fhir
  .batch()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
  })
  .delete("Observation", "789")
  .execute();
```

### Compile without executing

Every builder has a `compile()` method that returns the raw query representation without hitting the server:

```ts
const query = fhir
  .search("Observation")
  .where("status", "eq", "final")
  .count(50)
  .compile();

// {
//   method: "GET",
//   path: "Observation",
//   params: [
//     { name: "status", value: "final" },
//     { name: "_count", value: 50 }
//   ]
// }
```

## Design

- **Immutable builders** - Every method returns a new builder instance. Safe to store, fork, and compose.
- **Schema-driven** - All type safety comes from the `FhirSchema` generic, which is generated from actual FHIR StructureDefinitions.
- **No runtime magic** - The builder compiles to plain objects. Bring your own HTTP client or use the built-in fetch executor.

## Search Parameter Operators

| Param Type | Operators |
|---|---|
| `string` | `eq`, `contains`, `exact` |
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq` |
| `uri` | `eq`, `above`, `below` |

## License

[MIT](../../LICENSE)
