# @fhir-dsl/cli

CLI tool for generating type-safe FHIR TypeScript types from official HL7 specifications and Implementation Guides.

Generates the `FhirSchema` type used by `@fhir-dsl/core` for compile-time query safety.

## Install

```bash
# Global install
npm install -g @fhir-dsl/cli

# Or use with npx
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

## Usage

### Generate types from base FHIR R4

```bash
fhir-gen generate \
  --version r4 \
  --out ./src/fhir
```

### Generate with US Core profiles

```bash
fhir-gen generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

### Generate specific resources only

```bash
fhir-gen generate \
  --version r4 \
  --resources Patient,Observation,Condition \
  --out ./src/fhir
```

### Use a local FHIR definitions directory

```bash
fhir-gen generate \
  --version r4 \
  --src ./local-fhir-definitions \
  --out ./src/fhir
```

## Commands

### `fhir-gen generate`

Generate TypeScript types from FHIR specification.

| Flag | Required | Default | Description |
|---|---|---|---|
| `--version <version>` | Yes | `r4` | FHIR version (`r4`, `r4b`, `r5`, `r6`) |
| `--out <dir>` | Yes | - | Output directory for generated types |
| `--ig <packages...>` | No | - | IG packages to include (e.g., `hl7.fhir.us.core@6.1.0`) |
| `--resources <list>` | No | all | Comma-separated resource names to generate |
| `--src <path>` | No | - | Local path to FHIR definitions (skips download) |
| `--cache <dir>` | No | - | Cache directory for downloaded specs |

## What gets generated

```
out/
  index.ts           # FhirSchema type and re-exports
  primitives.ts      # FHIR primitive types (string, uri, dateTime, etc.)
  datatypes.ts       # Complex datatypes (HumanName, Address, CodeableConcept, etc.)
  registry.ts        # Resource type registry mapping
  search-params.ts   # Typed search parameters per resource
  resources/
    patient.ts       # Patient interface
    observation.ts   # Observation interface
    ...              # One file per resource
  profiles/          # (when --ig is used)
    uscore-patient-profile.ts
    uscore-vital-signs-profile.ts
    ...
  client.ts          # Pre-configured FhirClient type
```

The generated `FhirSchema` type wires everything together so that `@fhir-dsl/core` can provide full type safety for queries, includes, and profile narrowing.

## License

[MIT](../../LICENSE)
