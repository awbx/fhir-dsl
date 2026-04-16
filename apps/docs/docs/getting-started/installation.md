---
id: installation
title: Installation
sidebar_label: Installation
---

# Installation

## Requirements

- **Node.js** >= 20
- **TypeScript** >= 5.0
- A package manager: npm, yarn, or pnpm

## Install the Core Packages

For most projects, you need the core query builder and the runtime executor:

```bash
npm install @fhir-dsl/core @fhir-dsl/runtime
```

Or with pnpm:

```bash
pnpm add @fhir-dsl/core @fhir-dsl/runtime
```

Or with yarn:

```bash
yarn add @fhir-dsl/core @fhir-dsl/runtime
```

## Install the CLI

The CLI generates TypeScript types from FHIR StructureDefinitions. Install it as a dev dependency:

```bash
npm install -D @fhir-dsl/cli
```

Or run it directly with `npx`:

```bash
npx @fhir-dsl/cli generate --version r4 --out ./src/fhir
```

## Package Overview

| Package | When to Install |
|---|---|
| `@fhir-dsl/core` | Always -- this is the query builder |
| `@fhir-dsl/runtime` | Always -- provides the HTTP executor |
| `@fhir-dsl/cli` | Dev dependency -- generates types for your project |
| `@fhir-dsl/types` | Automatically installed as a dependency of `@fhir-dsl/core` |
| `@fhir-dsl/fhirpath` | Optional -- for type-safe FHIRPath expression building |
| `@fhir-dsl/generator` | Only if building custom tooling on top of the generator |
| `@fhir-dsl/utils` | Only if building custom tooling |

## TypeScript Configuration

fhir-dsl requires `strict` mode enabled in your `tsconfig.json` for full type safety:

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

:::tip
Without `strict: true`, optional properties won't be properly narrowed and some type guards won't work as expected.
:::

## Next Steps

Once installed, [generate your types](/docs/getting-started/quick-start) and start querying.
