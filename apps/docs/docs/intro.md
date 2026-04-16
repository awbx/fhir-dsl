---
id: intro
title: Introduction
sidebar_label: Introduction
slug: /
---

# fhir-dsl

A fully type-safe FHIR query builder and code generator for TypeScript, inspired by [Kysely](https://github.com/kysely-org/kysely).

Build FHIR REST queries with **compile-time type safety** for resources, search parameters, profiles, and includes -- no more string guessing.

## Why fhir-dsl?

Working with FHIR APIs in TypeScript typically means dealing with untyped JSON, memorizing search parameter names, and hoping your query strings are correct. Bugs surface at runtime, not at build time.

**fhir-dsl** fixes this by generating TypeScript types directly from official FHIR StructureDefinitions and wiring them into a fluent query builder. The result: autocomplete in your editor, compile-time validation of every query, and zero runtime overhead.

## Key Benefits

- **Full type safety** -- Resource types, search parameters, operators, and includes are all checked at compile time.
- **Profile-aware queries** -- Query against US Core or any custom Implementation Guide with automatic type narrowing.
- **Code generation from spec** -- Generate types from any FHIR version (R4, R4B, R5, R6) and any published IG.
- **Immutable builders** -- Every method returns a new builder instance. Safe to reuse, fork, and compose.
- **Zero runtime dependencies** -- The core DSL depends only on `@fhir-dsl/types`.
- **Dual ESM/CJS** -- Works in any Node.js environment out of the box.

## What It Looks Like

```typescript
import { createClient } from "./fhir";

const fhir = createClient({
  baseUrl: "https://hapi.fhir.org/baseR4",
});

// Every part of this query is type-checked
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

## Packages

| Package | Description |
|---|---|
| `@fhir-dsl/core` | Query builder DSL (search, read, transactions) |
| `@fhir-dsl/cli` | CLI for generating types from FHIR specs |
| `@fhir-dsl/types` | Base FHIR type definitions |
| `@fhir-dsl/runtime` | HTTP executor with pagination and error handling |
| `@fhir-dsl/fhirpath` | Type-safe FHIRPath expression builder |
| `@fhir-dsl/generator` | Code generation engine |
| `@fhir-dsl/utils` | Shared utilities |

## Who Is This For?

- **Backend developers** building FHIR-connected services in TypeScript
- **Health tech teams** who want compile-time guarantees over FHIR APIs
- **EHR integrators** working with US Core, IPS, or custom profiles
- **Anyone** tired of debugging FHIR query strings at runtime
