---
id: contributing
title: Contributing
sidebar_label: Contributing
---

# Contributing

We welcome contributions to fhir-dsl. This guide covers how to set up the project, make changes, and submit pull requests.

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 10
- **Git**

### Setup

```bash
git clone https://github.com/awbx/fhir-dsl.git
cd fhir-dsl
pnpm install
pnpm build
```

Verify everything works:

```bash
pnpm test
pnpm typecheck
pnpm lint
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/my-feature
```

### 2. Make Changes

The monorepo structure:

```
packages/
  core/        # Query builder (most contributions go here)
  runtime/     # HTTP executor
  types/       # Base FHIR types
  fhirpath/    # Typed FHIRPath builder + evaluator
  terminology/ # ValueSet/CodeSystem expansion + validate-code
  smart/       # SMART-on-FHIR auth (PKCE, backend-services)
  mcp/         # Model Context Protocol server
  generator/   # Code generation
  cli/         # CLI wrapper
  utils/       # Shared error/Result toolkit + helpers
```

### 3. Run Tests

```bash
# All tests
pnpm test

# Specific package
pnpm vitest packages/core

# Watch mode
pnpm vitest
```

### 4. Type Check

```bash
pnpm typecheck
```

### 5. Lint

```bash
# Check
pnpm lint

# Auto-fix
pnpm lint:fix
```

### 6. Submit a Pull Request

Push your branch and open a PR against `main`. Include:

- A clear description of what changed and why
- Test coverage for new functionality
- Type-checking passes

## Coding Standards

### TypeScript

- **Strict mode** is required -- no `any` types without justification
- Prefer `interface` over `type` for object shapes
- Use explicit return types on public APIs
- Keep generics readable -- use descriptive names (`RT` for ResourceType, `SP` for SearchParams)

### Testing

- Tests use [Vitest](https://vitest.dev/)
- Test files: `*.test.ts`
- Use `describe`/`it`/`expect` patterns
- Mock external HTTP calls -- never hit real FHIR servers in tests
- Test type safety with type-level assertions where possible

### Formatting

- [Biome](https://biomejs.dev/) handles formatting and linting
- Run `pnpm lint:fix` before committing
- No manual formatting rules to memorize

### Commits

- Write clear, descriptive commit messages
- One logical change per commit

## Architecture Decisions

When making design choices, keep these principles in mind:

- **Type safety first** -- If it can be checked at compile time, it should be
- **Zero runtime overhead** -- The DSL should compile away to simple objects
- **Immutability** -- Builders must never mutate state
- **Decoupled packages** -- Core and CLI should never depend on each other
- **Schema-driven** -- All type safety flows from the generated `FhirSchema`

## Areas for Contribution

- **New FHIR features** -- Support for additional FHIR operations (history, capabilities)
- **IG support** -- Testing with more Implementation Guides
- **Documentation** -- Improving examples and guides
- **Performance** -- Optimizing the generator for large IGs
- **Testing** -- Expanding test coverage, especially edge cases in the parser

## Reporting Issues

Open an issue on GitHub with:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- TypeScript version and Node.js version
