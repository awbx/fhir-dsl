---
id: overview
title: Architecture
sidebar_label: Overview
---

# Architecture

fhir-dsl is a monorepo of six decoupled packages, each with a clear responsibility. Understanding how they fit together helps you choose the right packages for your project and extend the system when needed.

## Package Dependency Graph

```
┌─────────┐     ┌───────────┐     ┌─────────┐
│   cli   │ ──> │ generator │ ──> │  utils  │
└─────────┘     └───────────┘     └─────────┘

┌─────────────┐     ┌──────────┐     ┌─────────┐
│   runtime   │ ──> │   core   │ ──> │  types  │
└─────────────┘     └──────────┘     └─────────┘
```

There are two independent stacks:

1. **Generation stack** (`cli` -> `generator` -> `utils`) -- Runs at build time to produce TypeScript types
2. **Query stack** (`runtime` -> `core` -> `types`) -- Runs at application time to build and execute queries

These stacks have **no cross-dependencies**. The generator doesn't import from core, and core doesn't import from the generator. They communicate through generated code -- the types produced by the generation stack are consumed by the query stack.

## Package Responsibilities

### @fhir-dsl/types

The foundation layer. Provides hand-written TypeScript interfaces for:

- FHIR primitive types (`FhirString`, `FhirDate`, `FhirBoolean`, etc.)
- Complex data types (`HumanName`, `Address`, `CodeableConcept`, etc.)
- Base resource types (`Resource`, `DomainResource`, `BackboneElement`)
- Search parameter types (`StringParam`, `TokenParam`, `DateParam`, etc.)
- Bundle types for transactions

These types are stable and rarely change between FHIR versions.

### @fhir-dsl/core

The query builder DSL. Provides:

- `createFhirClient<S>()` -- Factory for creating typed clients
- `SearchQueryBuilder` -- Fluent builder for FHIR search queries
- `ReadQueryBuilder` -- Builder for single resource reads
- `TransactionBuilder` -- Builder for FHIR transaction Bundles
- `CompiledQuery` -- Raw query representation

Core is generic over a `FhirSchema` type parameter. It doesn't know about specific FHIR resources -- that knowledge comes from the generated types.

### @fhir-dsl/runtime

The execution layer. Provides:

- `FhirExecutor` -- HTTP client that sends `CompiledQuery` to a FHIR server
- `FhirError` -- Error class with OperationOutcome parsing
- `paginate()` -- Async generator for streaming paginated results
- `fetchAllPages()` -- Fetches all pages into a single array
- `unwrapBundle()` -- Extracts typed resources from search Bundles

Runtime is optional -- you can use `compile()` and handle execution yourself.

### @fhir-dsl/generator

The code generation engine. Handles:

- Downloading FHIR StructureDefinitions from official servers
- Downloading Implementation Guide packages
- Parsing StructureDefinitions into an internal model
- Emitting TypeScript resource interfaces
- Emitting typed search parameters
- Emitting type registries and the `FhirSchema`
- Emitting profile interfaces for IGs

### @fhir-dsl/cli

A thin wrapper around the generator, using [Commander](https://github.com/tj/commander.js) for argument parsing. Exposes the `fhir-gen` binary.

### @fhir-dsl/utils

Shared utilities used by the generation stack:

- Name conversion (`toPascalCase`, `toKebabCase`, etc.)
- FHIR-to-TypeScript type mapping
- File naming helpers
- Logger

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

## Custom Executors

The `Executor` interface allows plugging in custom HTTP execution:

```typescript
// Use compile() to get the raw query
const query = fhir.search("Patient").where("family", "eq", "Smith").compile();

// Execute with your own HTTP client
const response = await myCustomFetch(query.method, query.path, query.params);
```

This is useful for:
- Custom authentication flows
- Request/response interceptors
- Testing with mock servers
- Integration with existing HTTP infrastructure
