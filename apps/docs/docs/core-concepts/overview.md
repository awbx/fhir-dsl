---
id: overview
title: Core Concepts
sidebar_label: Overview
---

# Core Concepts

fhir-dsl is built around a few core ideas that work together to provide end-to-end type safety for FHIR queries.

## The Two-Phase Workflow

Using fhir-dsl is a two-phase process:

### Phase 1: Code Generation (Build Time)

The CLI reads official FHIR StructureDefinitions and generates TypeScript interfaces:

```
FHIR StructureDefinitions  -->  @fhir-dsl/cli  -->  TypeScript types
     (JSON specs)                (generator)          (your project)
```

This produces a `FhirSchema` type that encodes:
- Every resource type and its properties
- Every search parameter and its type (string, token, date, etc.)
- Every valid `_include` target
- Every profile and its constraints

### Phase 2: Type-Safe Queries (Runtime)

The generated schema is passed to `createFhirClient`, and TypeScript does the rest:

```typescript
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir/r4";

const fhir = createFhirClient<FhirSchema>({ baseUrl: "..." });

// TypeScript now knows every valid query you can build
fhir.search("Patient").where("family", "eq", "Smith");
//          ^^^^^^^          ^^^^^^^^  ^^^^  ^^^^^^^
//          valid resource   valid param  valid op  valid value type
```

## The Schema Type

The `FhirSchema` is the central type that powers everything. It's a generated interface with four registries:

```typescript
type FhirSchema = {
  resources: FhirResourceMap;       // Resource type -> interface
  searchParams: SearchParamRegistry; // Resource type -> search params
  includes: IncludeRegistry;        // Resource type -> include targets
  profiles: ProfileRegistry;        // Resource type -> profile interfaces
};
```

Each registry maps resource type names (like `"Patient"`) to their corresponding type information. The query builder uses these mappings to validate every part of your query at compile time.

## Immutable Builders

Every builder method returns a **new** builder instance. The original is never mutated:

```typescript
const base = fhir.search("Patient").where("active", "eq", "true");

// These are independent queries -- base is unchanged
const byName = base.where("family", "eq", "Smith");
const byDate = base.where("birthdate", "ge", "2000-01-01");
```

This makes builders safe to store, share, and compose.

## Compile vs Execute

Every builder has two terminal methods:

- **`compile()`** -- Returns the raw query representation without executing it
- **`execute()`** -- Sends the query to the FHIR server and returns typed results

```typescript
// Inspect what would be sent
const query = fhir.search("Patient").where("family", "eq", "Smith").compile();

// Actually send it
const result = await fhir.search("Patient").where("family", "eq", "Smith").execute();
```

This separation is useful for logging, testing, and custom execution strategies.
