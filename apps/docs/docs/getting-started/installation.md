---
id: installation
title: Installation
sidebar_label: Installation
description: Install fhir-dsl packages and run the generator with every supported flag.
---

# Installation

## Requirements

- **Node.js** >= 20
- **TypeScript** >= 5.0 with `strict: true`
- A package manager: npm, pnpm, or yarn

## Required packages

Every project needs the query builder (`@fhir-dsl/core`) and the HTTP executor (`@fhir-dsl/runtime`). `@fhir-dsl/types` is installed transitively.

```bash
# npm
npm install @fhir-dsl/core @fhir-dsl/runtime

# pnpm
pnpm add @fhir-dsl/core @fhir-dsl/runtime

# yarn
yarn add @fhir-dsl/core @fhir-dsl/runtime
```

## Optional packages

Add only what you use.

| Package | Install | Use when |
|---|---|---|
| `@fhir-dsl/cli` | dev dep | Generating types during build / CI. Shipped as a binary named `fhir-gen`. |
| `@fhir-dsl/fhirpath` | runtime dep | Writing type-safe FHIRPath expressions (`fhirpath<Patient>("Patient").name.family.compile()`). |
| `@fhir-dsl/smart` | runtime dep | SMART on FHIR v2 (authorize + PKCE S256, Backend Services JWT, `SmartClient`). |
| `@fhir-dsl/terminology` | runtime dep | Parsing / resolving CodeSystems and ValueSets in-process. |

```bash
# Dev-only: the generator CLI
npm install -D @fhir-dsl/cli

# Runtime: whichever of these you need
npm install @fhir-dsl/fhirpath @fhir-dsl/smart @fhir-dsl/terminology
```

## Run the generator

The CLI downloads the FHIR spec (and any IGs) and writes a typed client into your repo. Convention throughout these docs: output goes to `./src/fhir` and the generated client is imported from `./fhir/r4`.

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir
```

### All generator flags

Every flag below is exposed by `packages/cli/src/commands/generate.ts`.

| Flag | Value | Purpose |
|---|---|---|
| `--version <v>` | `r4` \| `r4b` \| `r5` \| `r6` | FHIR base spec to download. Required. |
| `--out <dir>` | path | Output directory for generated types. Required. |
| `--ig <pkg...>` | `name@ver` or `name#ver`, repeatable | IG packages to layer on top of the base spec. Later wins on conflicts. |
| `--resources <list>` | `Patient,Observation,...` | Comma-separated allowlist. Default: all resources. |
| `--src <path>` | path | Use a local spec directory instead of downloading. Handy for air-gapped CI. |
| `--cache <dir>` | path | Cache directory for downloaded spec + IG tarballs. |
| `--expand-valuesets` | flag | Inline ValueSet expansions into narrowed `Coding<T>` / `CodeableConcept<T>` unions. |
| `--resolve-codesystems` | flag | Emit CodeSystem namespace objects for IntelliSense. |
| `--include-spec` | flag | Copy the raw StructureDefinition JSON next to generated types (LLM / AI context). |
| `--validator <t>` | `zod` \| `native` | Emit Standard Schema v1 validators. `native` has zero runtime deps. |
| `--strict-extensible` | flag | Treat extensible bindings as closed unions (validators only). |

Full example using every flag:

```bash
npx @fhir-dsl/cli generate \
  --version r4 \
  --out ./src/fhir \
  --ig hl7.fhir.us.core@6.1.0 \
  --ig hl7.fhir.uv.ips@1.1.0 \
  --resources Patient,Observation,Encounter \
  --src ./vendor/fhir-spec \
  --cache ./.fhir-cache \
  --expand-valuesets \
  --resolve-codesystems \
  --include-spec \
  --validator zod \
  --strict-extensible
```

## TypeScript configuration

`strict: true` is required — optional chaining, profile narrowing, and the search-param discriminator all rely on it.

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## Next steps

Head to the [Quick Start](/docs/getting-started/quick-start) to run your first typed query.
