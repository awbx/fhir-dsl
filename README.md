# fhir-dsl

A fully type-safe FHIR query builder and code generator for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Build FHIR REST queries with compile-time type safety for resources, search parameters, profiles, and includes — no more string guessing.

**[Documentation](https://awbx.github.io/fhir-dsl/)** | **[Quick Start](https://awbx.github.io/fhir-dsl/docs/getting-started/quick-start)** | **[CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage)** | **[Roadmap](https://awbx.github.io/fhir-dsl/docs/roadmap)**

## Why fhir-dsl?

Working with FHIR APIs in TypeScript typically means dealing with untyped JSON, memorizing search parameter names, and hoping your query strings are correct. Bugs surface at runtime, not at build time.

**fhir-dsl** fixes this by generating TypeScript types directly from official FHIR StructureDefinitions and wiring them into a fluent query builder. The result: autocomplete in your editor, compile-time validation of every query, and zero runtime overhead.

## Features

- **Type-safe query builder** — Autocomplete and compile-time checks for resource types, search parameters, operators, includes, reverse includes, chained parameters, composite parameters, and `_has` filtering. See [DSL Syntax](https://awbx.github.io/fhir-dsl/docs/core-concepts/dsl-syntax).
- **FHIRPath expression builder** — Type-safe FHIRPath expressions with autocomplete, compilation to FHIRPath strings, and runtime evaluation. Covers the core of the FHIRPath N1 spec (70+ functions across navigation, filtering, subsetting, combining, conversions, strings, math, arithmetic, existence, boolean logic, type operators, tree navigation, aggregates, environment variables, and FHIR-specific functions like `extension()` and `resolve()`). See [Spec Coverage](#spec-coverage) below.
- **Profile-aware queries** — Query against US Core or any custom Implementation Guide with automatic type narrowing to profile-specific interfaces.
- **Code generation from spec** — Generate TypeScript types from any FHIR version (R4, R4B, R5, R6) and any published IG. See [CLI Usage](https://awbx.github.io/fhir-dsl/docs/cli/usage).
- **Runtime validation (optional)** — Opt in with `--validator native|zod` to emit [Standard Schema V1](https://standardschema.dev/) validators for every resource, datatype, binding, and profile. Chain `.validate()` on any read/search for client-side schema checks; server-side FHIR `$validate` is a separate operation invoked via `client.operation("$validate", ...)`. See [Validation](https://awbx.github.io/fhir-dsl/docs/guides/validation).
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
| [`@fhir-dsl/core`](./packages/core) | Query builder DSL (search, read, batch, transactions, terminology ops, capability guard) | Always — this is the query builder |
| [`@fhir-dsl/runtime`](./packages/runtime) | HTTP executor with pagination, error handling, bundle resolution, slice helpers | Always — provides the HTTP executor |
| [`@fhir-dsl/cli`](./packages/cli) | `fhir-gen` CLI: `generate`, `capability`, `validate`, `scaffold-ig`, `diff` | Dev dependency — generates types for your project |
| [`@fhir-dsl/types`](./packages/types) | Branded FHIR R4/R5 primitives + base datatypes + parsers | Automatically installed as a dependency of `@fhir-dsl/core` |
| [`@fhir-dsl/generator`](./packages/generator) | Code generation engine (resources, profiles, slices, typed extensions, layers, IG manifests) | Only if building custom tooling on top of the generator |
| [`@fhir-dsl/fhirpath`](./packages/fhirpath) | Type-safe FHIRPath expression builder + invariant evaluator | When working with FHIRPath expressions or compiling invariants |
| [`@fhir-dsl/terminology`](./packages/terminology) | CodeSystem hierarchy + ValueSet filter engine (`is-a`, `descendent-of`, `regex`) | Used internally by the generator; also usable standalone |
| [`@fhir-dsl/smart`](./packages/smart) | SMART on FHIR v2 — PKCE-S256, backend services, scope DSL | Only when integrating with SMART-secured FHIR servers |
| [`@fhir-dsl/mcp`](./packages/mcp) | MCP server: ~10 generic FHIR verbs as tools, pluggable auth/audit | When exposing a FHIR endpoint to an LLM agent |
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

### Batch operations

```ts
const bundle = await fhir
  .batch()
  .create({ resourceType: "Patient", name: [{ family: "Doe" }] })
  .delete("Observation", "obs-456")
  .execute();
```

See the full [DSL Syntax Reference](https://awbx.github.io/fhir-dsl/docs/core-concepts/dsl-syntax) for all query methods, operators, and patterns.

## Spec Coverage

fhir-dsl is audited against the FHIR architectural overview (https://build.fhir.org/overview-arch.html) and the FHIRPath N1 spec. The plan and gap analysis live in [`FHIR_COMPLIANCE_PLAN.md`](./FHIR_COMPLIANCE_PLAN.md).

| Pillar | Status | Notes |
|---|---|---|
| Information Model — base classes & datatypes | ✅ | `Element`, `Resource`, `DomainResource`, `BackboneElement`, all complex datatypes typed. |
| Information Model — primitives | ✅ | All 19 FHIR primitives, branded with `unique symbol` markers (Phase 1.1, v0.23.0). |
| Information Model — choice types `value[x]` | ✅ | Discriminated `ChoiceOf<T, Prefix>` + `choiceOf()` runtime helper (Phase 1.2, v0.24.0). |
| Information Model — primitive `_field` siblings | ✅ | `_id`, `_extension`, etc. round-trip via `Element` siblings (Phase 1.3, v0.25.0). |
| Information Model — full `Extension.value[x]` union | ✅ | All 49 value variants (Phase 1.4, v0.25.0). |
| Conformance — profiles | ✅ | Type-narrowing on `.search("RT", profileUrl)`. |
| Conformance — StructureDefinition slicing | ✅ | Slice-named optional fields (`extension_usCoreRace?`, `component_systolic?`) + runtime `extensionByUrl` / `findSliceByPath` helpers (Phase 2.1, v0.38.0). |
| Conformance — typed extensions from IGs | ✅ | Branded `Extension<URL>` interfaces emitted per IG-defined extension SD (Phase 2.2, v0.39.0). |
| Conformance — IG manifest as first-class | ✅ | `ImplementationGuide.global` + `dependsOn` parsed by the downloader (Phase 2.3, v0.34.0). |
| Conformance — CapabilityStatement-driven client | ✅ | `createCapabilityGuard` narrows the client surface to advertised capabilities (Phase 4.1, v0.27.0). |
| Terminology — typed bindings (generate-time) | ✅ | Required/extensible/preferred resolved offline. |
| Terminology — `$expand` / `$validate-code` / `$lookup` / `$translate` / `$subsumes` | ✅ | Typed `client.terminology.*` operations (Phase 3.1, v0.26.0). |
| Terminology — concept hierarchy + ValueSet filters | ✅ | `is-a`, `descendent-of`, `regex` filters with transitive subsumption (Phase 3.2, v0.28.0). |
| REST — read/vread/search/history/transaction/batch/operation | ✅ | Full surface in `packages/core`. |
| REST — PATCH + conditional headers + retry + AbortSignal | ✅ | json-patch / xml-patch / fhirpath-patch all wired. |
| REST — `_include` / `_revinclude` runtime resolution | ✅ | `Bundle.resolveReference` walks fragment → fullUrl → `Type/id` (Phase 4.2, v0.29.0). |
| References — `Reference<T>` target narrowing | ✅ | Generated from `targetProfile`. |
| FHIRPath — N1 core | ✅ | Arithmetic, env vars, `$index`/`$total`, aggregates, `resolve`/`hasValue`, `extension(url)`. |
| FHIRPath — invariants compiled to runtime predicates | ✅ | `compileInvariant` + `validateInvariants` returning OperationOutcome (Phase 6, v0.40.0). Subset: identifiers/member access, `exists`/`empty`/`matches`/`count`/`where`/`hasValue`, `and`/`or`/`xor`/`implies`/`not`, comparisons, parentheses, indexers, three-valued logic. |
| SMART on FHIR v2 | ✅ | PKCE-S256, backend services, scope DSL. |
| Layered framework (Foundation/Base/Clinical/Financial/Specialized) | ✅ | `LAYER_OF`, `referencesUpward` emitted under `<version>/layers.ts` (Phase 5, v0.30.0). |
| MCP server generation — package + dispatcher | ✅ | `@fhir-dsl/mcp` ships generic verb tools, audit sinks, stdio transport, FHIR URI templates with `resources/read` (Phases 8.1–8.3, v0.41.0+). |
| MCP server generation — auth strategies | ✅ | Bearer / backend-services (signed JWT via SMART v2) / patient-launch (refresh-token flow), all lazy-loaded (Phase 8.4, v0.48.0). |
| MCP server generation — write gating + token economy | ✅ | Per-resource-type allowlists, dryRun, confirmWrites, default `_count`/`_summary`, response-byte cap (Phases 8.5+8.7, v0.44.0+v0.45.0). |
| MCP server generation — generator + CLI integration | ✅ | `fhir-gen generate --mcp <out>` emits a server scaffold; `fhir-gen mcp <baseUrl>` launches one inline (Phases 8.8+8.9, v0.46.0+v0.47.0). |
| Phase 6 follow-up — invariants in emitted validators | ❌ | Compile generator-time invariants into the emitted Standard Schema validators. |

Drift between this table and the code is caught by `pnpm audit:export-surface` — every PR that changes the public surface must refresh `.surface-snapshot.json`.

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

## FHIR R5 Search Spec Coverage

Mapping of [FHIR R5 search features](https://fhir.hl7.org/fhir/search.html) to the builder API:

| FHIR feature | Builder API |
|---|---|
| Equality / value-prefix ops (`gt`, `ge`, `lt`, `le`, `sa`, `eb`, `ap`, `ne`) | `.where(param, op, value)` |
| Modifiers `:exact`, `:contains`, `:not`, `:in`, `:not-in`, `:above`, `:below`, `:identifier`, `:of-type`, `:text`, `:code-text` | `.where(param, modifier, value)` |
| `:missing` | `.whereMissing(param, true \| false)` |
| OR via comma (`gender=male,female`) | `.where(param, "eq", [v1, v2])` or `.whereIn(param, [...])` |
| `_id`, `_lastUpdated`, `_tag`, `_security`, `_source` | `.whereId(...)`, `.whereLastUpdated(op, v)`, `.withTag(v)`, `.withSecurity(v)`, `.fromSource(uri)` |
| `_summary`, `_total`, `_contained`, `_containedType` | `.summary(mode)`, `.total(mode)`, `.contained(mode)`, `.containedType(mode)` |
| `_include`, `_revinclude` | `.include(...)`, `.revinclude(...)` |
| `_include:iterate`, `_revinclude:iterate` | `.include(spec, { iterate: true })`, `.revinclude(spec, { iterate: true })` |
| Chained params (multi-hop) | `.whereChain([hops], op, value)` |
| `_has` reverse-chain | `.has(rt, param, target, op, value)` |
| Composite params | `.whereComposite(name, components)` |
| `_filter` (FHIRPath-like search expr) | `.filter(expr)` |
| `_query` (named queries) | `.namedQuery(name, params?)` |
| `_text`, `_content`, `_list` | `.text(q)`, `.content(q)`, `.inList(listId)` |
| POST `_search` (long URLs / sensitive params) | `.usePost()` (auto-switch over ~1900 chars) |
| `_count`, `_sort` | `.count(n)`, `.sort(param, dir)` |

## Invariants (FHIRPath → Predicates)

`@fhir-dsl/fhirpath` exposes a runtime invariant evaluator that compiles `ElementDefinition.constraint[*].expression` strings into predicates and surfaces results as `OperationOutcome` issues. The supported subset covers the patterns FHIR core invariants actually use:

- Identifiers and member access (`name.given`, `extension.url`)
- Function calls: `exists()`, `empty()`, `count()`, `where()`, `select()`, `matches('regex')`, `hasValue()`, `first()`/`last()`/`tail()`/`single()`, `iif()`, `distinct()`, `startsWith`/`endsWith`/`contains`/`length`/`toString`
- Boolean operators: `and`, `or`, `xor`, `implies`, `not` (with FHIRPath three-valued logic)
- Comparison/equivalence: `=`, `!=`, `<`, `>`, `<=`, `>=`, `~`, `!~`, `in`
- Arithmetic, parentheses, indexers, `$this`, scalar literals

```ts
import { compileInvariant, validateInvariants } from "@fhir-dsl/fhirpath";

const inv = compileInvariant({
  key: "pat-1",
  expression: "name.exists() or telecom.exists() or address.exists()",
  severity: "error",
  human: "Patient must have a contact mechanism",
});

const result = inv.check(patient);            // { passed: true | false | "indeterminate", ... }
const oo = validateInvariants(patient, [inv]); // { resourceType: "OperationOutcome", issue: [...] }
```

Generator wiring (so the emitted Standard Schema validators run invariants automatically) is a follow-up phase.

## MCP Server (Model Context Protocol)

`@fhir-dsl/mcp` exposes any FHIR endpoint as an MCP tool surface for LLM agents — one server === one upstream + one IG.

```ts
import { createServer, stdioTransport } from "@fhir-dsl/mcp";

const server = createServer({
  name: "us-core-mcp",
  version: "1.0.0",
  baseUrl: "https://hapi.fhir.org/baseR4",
  resourceTypes: ["Patient", "Observation", "Encounter"],
  auth: { kind: "bearer", token: process.env.FHIR_TOKEN! },
  // writes default to none — opt in explicitly:
  // writes: ["create", "update"],
});

await server.listen(stdioTransport());
```

Capabilities:

- **~10 generic verbs** typed by `resourceType` discriminated union: `read`, `vread`, `search`, `history`, `create`, `update`, `patch`, `delete`, `operation`, `capabilities`
- **Read-only by default**; writes opt in via `writes`, with optional per-resource-type allowlist (`writeResourceTypes`), `confirmWrites` (require `{confirm: true}` per call), and `dryRun` (short-circuit to a synthetic OperationOutcome)
- **Three auth strategies, all wired**: `bearer`, `backend-services` (SMART v2 signed JWT — RS384 / ES384, lazy-loaded via `@fhir-dsl/smart` + `jose`), `patient-launch` (refresh-token flow with auto-rotation)
- **Pluggable `AuditSink`** — `JsonLogAuditSink`, `MemoryAuditSink`, `NullAuditSink` ship by default
- **Token economy guards** — `defaultSearchCount` (default 20), `defaultReadSummary`, and a `maxResponseBytes` cap (default 64KB) that swaps oversize bodies for a `too-costly` OperationOutcome (the audit retains the original)
- **MCP resources** — `fhir://<ResourceType>/{id}` URIs read via `resources/read` (and `_history/<versionId>` for vread)
- **Stdio transport today**; Streamable HTTP is planned

### Generate a server alongside the typed client

```bash
fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir --mcp ./mcp-server
```

`./mcp-server/` gets a `server.ts` shim, `mcp.config.json` seeded with the IG's resource types, and a README. Launch it with `FHIR_BASE_URL=… node server.ts`.

### Or run inline (no generated types):

```bash
fhir-gen mcp https://hapi.fhir.org/baseR4 \
  --resources Patient,Observation \
  --writes create --confirm-writes --auth-bearer-env FHIR_TOKEN
```

## CLI Reference

The `fhir-gen` binary ships five commands:

```bash
fhir-gen generate     # generate TypeScript from a FHIR version (+ optional IG)
fhir-gen capability   # snapshot a server's CapabilityStatement
fhir-gen validate     # structurally check a FHIR JSON resource
fhir-gen scaffold-ig  # initialise a project with an IG pre-wired
fhir-gen diff         # report breaking changes between two generated outputs
```

### `fhir-gen generate`

| Option | Description | Required |
|---|---|---|
| `--version <version>` | FHIR version: `r4`, `r4b`, `r5`, `r6` | Yes |
| `--out <dir>` | Output directory for generated files | Yes |
| `--ig <packages...>` | Implementation Guide packages (`hl7.fhir.us.core@6.1.0`) | No |
| `--resources <list>` | Comma-separated list of resource names to generate | No |
| `--src <path>` | Local FHIR definitions directory (skips download) | No |
| `--cache <dir>` | Cache directory for downloaded specs | No |
| `--validator <target>` | Emit Standard Schema validators: `native` or `zod` | No |
| `--strict-extensible` | Treat extensible bindings as closed enums (validator only) | No |
| `--expand-valuesets` | Generate typed unions from FHIR ValueSet bindings | No |
| `--resolve-codesystems` | Generate CodeSystem namespace objects for IntelliSense | No |
| `--include-spec` | Emit markdown spec files alongside types for AI/LLM context | No |

### `fhir-gen capability <baseUrl>`

Fetches `<baseUrl>/metadata` and prints a table of supported interactions, formats, search params, and conditional-* flags. `--out <file>` dumps the raw JSON, `--json` prints it to stdout. (Phase 7.2, v0.32.0.)

### `fhir-gen validate <file>`

Structural sanity-check on a FHIR JSON resource: parses, validates the `resourceType` is known, checks basic invariants (string `id`, `Bundle.entry` is an array, no NaN/Infinity in numbers). Designed for CI gates around LLM-generated payloads. `--quiet` suppresses warnings on success. (Phase 7.1, v0.35.0.)

### `fhir-gen scaffold-ig <pkg>`

Initialises a starter project with the IG pre-wired. Writes `package.json`, `tsconfig.json`, `fhir-dsl.config.json`, and `src/client.ts` calling the generator's emitted `createClient`. `--out <dir>` (default cwd), `--version <ver>` (default `r4`), `--name <project>`, `--force` to overwrite. (Phase 7.3, v0.36.0.)

### `fhir-gen diff <oldDir> <newDir>`

Compares two generated outputs and reports added/removed resources, removed fields, optional→required changes, and type narrowing. Exits 2 when breaking changes are detected — wire it into CI to gate FHIR version bumps. `--json` for a machine-readable report. (Phase 7.4, v0.37.0.)

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
