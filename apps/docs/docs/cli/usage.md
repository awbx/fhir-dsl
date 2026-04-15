---
id: usage
title: CLI Usage
sidebar_label: CLI Usage
---

# CLI Usage

The `@fhir-dsl/cli` package provides the `fhir-gen` command for generating TypeScript types from FHIR StructureDefinitions.

## Installation

```bash
# Install globally
npm install -g @fhir-dsl/cli

# Or as a dev dependency
npm install -D @fhir-dsl/cli

# Or run directly with npx
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

## Commands

### `fhir-gen generate`

Generates TypeScript types from FHIR specifications.

```bash
fhir-gen generate [options]
```

#### Options

| Option | Description | Required |
|---|---|---|
| `--version <version>` | FHIR version: `r4`, `r4b`, `r5`, `r6` | Yes |
| `--out <dir>` | Output directory for generated files | Yes |
| `--ig <packages...>` | Implementation Guide packages to include | No |
| `--resources <list>` | Comma-separated list of resource names | No |
| `--src <path>` | Local FHIR definitions directory (skips download) | No |
| `--cache <dir>` | Cache directory for downloaded specs | No |

## Examples

### Basic R4 Generation

Generate types for all FHIR R4 resources:

```bash
fhir-gen generate --version r4 --out ./src/fhir
```

### With US Core Profiles

Include US Core Implementation Guide profiles:

```bash
fhir-gen generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

This generates additional profile interfaces with narrowed types (e.g., `USCorePatientProfile` where `gender` is required).

### Specific Resources Only

Generate types for a subset of resources:

```bash
fhir-gen generate \
  --version r4 \
  --resources Patient,Observation,Encounter,Condition \
  --out ./src/fhir
```

This significantly reduces the size of generated output when you only need a few resource types.

### Using Local Definitions

If you have FHIR StructureDefinitions locally (e.g., for offline builds):

```bash
fhir-gen generate \
  --version r4 \
  --src ./my-fhir-definitions \
  --out ./src/fhir
```

### Custom Cache Directory

Control where downloaded specs are cached:

```bash
fhir-gen generate \
  --version r4 \
  --cache ./node_modules/.cache/fhir \
  --out ./src/fhir
```

## Generated Output

The CLI produces a directory structure under `<out>/<version>/`:

```
src/fhir/
  r4/
    index.ts                # FhirSchema type + re-exports
    client.ts               # createClient() helper
    registry.ts             # FhirResourceMap, SearchParamRegistry, etc.
    search-params.ts        # Typed search parameters per resource
    search-param-types.ts   # Search parameter type definitions
    resources/
      patient.ts            # Patient interface
      observation.ts        # Observation interface
      encounter.ts          # Encounter interface
      ...                   # One file per resource
    profiles/               # Only when --ig is used
      uscore-patient-profile.ts
      uscore-vital-signs-profile.ts
      ...
      index.ts
      profile-registry.ts
```

### Key Generated Files

#### `index.ts`

Re-exports everything and defines the `GeneratedSchema` type:

```typescript
export type GeneratedSchema = {
  resources: FhirResourceMap;
  searchParams: SearchParamRegistry;
  includes: IncludeRegistry;
  profiles: ProfileRegistry;
};
```

#### `client.ts`

A pre-typed client factory:

```typescript
import { createFhirClient, type FhirClientConfig } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./index";

export function createClient(config: FhirClientConfig) {
  return createFhirClient<GeneratedSchema>(config);
}
```

Use this instead of manually passing the schema type:

```typescript
// Instead of this:
import { createFhirClient } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./fhir/r4";
const fhir = createFhirClient<GeneratedSchema>({ baseUrl: "..." });

// Use this:
import { createClient } from "./fhir/r4";
const fhir = createClient({ baseUrl: "..." });
```

#### `registry.ts`

Maps resource type names to their interfaces:

```typescript
export interface FhirResourceMap {
  Patient: Patient;
  Observation: Observation;
  // ... all resources
}

export interface SearchParamRegistry {
  Patient: PatientSearchParams;
  Observation: ObservationSearchParams;
  // ...
}

export interface IncludeRegistry {
  Patient: {
    "general-practitioner": "Practitioner" | "PractitionerRole";
    organization: "Organization";
  };
  // ...
}
```

## Adding to Your Build

Add generation as a script in your `package.json`:

```json
{
  "scripts": {
    "generate:fhir": "fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0 --out ./src/fhir",
    "build": "npm run generate:fhir && tsc"
  }
}
```

:::tip
Generated files should be committed to your repository. This avoids requiring the FHIR spec download during CI builds and ensures type consistency across your team.
:::

## Supported FHIR Versions

| Version | Status |
|---|---|
| R4 (4.0.1) | Fully supported |
| R4B (4.3.0) | Supported |
| R5 (5.0.0) | Supported |
| R6 | Supported |
