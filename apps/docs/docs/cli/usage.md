---
id: usage
title: CLI Usage
description: fhir-gen CLI reference — generate typed FHIR clients, compile FHIRPath expressions, and inspect spec catalogs from the command line.
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
| `--expand-valuesets` | Generate typed unions from FHIR ValueSet bindings | No |
| `--resolve-codesystems` | Generate CodeSystem namespace objects for IntelliSense | No |
| `--include-spec` | Emit markdown spec files alongside types (for AI/LLM context) | No |
| `--validator <target>` | Emit Standard Schema runtime validators: `native` or `zod` | No |
| `--strict-extensible` | Treat extensible bindings as closed enums (validator only) | No |

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

### With Terminology Types

Generate types with compile-time coded value validation:

```bash
fhir-gen generate \
  --version r4 \
  --expand-valuesets \
  --resolve-codesystems \
  --out ./src/fhir
```

This generates a `terminology/` directory with literal union types (e.g., `AdministrativeGender = "male" | "female" | "other" | "unknown"`) and parameterizes bound fields like `Patient.gender` as `FhirCode<AdministrativeGender>`. See [Terminology Engine](/docs/guides/terminology) for details.

### With Runtime Validators

Emit Standard Schema validators alongside the types so you can check incoming payloads at runtime:

```bash
fhir-gen generate \
  --version r4 \
  --expand-valuesets \
  --validator native \
  --out ./src/fhir
```

`--validator native` produces a zero-dependency implementation; `--validator zod` emits Zod schemas and requires `zod` as a peer dependency. Both conform to [Standard Schema V1](https://standardschema.dev/), so call sites (`schema["~standard"].validate(value)`) stay identical if you switch targets. See [Validation](/docs/guides/validation) for the full guide, including profile schemas.

### With Markdown Spec (for AI assistants)

Emit a parallel tree of markdown files summarizing every generated resource and profile:

```bash
fhir-gen generate \
  --version r4 \
  --resources Patient,Observation \
  --include-spec \
  --out ./src/fhir
```

This writes `<out>/<version>/spec/` alongside the TypeScript output:

```
src/fhir/r4/spec/
  index.md                    # Linked index of every resource + profile
  resources/
    patient.md                # Description, properties table, backbone elements, search params
    observation.md
    ...
  profiles/                   # Only when --ig is used
    uscore-patient.md         # Same shape, listing only constrained deltas vs. base
    ...
```

Each resource file contains the resource description, a properties table with cardinality / type / terminology binding / description for every field, nested tables for each backbone element, and a table of search parameters. Intended as context for AI coding assistants working against the generated types — point the tool at `spec/` (or attach `spec/index.md`) so it can reason about FHIR semantics, not just TypeScript shapes.

Built purely from data the generator already parses — no extra network calls, works offline with `--src`, and respects `--resources` so the spec stays in lockstep with the emitted types.

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
    terminology/            # Only when --expand-valuesets is used
      valuesets.ts          # Literal union types for ValueSet bindings
      codesystems.ts        # CodeSystem const objects (with --resolve-codesystems)
      index.ts
    profiles/               # Only when --ig is used
      uscore-patient-profile.ts
      uscore-vital-signs-profile.ts
      ...
      index.ts
      profile-registry.ts
    schemas/                # Only when --validator is used
      __runtime.ts          # native adapter only
      datatypes.ts
      terminology.ts
      resources/
        patient.schema.ts
        ...
      profiles/             # Only when --ig is also used
        uscore-patient-profile.schema.ts
        profile-schema-registry.ts
      index.ts
    spec/                   # Only when --include-spec is used
      index.md
      resources/
        patient.md
        ...
      profiles/             # Only when --ig is also used
        uscore-patient.md
        ...
```

### Key Generated Files

#### `index.ts`

Re-exports everything and defines the `GeneratedSchema` type:

```typescript
export type GeneratedSchema = {
  resources: FhirResourceMap;
  searchParams: SearchParamRegistry;
  includes: IncludeRegistry;
  revIncludes: RevIncludeRegistry;
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

export interface RevIncludeRegistry {
  Patient: {
    Observation: "subject" | "performer";
    Encounter: "subject";
    // ... every resource+param that targets Patient
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
