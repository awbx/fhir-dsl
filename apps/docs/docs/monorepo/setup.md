---
id: setup
title: Monorepo Setup
sidebar_label: Monorepo Setup
---

# Monorepo Setup

fhir-dsl is a pnpm workspace monorepo. This page covers the project structure, build system, and how to work with it locally.

## Project Structure

```
fhir-dsl/
├── packages/
│   ├── core/           # @fhir-dsl/core - Query builder DSL
│   ├── runtime/        # @fhir-dsl/runtime - HTTP executor
│   ├── types/          # @fhir-dsl/types - Base type definitions
│   ├── generator/      # @fhir-dsl/generator - Code generation engine
│   ├── cli/            # @fhir-dsl/cli - Command-line interface
│   ├── utils/          # @fhir-dsl/utils - Shared utilities
│   └── example/        # Example project with generated types
├── package.json        # Workspace root
├── pnpm-workspace.yaml # Workspace config
├── tsconfig.base.json  # Shared TypeScript config
├── vitest.config.ts    # Test config
└── biome.json          # Linter config
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10

## Getting Started

```bash
# Clone the repo
git clone https://github.com/abdel/fhir-dsl.git
cd fhir-dsl

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

## Workspace Scripts

Run from the repository root:

| Command | Description |
|---|---|
| `pnpm build` | Build all packages with tsup |
| `pnpm typecheck` | Type-check all packages |
| `pnpm test` | Run all tests with Vitest |
| `pnpm lint` | Lint with Biome |
| `pnpm lint:fix` | Auto-fix lint issues |
| `pnpm format` | Format with Biome |
| `pnpm dev` | Run dev mode across packages |
| `pnpm version:bump` | Bump version across all packages |

## Build System

Each package uses [tsup](https://tsup.egoist.dev/) for bundling:

- Generates both **ESM** and **CommonJS** outputs
- Produces `.d.ts` declaration files
- Fast incremental builds

Packages declare their entry points in `package.json`:

```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## Inter-Package Dependencies

Packages reference each other using `workspace:*`:

```json
{
  "dependencies": {
    "@fhir-dsl/types": "workspace:*"
  }
}
```

pnpm resolves these to the local packages during development and replaces them with actual version numbers at publish time.

## TypeScript Configuration

All packages extend a shared `tsconfig.base.json`:

```json
// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

## Testing

Tests use [Vitest](https://vitest.dev/) with a root-level configuration:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm vitest

# Run tests for a specific package
pnpm vitest packages/core
```

Test files follow the `*.test.ts` naming convention and are colocated with source files or in `__tests__` directories.

## Linting

[Biome](https://biomejs.dev/) handles both linting and formatting:

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format only
pnpm format
```

## Version Management

All packages share the same version number. Use the bump script to update:

```bash
pnpm version:bump
```

This updates the version in all `package.json` files across the monorepo.

## Adding a New Package

1. Create a new directory under `packages/`:

```bash
mkdir packages/my-package
```

2. Add a `package.json`:

```json
{
  "name": "@fhir-dsl/my-package",
  "version": "0.3.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

3. Add a `tsconfig.json` extending the base config.

4. Add a `tsup.config.ts` for building.

5. Run `pnpm install` to link the package.
