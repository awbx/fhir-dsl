---
id: overview
title: Architecture
sidebar_label: Overview
---

# Architecture

fhir-dsl is a monorepo of ten decoupled packages, each with a clear responsibility. Understanding how they fit together helps you choose the right packages for your project and extend the system when needed.

## Package Dependency Graph

```
Generation stack (build time)
┌─────────┐     ┌───────────┐     ┌──────────────┐     ┌─────────┐
│   cli   │ ──> │ generator │ ──> │ terminology  │ ──> │  utils  │
└─────────┘     └───────────┘     └──────────────┘     └─────────┘
                      │                                      ▲
                      └──────────────────────────────────────┘

Query stack (runtime)
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌─────────┐
│  smart  │ ──> │   core   │ <── │ runtime  │     │  types  │
└─────────┘     └──────────┘     └──────────┘     └─────────┘
                      │                                ▲
                      └────────────────────────────────┤
                                                       │
                                            ┌──────────┴──────────┐
                                            │       fhirpath       │
                                            └──────────────────────┘

LLM bridge (runtime, optional)
┌──────┐
│ mcp  │ ──> core, runtime, fhirpath, smart (lazy), utils
└──────┘
```

Every other package re-exports its error subclasses from **`utils`**, so the `FhirDslError` / `Result<T, E>` contract is shared across stacks (introduced in v1.2.0).

There are three logical groups:

1. **Generation stack** (`cli` → `generator` → `terminology` → `utils`) — runs at build time to produce TypeScript types.
2. **Query stack** (`smart` → `core` ← `runtime`, with `fhirpath` as a sibling over `types`) — runs at application time to build and execute queries.
3. **LLM bridge** (`mcp`) — depends on the query stack and lazy-loads `smart` only when the configured auth strategy needs JWT signing.

Generation and query stacks have **no cross-dependencies**. The generator doesn't import from core, and core doesn't import from the generator. They communicate through generated code — the types produced by the generation stack are consumed by the query stack.

## Package Responsibilities

### @fhir-dsl/types

The foundation layer. Hand-written TypeScript interfaces for:

- FHIR primitive types (`FhirString`, `FhirDate`, `FhirBoolean`, …)
- Complex data types (`HumanName`, `Address`, `CodeableConcept`, …)
- Base resource types (`Resource`, `DomainResource`, `BackboneElement`)
- Search parameter metadata types (`StringParam`, `TokenParam`, `DateParam`, …)
- Bundle types for transactions

Stable and rarely changes between FHIR versions.

### @fhir-dsl/core

The query builder DSL. Provides:

- `createFhirClient<S>()` — factory for creating typed clients
- `SearchQueryBuilder` — fluent builder for FHIR search queries
- `ReadQueryBuilder` — builder for single-resource reads
- `TransactionBuilder` — builder for FHIR transaction Bundles
- `CompiledQuery` — raw query representation
- `AuthProvider` / `AuthConfig` — pluggable auth abstraction (see [Auth Layer](#auth-layer))
- `performRequest` — shared HTTP helper that attaches auth headers and handles 401 callbacks

Core is generic over a `FhirSchema` type parameter. It doesn't know about specific FHIR resources — that knowledge comes from the generated types.

### @fhir-dsl/runtime

The execution layer. Provides:

- `FhirExecutor` — HTTP client that sends `CompiledQuery` to a FHIR server (dispatches through `performRequest`)
- `FhirError` — `kind: "runtime.fhir"`, extends `FhirDslError` with `OperationOutcome` parsing in `context.operationOutcome`
- `paginate()` — async generator for streaming paginated results
- `fetchAllPages()` — fetches all pages into a single array
- `unwrapBundle()` — extracts typed resources from search Bundles

Runtime is optional — you can use `compile()` and handle execution yourself.

### @fhir-dsl/smart

[SMART on FHIR v2](https://hl7.org/fhir/smart-app-launch/) authentication. Implements both flows of the spec:

- **Backend Services** — `BackendServicesAuth` signs an RS384/ES384 `client_assertion` JWT, exchanges it for an access token, and caches until expiry.
- **App Launch** — `buildAuthorizeUrl` / `exchangeCode` / `refreshToken` drive the OAuth2 + PKCE flow; `SmartClient` wraps the resulting token set, auto-refreshes, and exposes `patient` / `encounter` / `fhirContext` launch claims.

Also ships scope builders, `.well-known` discovery, PKCE helpers, typed errors (`SmartAuthError`, `DiscoveryError`), and a pluggable `TokenStore`. Both providers implement core's `AuthProvider`, so they drop into `createFhirClient({ auth })` without extra plumbing. Depends on [`jose`](https://github.com/panva/jose) for JWT signing.

### @fhir-dsl/fhirpath

Type-safe [FHIRPath](https://hl7.org/fhirpath/) expression builder + evaluator. Covers the pragmatic subset of the spec that FHIR invariants and common navigation actually exercise (see the [coverage table](../fhirpath/overview.md#fhirpath-spec-coverage)), plus FHIR-specific extensions:

- **Native UCUM-aware `Quantity`** (v1.1.0) — same-dimension equality + ordering with no third-party dependency. Offset / log / multi-`/` units throw `UcumError` instead of returning silent wrong answers.
- **`setValue` / `createPatch`** (v0.53.0) — every typed leaf inverts an `eq`-shaped predicate path into a deep-cloned next resource or an RFC 6902 JSON Patch.
- **`resolve()` + terminology resolver hooks** (v1.1.0) — `EvalOptions.resolveReference` is consulted after the Bundle-walk path misses; `conformsTo` / `memberOf` / `subsumes` / `subsumedBy` compile to spec strings and dispatch through `EvalOptions.terminology`.
- **Expression predicates** with `$this`, polymorphic narrowing via `ofType()`, string/math/conversion helpers, and FHIRPath's full operator set (`and`, `or`, `xor`, `implies`, `not`, comparisons, equivalence pending).
- **`compileInvariant` / `validateInvariants`** — runtime evaluator over `ElementDefinition.constraint[*].expression` that returns OperationOutcome issues; auto-wired into emitted Standard Schema validators when `--validator` is set.

Parallel to core — it consumes the generated resource types directly, not the `FhirSchema`. Use it for:

- Compiling path strings to pass to a FHIR server that supports FHIRPath (`_filter`)
- Evaluating expressions against in-memory resources
- Building reusable navigation over nested resource shapes
- Round-tripping write-back as JSON Patch documents to external apply

### @fhir-dsl/generator

The code generation engine. Handles:

- Downloading FHIR StructureDefinitions from official servers
- Downloading Implementation Guide packages
- Parsing StructureDefinitions into an internal model
- Emitting TypeScript resource interfaces
- Emitting typed search parameters
- Emitting type registries and the `FhirSchema`
- Emitting profile interfaces for IGs
- Emitting markdown spec files (with `--include-spec`)

Every emitted table is derived from the per-version spec via a `SpecCatalog` —
see [SpecCatalog](./spec-catalog.md) for the pipeline and data shape.

Delegates ValueSet resolution to `@fhir-dsl/terminology`.

### @fhir-dsl/terminology

The terminology resolver used during code generation. Loads the FHIR spec's pre-expanded ValueSets and CodeSystems, resolves bindings by strength, and emits literal-union types (e.g. `AdministrativeGender = "male" | "female" | ...`) plus optional CodeSystem namespace objects.

Used internally by the generator when `--expand-valuesets` is set. Not a runtime dependency of applications.

### @fhir-dsl/cli

A thin wrapper around the generator, using [Commander](https://github.com/tj/commander.js) for argument parsing. Exposes the `fhir-gen` binary with `generate`, `capability`, `validate`, `scaffold-ig`, `diff`, and `mcp` subcommands.

### @fhir-dsl/mcp

[Model Context Protocol](https://modelcontextprotocol.io/) bridge — exposes a FHIR endpoint as an MCP tool surface for an LLM agent. One server === one upstream FHIR endpoint, scoped to one IG. Ships ~10 generic FHIR verbs (`read`, `vread`, `search`, `history`, `create`, `update`, `patch`, `delete`, `operation`, `capabilities`), three pluggable auth strategies (`bearer`, `backend-services`, `patient-launch`), pluggable `AuditSink` implementations, write-gating + token-economy guards, and two transports: `stdioTransport()` for CLI MCP clients and `httpTransport()` (Streamable HTTP — POST, batched JSON-RPC, SSE notifications, optional CORS / auth hook / body cap / external-server mounting).

Generated alongside the typed client via `fhir-gen generate --mcp <out>`, or run inline with `fhir-gen mcp <baseUrl>`.

### @fhir-dsl/utils

The shared toolbox every other package depends on:

- **Errors** — `FhirDslError` abstract base (`kind` discriminator, structured `context`, ES2022 `cause`, `toJSON()`), `isFhirDslError`, `formatErrorChain`, `SerializedFhirDslError`.
- **Result toolkit** — `Result<T, E>`, `Ok<T>` / `Err<E>`, `tryAsync` / `trySync`, `mapErr` / `mapOk` / `match` for Effect-style typed handling.
- **Logger** — `Logger`, `LogLevel`, default `logger` singleton.
- **Naming helpers** — `toPascalCase`, `toCamelCase`, `toKebabCase`, `fhirTypeToFileName`, `fhirPathToPropertyName`, `capitalizeFirst`.
- **Type mapping** — `searchParamTypeToTs` (FHIR search-param type → emitted TS literal).

## The Type System

The type system is the core innovation. Here's how it flows:

```
StructureDefinition (JSON)
  ↓  parsed by generator
ResourceModel (internal)
  ↓  emitted as TypeScript
Patient interface, Observation interface, ...
  ↓  collected into
FhirResourceMap, SearchParamRegistry, IncludeRegistry, ProfileRegistry
  ↓  composed into
FhirSchema
  ↓  passed to
createFhirClient<FhirSchema>()
  ↓  powers
fhir.search("Patient").where("family", "eq", "Smith")
                              ↑            ↑       ↑
                        lookup in    lookup in   validate
                        ResourceMap  SearchParams  against type
```

Each query method uses TypeScript's conditional types and mapped types to look up the correct types from the schema.

## Immutability

All builders use a copy-on-write pattern. The internal `QueryState` is cloned on every method call:

```typescript
// Simplified internal pattern
class SearchQueryBuilder<S, RT, SP, Inc, Prof> {
  private constructor(private state: QueryState) {}

  where(param, op, value) {
    return new SearchQueryBuilder({
      ...this.state,
      params: [...this.state.params, { param, op, value }],
    });
  }
}
```

This means:

- Builders are safe to share across functions and modules
- You can fork a builder to create variations without affecting the original
- No hidden mutation bugs

## Auth Layer

Authentication is abstracted behind the `AuthProvider` interface in core:

```typescript
interface AuthProvider {
  getAuthorization(req: { url: string; method: string }): Promise<string | undefined> | string | undefined;
  onUnauthorized?(): Promise<void> | void;
}

type AuthConfig = AuthProvider | { type: "bearer" | "basic"; credentials: string };
```

`createFhirClient({ auth })` accepts either form:

- **Static credentials** — `{ type: "bearer", credentials: token }` — resolved once into a fixed `Authorization` header.
- **`AuthProvider` instances** — consulted per-request. Lets providers mint, refresh, or rotate tokens on demand without touching caller code.

Both the core `fetch` executor and the runtime `FhirExecutor` dispatch through the same `performRequest` helper. That helper:

1. Resolves the provider (wrapping a static credential into a thin provider if needed).
2. Calls `getAuthorization()` before each request, short-circuiting if it returns `undefined`.
3. On a `401` response, invokes `onUnauthorized()` so the provider can invalidate its cache before the next call.

`@fhir-dsl/smart` ships two implementations of this interface (`BackendServicesAuth`, `SmartClient`); downstream projects can write their own for custom auth schemes.

## Custom Executors

The `Executor` interface allows plugging in custom HTTP execution:

```typescript
// Use compile() to get the raw query
const query = fhir.search("Patient").where("family", "eq", "Smith").compile();

// Execute with your own HTTP client
const response = await myCustomFetch(query.method, query.path, query.params);
```

This is useful for:

- Custom authentication flows beyond `AuthProvider`
- Request/response interceptors
- Testing with mock servers
- Integration with existing HTTP infrastructure
