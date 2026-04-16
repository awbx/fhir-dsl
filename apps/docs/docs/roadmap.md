---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

The current priorities and future direction for fhir-dsl.

## Current State (v0.6.1)

What's available today:

- Type-safe search, read, and transaction builders
- Code generation from FHIR R4, R4B, R5, and R6 StructureDefinitions
- Implementation Guide support (US Core and custom IGs)
- Profile-aware queries with type narrowing
- HTTP executor with pagination and error handling
- Dual ESM/CJS builds
- CLI for type generation

## Recently Added

### FHIRPath Expression Builder (v0.6.1)

- **`@fhir-dsl/fhirpath`** -- New package: type-safe FHIRPath expression builder with ~85% spec coverage
- **Expression system** -- Predicate callbacks with `$this` proxy for `where()`, `select()`, `all()`, `exists()`, `iif()`
- **60+ FHIRPath functions** -- Navigation, filtering, subsetting, string, math, conversion, utility, and boolean operators
- **`ofType()` narrowing** -- Type-safe polymorphic field handling via extensible `FhirTypeMap`
- **Compile + evaluate** -- Build FHIRPath strings and evaluate against resources at runtime

### Query Features (v0.6.1)

- **`_revinclude`** -- Reverse include support in search queries via `.revinclude()`
- **Chained parameters** -- Type-safe chained search via `.whereChained()` (e.g., `subject:Patient.name=Smith`)
- **`_has`** -- Reverse chaining for filtering via `.has()` (e.g., `_has:Observation:subject:code=1234`)

## Planned

### FHIR Operations

- **`$everything`** -- Patient/Encounter everything operations
- **`$validate`** -- Resource validation against profiles
- **Custom operations** -- Type-safe builder for arbitrary FHIR operations

### Query Features

- **Composite parameters** -- Support for multi-value composite search params

### Developer Experience

- **Middleware/interceptors** -- Hook into request/response pipeline for logging, retries, auth refresh
- **Batch support** -- Type-safe FHIR batch operations (non-transactional)
- **History** -- Resource and type-level history queries
- **Capabilities** -- Typed access to CapabilityStatement for feature detection

### Code Generation

- **Watch mode** -- Re-generate types when StructureDefinitions change
- **Custom profiles** -- Generate types from your own StructureDefinitions
- **Incremental generation** -- Only regenerate changed resources
- **Extension support** -- First-class typed extensions

### Ecosystem

- **React hooks** -- `useFhirSearch`, `useFhirRead` for React applications
- **SMART on FHIR** -- Built-in auth flow integration
- **Adapter packages** -- Pre-built adapters for popular FHIR servers (HAPI, Azure Health Data Services, Google Cloud Healthcare API)

## Community

Suggestions, feature requests, and contributions are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.
