# fhir-dsl

A fully type-safe FHIR query builder and code generator for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Build FHIR REST queries with compile-time type safety for resources, search parameters, profiles, and includes — no more string guessing.

**[Documentation](https://awbx.github.io/fhir-dsl/)** | **[Quick Start](https://awbx.github.io/fhir-dsl/docs/getting-started/quick-start)** | **[CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage)** | **[Roadmap](https://awbx.github.io/fhir-dsl/docs/roadmap)**

## Why fhir-dsl?

Working with FHIR APIs in TypeScript typically means dealing with untyped JSON, memorizing search parameter names, and hoping your query strings are correct. Bugs surface at runtime, not at build time.

**fhir-dsl** fixes this by generating TypeScript types directly from official FHIR StructureDefinitions and wiring them into a fluent query builder. The result: autocomplete in your editor, compile-time validation of every query, and zero runtime overhead.

## Features

- **Type-safe query builder** — Autocomplete and compile-time checks for resource types, search parameters, operators, includes, reverse includes, chained parameters, composite parameters, and `_has` filtering. See [DSL Syntax](https://awbx.github.io/fhir-dsl/docs/core-concepts/dsl-syntax).
- **FHIRPath expression builder** — Type-safe FHIRPath expressions with autocomplete, compilation to FHIRPath strings, and runtime evaluation. Covers ~85% of the official FHIRPath spec including 60+ functions, expression predicates, and operators.
- **Profile-aware queries** — Query against US Core or any custom Implementation Guide with automatic type narrowing to profile-specific interfaces.
- **Code generation from spec** — Generate TypeScript types from any FHIR version (R4, R4B, R5, R6) and any published IG. See [CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage).
- **Immutable builders** — Every query method returns a new builder instance, safe to reuse, fork, and compose.
- **Zero runtime dependencies** — Core DSL depends only on `@fhir-dsl/types`.
- **Dual ESM/CJS** — Works in any Node.js environment out of the box.

## Who Is This For?

- **Backend developers** building FHIR-connected services in TypeScript
- **Health tech teams** who want compile-time guarantees over FHIR APIs
- **EHR integrators** working with US Core, IPS, or custom profiles
- **Anyone** tired of debugging FHIR query strings at runtime

## Packages

| Package | Description | When to Install |
|---|---|---|
| [`@fhir-dsl/core`](./packages/core) | Query builder DSL (search, read, transactions) | Always — this is the query builder |
| [`@fhir-dsl/runtime`](./packages/runtime) | HTTP executor with pagination and error handling | Always — provides the HTTP executor |
| [`@fhir-dsl/cli`](./packages/cli) | CLI for generating types from FHIR specs | Dev dependency — generates types for your project |
| [`@fhir-dsl/types`](./packages/types) | Base FHIR R4/R5 type definitions | Automatically installed as a dependency of `@fhir-dsl/core` |
| [`@fhir-dsl/generator`](./packages/generator) | Code generation engine | Only if building custom tooling on top of the generator |
| [`@fhir-dsl/fhirpath`](./packages/fhirpath) | Type-safe FHIRPath expression builder | When working with FHIRPath expressions |
| [`@fhir-dsl/utils`](./packages/utils) | Shared utilities | Only if building custom tooling |

For detailed installation instructions, see the [Installation Guide](https://awbx.github.io/fhir-dsl/docs/getting-started/installation).

## Quick Start

### 1. Install

```bash
npm install @fhir-dsl/core @fhir-dsl/runtime
```

### 2. Generate types for your project

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

This generates TypeScript interfaces for all FHIR R4 resources plus US Core profile types. See [CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage) for all options (`--resources`, `--src`, `--cache`, etc.).

### 3. Query with full type safety

```ts
import { createClient } from "./fhir/r4";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
});

// Search with typed parameters — every part is type-checked
const result = await fhir
  .search("Patient")
  .where("family", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .include("general-practitioner")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

// result.data is Patient[], result.included is typed too
for (const patient of result.data) {
  console.log(patient.name?.[0]?.family); // fully typed
}
```

### Advanced queries — chained params, reverse includes, `_has`

```ts
// Search through references: find observations where patient name is "Smith"
const obs = await fhir
  .search("Observation")
  .whereChained("subject", "Patient", "family", "eq", "Smith")
  .execute();

// Reverse include: get patients with their observations
const patientsWithObs = await fhir
  .search("Patient")
  .revinclude("Observation", "subject")
  .execute();
// patientsWithObs.included has the Observation resources

// _has: find patients who have a specific observation
const filtered = await fhir
  .search("Patient")
  .has("Observation", "subject", "code", "eq", "http://loinc.org|85354-9")
  .execute();

// Composite params: search on multiple values simultaneously
const bpReadings = await fhir
  .search("Observation")
  .whereComposite("code-value-quantity", {
    code: "http://loinc.org|8480-6",
    "value-quantity": "60",
  })
  .execute();
// Compiles to: Observation?code-value-quantity=http://loinc.org|8480-6$60
```

### Read a single resource

```ts
const patient = await fhir.read("Patient", "123").execute();
// patient: Patient
```

### Profile-aware queries with type narrowing

```ts
const vitals = await fhir
  .search("Observation", "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs")
  .where("patient", "eq", "Patient/123")
  .where("status", "eq", "final")
  .execute();

// result.data is USCoreVitalSignsProfile[] — profile-required fields are non-optional
```

### FHIRPath Expressions

```ts
import { fhirpath } from "@fhir-dsl/fhirpath";
import type { Patient } from "./fhir/r4";

// Type-safe path navigation with autocomplete
const expr = fhirpath<Patient>("Patient").name.family;
expr.compile();              // "Patient.name.family"
expr.evaluate(somePatient);  // ["Smith", "Doe"]

// Expression predicates with $this
fhirpath<Patient>("Patient")
  .name.where($this => $this.use.eq("official")).given
  .compile();  // "Patient.name.where($this.use = 'official').given"

// Collection operations
fhirpath<Patient>("Patient").name.first().family.compile();
fhirpath<Patient>("Patient").name.count().compile();
fhirpath<Patient>("Patient").name.exists().compile();

// String, math, and conversion functions
fhirpath<Patient>("Patient").name.family.upper().compile();
fhirpath<Patient>("Patient").name.family.startsWith("Sm").compile();
```

### Transactions

```ts
const bundle = await fhir
  .transaction()
  .create({ resourceType: "Patient", name: [{ family: "Doe" }] })
  .create({ resourceType: "Observation", status: "final", code: { text: "BP" } })
  .delete("Observation", "obs-456")
  .execute();
```

See the full [DSL Syntax Reference](https://awbx.github.io/fhir-dsl/docs/core-concepts/dsl-syntax) for all query methods, operators, and patterns.

## Search Parameter Operators

Operators are constrained by parameter type — TypeScript won't let you use `"contains"` on a date parameter.

| Parameter Type | Valid Operators |
|---|---|
| `string` | `eq`, `contains`, `exact` |
| `token` | `eq`, `not`, `in`, `not-in`, `text`, `above`, `below`, `of-type` |
| `date` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `number` | `eq`, `ne`, `gt`, `ge`, `lt`, `le` |
| `quantity` | `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap` |
| `reference` | `eq` |
| `uri` | `eq`, `above`, `below` |
| `composite` | N/A (use `whereComposite` with structured component values) |

## CLI Reference

```bash
fhir-gen generate [options]
```

| Option | Description | Required |
|---|---|---|
| `--version <version>` | FHIR version: `r4`, `r4b`, `r5`, `r6` | Yes |
| `--out <dir>` | Output directory for generated files | Yes |
| `--ig <packages...>` | Implementation Guide packages to include | No |
| `--resources <list>` | Comma-separated list of resource names to generate | No |
| `--src <path>` | Local FHIR definitions directory (skips download) | No |
| `--cache <dir>` | Cache directory for downloaded specs | No |

For full CLI details and examples, see the [CLI Usage Guide](https://awbx.github.io/fhir-dsl/docs/cli/usage).

## Supported FHIR Versions

| Version | Status |
|---|---|
| R4 (4.0.1) | Fully supported |
| R4B (4.3.0) | Supported |
| R5 (5.0.0) | Supported |
| R6 | Supported |

## Development

### Prerequisites

- Node.js >= 20
- pnpm >= 10
- TypeScript >= 5.0 with `strict: true`

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
    fhirpath/    # Type-safe FHIRPath expression builder
    generator/   # Parses StructureDefinitions, emits TypeScript
    cli/         # CLI wrapping the generator
    utils/       # Shared naming/type-mapping utilities
```

**Dependency graph:**

```
cli -> generator -> utils
core -> types
fhirpath -> types
runtime -> core, types
```

Core and CLI are fully decoupled. Runtime does not depend on CLI or generator. For more details, see the [Architecture Overview](https://awbx.github.io/fhir-dsl/docs/architecture/overview).

## Documentation

Full documentation is available at **[awbx.github.io/fhir-dsl](https://awbx.github.io/fhir-dsl/)**.

- [Introduction](https://awbx.github.io/fhir-dsl/docs/) — Overview and motivation
- [Installation](https://awbx.github.io/fhir-dsl/docs/getting-started/installation) — Setup and TypeScript configuration
- [Quick Start](https://awbx.github.io/fhir-dsl/docs/getting-started/quick-start) — Get up and running
- [Core Concepts](https://awbx.github.io/fhir-dsl/docs/core-concepts/overview) — Resources, DSL syntax, and how the type system works
- [DSL Syntax Reference](https://awbx.github.io/fhir-dsl/docs/core-concepts/dsl-syntax) — Full API for search, read, transactions, and profiles
- [Query Patterns](https://awbx.github.io/fhir-dsl/docs/examples/queries) — Common query examples
- [Working with Patients](https://awbx.github.io/fhir-dsl/docs/examples/patient) — Patient-focused examples
- [CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage) — Code generation options and output structure
- [Architecture](https://awbx.github.io/fhir-dsl/docs/architecture/overview) — Package design and dependency graph
- [Contributing](https://awbx.github.io/fhir-dsl/docs/contributing) — How to contribute
- [Roadmap](https://awbx.github.io/fhir-dsl/docs/roadmap) — Planned features and future direction

## Contributing

Suggestions, feature requests, and contributions are welcome. See the [Contributing Guide](https://awbx.github.io/fhir-dsl/docs/contributing) for details, or open an issue on GitHub.

## License

[MIT](./LICENSE)
