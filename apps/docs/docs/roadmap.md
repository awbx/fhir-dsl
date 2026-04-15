---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

The current priorities and future direction for fhir-dsl.

## Current State (v0.4.0)

What's available today:

- Type-safe search, read, and transaction builders
- Code generation from FHIR R4, R4B, R5, and R6 StructureDefinitions
- Implementation Guide support (US Core and custom IGs)
- Profile-aware queries with type narrowing
- HTTP executor with pagination and error handling
- Dual ESM/CJS builds
- CLI for type generation

## Planned

### FHIR Operations

- **`$everything`** -- Patient/Encounter everything operations
- **`$validate`** -- Resource validation against profiles
- **Custom operations** -- Type-safe builder for arbitrary FHIR operations

### Query Features

- **`_revinclude`** -- Reverse include support in search queries
- **Chained parameters** -- Support for `patient.name` style chained search params
- **Composite parameters** -- Support for multi-value composite search params
- **`_has`** -- Reverse chaining for filtering by related resources

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
