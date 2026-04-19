---
sidebar_position: 4
title: "@fhir-dsl/cli"
description: "`fhir-gen generate` — commander-based binary that wraps @fhir-dsl/generator with per-project flags for version, IGs, validators, and more."
---

# @fhir-dsl/cli

## Overview
`@fhir-dsl/cli` ships the `fhir-gen` binary. Its only subcommand is `generate`, a thin commander wrapper over `generate()` from `@fhir-dsl/generator`. Anything you can do from the CLI you can do programmatically from a build script; the CLI exists to stabilise flag ergonomics and defaults.

## Installation
```bash
npm install -D @fhir-dsl/cli
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `generateCommand` | commander `Command` | The `generate` subcommand — used by the `fhir-gen` binary, and re-usable in custom CLIs. |

## API

### `fhir-gen generate`
**Signature**
```text
fhir-gen generate
  --version <version>                 FHIR version: r4 | r4b | r5 | r6 (required, default: r4)
  --out <dir>                         Output directory (required)
  [--ig <packages...>]                IG packages (e.g. hl7.fhir.us.core@6.1.0); repeatable
  [--resources <list>]                Comma-separated resource names to emit (default: all)
  [--src <path>]                      Local path to FHIR definitions (skip download)
  [--cache <dir>]                     Cache directory for downloaded specs
  [--expand-valuesets]                Generate typed unions from FHIR ValueSet bindings
  [--resolve-codesystems]             Generate CodeSystem namespace objects for IntelliSense
  [--include-spec]                    Emit markdown spec files alongside types for AI/LLM context
  [--validator <target>]              Emit Standard Schema validators: zod | native
  [--strict-extensible]               Treat extensible bindings as closed enums in validators
```

**Parameters** — 11 flags total:
- `--version <v>` — FHIR version (`r4`, `r4b`, `r5`, `r6`). Required; default `r4`.
- `--out <dir>` — Output directory for generated types. Required. Generator writes `client.ts`, `resources/*.ts`, `profiles/*.ts`, `search-params/*.ts`, and `schemas/*.ts`.
- `--ig <packages...>` — One or more IG packages (`name@version` or `name#version`). Later IGs win on name conflicts.
- `--resources <list>` — Comma-separated resource names; defaults to every resource in the spec.
- `--src <path>` — Local path to a downloaded spec. Bypasses the network; useful in air-gapped CI.
- `--cache <dir>` — Cache directory for downloaded specs. Defaults to `<out>/.cache`.
- `--expand-valuesets` — Inline ValueSet expansions into type unions (default off).
- `--resolve-codesystems` — Emit CodeSystem namespace objects for IDE IntelliSense (default off).
- `--include-spec` — Copy raw StructureDefinition JSON into `<out>` so downstream tools can inspect bindings.
- `--validator <target>` — Emit Standard Schema v1 validators: `zod` (requires `zod` as a runtime dep) or `native` (zero-dependency).
- `--strict-extensible` — Treat `extensible` bindings as closed unions in validators. Breaks conformance with servers that emit codes outside the declared VS; use with care.

**Returns** — Process exits `0` on success; non-zero on any downloader or emitter error.

**Example**
```bash
# Baseline R4 generation
fhir-gen generate --version r4 --out ./src/fhir/r4

# US Core 6.1.0 + zod validators + ValueSet expansions
fhir-gen generate \
  --version r4 \
  --out ./src/fhir/r4 \
  --ig hl7.fhir.us.core@6.1.0 \
  --ig hl7.fhir.us.davinci-drug-formulary@2.0.0 \
  --resources Patient,Observation,MedicationRequest \
  --validator zod \
  --expand-valuesets \
  --resolve-codesystems

# Air-gapped CI using a pre-downloaded spec
fhir-gen generate --version r4 --out ./src/fhir/r4 --src ./vendor/fhir-r4-spec --validator native
```

**Notes**
- `--out` must be a directory; it is created if absent. Re-running overwrites files without prompting.
- Multiple `--ig` flags are supported (commander's `<packages...>` variadic form).
- The CLI and the programmatic `generate(options)` from `@fhir-dsl/generator` share the same code path — the CLI only shapes flags.
- `--validator zod` requires that downstream projects install `zod` at runtime; `native` is zero-dependency.

---

### `generateCommand` (programmatic re-use)
**Signature**
```ts
import { Command } from "commander";
const generateCommand: Command; // from "@fhir-dsl/cli"
```
**Example**
```ts
// Embed the `generate` subcommand in your own multi-tool CLI
import { Command } from "commander";
import { generateCommand } from "@fhir-dsl/cli";

const program = new Command().name("mytool");
program.addCommand(generateCommand);
program.parse();
```
