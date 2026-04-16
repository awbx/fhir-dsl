---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

Upcoming features on the fhir-dsl roadmap. Items land in approximate priority
order; nothing here is guaranteed until it ships.

## FHIR Operations

- **`$everything`** — Patient/Encounter everything operations
- **`$validate`** — Resource validation against profiles
- **Custom operations** — Type-safe builder for arbitrary FHIR operations

## Developer Experience

- **Middleware/interceptors** — Hook into request/response pipeline for logging, retries, metrics
- **History** — Resource and type-level history queries
- **Capabilities** — Typed access to CapabilityStatement for feature detection

## Code Generation

- **Watch mode** — Re-generate types when StructureDefinitions change
- **Custom profiles** — Generate types from your own StructureDefinitions
- **Incremental generation** — Only regenerate changed resources
- **Extension support** — First-class typed extensions

## Ecosystem

- **React hooks** — `useFhirSearch`, `useFhirRead` for React applications
- **Adapter packages** — Pre-built adapters for popular FHIR servers (HAPI, Azure Health Data Services, Google Cloud Healthcare API)

## Community

Suggestions, feature requests, and contributions are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.
