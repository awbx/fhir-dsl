# fhir-dsl

A fully type-safe FHIR query builder and code generator for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Build FHIR REST queries with compile-time type safety for resources, search parameters, profiles, and includes — no more string guessing.

## Features

- **Type-safe query builder** - Autocomplete and compile-time checks for resource types, search parameters, and includes
- **Profile-aware queries** - Query against US Core and custom IG profiles with full type narrowing
- **Code generation** - Generate TypeScript types directly from HL7 FHIR StructureDefinitions and IGs
- **Immutable builders** - Every query method returns a new builder, safe to reuse and compose
- **Zero runtime dependencies** - Core DSL has no runtime deps beyond `@fhir-dsl/types`
- **Dual ESM/CJS** - Works in any Node.js environment

## Packages

| Package | Description |
|---|---|
| [`@fhir-dsl/core`](./packages/core) | Query builder DSL (search, read, transactions) |
| [`@fhir-dsl/cli`](./packages/cli) | CLI for generating types from FHIR specs |
| [`@fhir-dsl/types`](./packages/types) | FHIR R4/R5 type definitions |
| [`@fhir-dsl/runtime`](./packages/runtime) | Query executor with pagination and error handling |
| [`@fhir-dsl/generator`](./packages/generator) | Code generation engine |
| [`@fhir-dsl/utils`](./packages/utils) | Shared utilities |

## Quick Start

### Install

```bash
npm install @fhir-dsl/core @fhir-dsl/runtime
```

### Generate types for your project

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

### Query with full type safety

```ts
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir";

const fhir = createFhirClient<FhirSchema>({
  baseUrl: "https://hapi.fhir.org/baseR4",
});

// Search with typed parameters
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// Read a single resource
const patient = await fhir.read("Patient", "123").execute();

// Profile-aware queries with type narrowing
const vitals = await fhir
  .search("Observation", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .execute();

// Transactions
const bundle = await fhir
  .transaction()
  .create({ resourceType: "Patient", name: [{ family: "Doe" }] })
  .create({ resourceType: "Observation", status: "final", code: { text: "BP" } })
  .execute();
```

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Setup

```bash
pnpm install
pnpm build
```

### Scripts

```bash
pnpm build       # Build all packages
pnpm typecheck   # Type check all packages
pnpm lint        # Lint with Biome
pnpm lint:fix    # Auto-fix lint issues
pnpm test        # Run tests
```

## Architecture

```
fhir-dsl/
  packages/
    types/       # FHIR type definitions (generated + hand-written)
    core/        # Query builder DSL - the main user-facing API
    runtime/     # HTTP executor, pagination, error handling
    generator/   # Parses StructureDefinitions, emits TypeScript
    cli/         # CLI wrapping the generator
    utils/       # Shared naming/type-mapping utilities
```

**Dependency graph:**

```
cli -> generator -> utils
core -> types
runtime -> core, types
```

Core and CLI are fully decoupled. Runtime does not depend on CLI or generator.

## License

[MIT](./LICENSE)
