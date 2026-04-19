---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
---

# Quick Start

Get from zero to a type-safe FHIR query in three steps.

## Step 1: Generate Types

Run the CLI to generate TypeScript types from the FHIR R4 specification:

```bash
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

This downloads the official FHIR R4 StructureDefinitions and generates typed interfaces for every resource, search parameter, and include relationship.

The generated output looks like this:

```
src/fhir/
  r4/
    index.ts            # Schema type + createClient helper
    resources/
      patient.ts        # Patient interface
      observation.ts    # Observation interface
      ...               # One file per resource
    search-params.ts    # Typed search parameters
    registry.ts         # Type registries
    client.ts           # Pre-typed createClient()
```

### With Implementation Guide Profiles

To include US Core (or any IG) profiles:

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

This adds a `profiles/` directory with narrowed types for each profile.

### Generate Only Specific Resources

If you only need a subset of resources:

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --resources Patient,Observation,Encounter \
  --out ./src/fhir
```

## Step 2: Create a Client

Use the generated `createClient` helper for a fully typed client:

```typescript
import { createClient } from "./fhir/r4";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
});
```

Or if you need authentication:

```typescript
const fhir = createClient({
  baseUrl: "https://your-fhir-server.com/fhir",
  auth: {
    type: "bearer",
    credentials: "your-access-token",
  },
});
```

## Step 3: Query With Type Safety

### Search for Resources

```typescript
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data is Patient[]
for (const patient of result.data) {
  console.log(patient.name?.[0]?.family);
  console.log(patient.birthDate);
}
```

Every argument is type-checked:
- `"Patient"` must be a valid resource type
- `"family"` must be a valid search parameter for Patient
- `"eq"` must be a valid operator for string parameters
- The value type is validated against the parameter type

### Read a Single Resource

```typescript
const patient = await fhir.read("Patient", "123").execute();
// patient is typed as Patient
```

### Build Transactions

```typescript
const bundle = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
    gender: "female",
  })
  .execute();
```

### Compile Without Executing

Inspect the raw query without sending it:

```typescript
const query = fhir
  .search("Observation")
  .where("status", "eq", "final")
  .count(50)
  .compile();

console.log(query);
// {
//   method: "GET",
//   path: "Observation",
//   params: [
//     { name: "status", value: "final" },
//     { name: "_count", value: 50 }
//   ]
// }
```

:::tip
`compile()` is useful for debugging, logging, or when you want to execute the query with a custom HTTP client.
:::

## What's Next?

- Learn about [Core Concepts](/docs/core-concepts/overview) to understand the type system
- See more [Examples](/docs/examples/patient) for real-world patterns
- Compose dynamic queries with [`$if` / `$call`](/docs/core-concepts/dsl-syntax#composition-if-and-call) and the [functional `where(callback)`](/docs/core-concepts/dsl-syntax#functional-where-composable-conditions) overload
- Set up the [CLI](/docs/cli/usage) for your project
