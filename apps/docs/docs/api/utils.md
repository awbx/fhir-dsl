---
sidebar_position: 9
title: "@fhir-dsl/utils"
description: "Naming helpers, a leveled logger, and the search-param → TypeScript literal type mapping used by the generator."
---

# @fhir-dsl/utils

## Overview
`@fhir-dsl/utils` is the generator-internal toolbox: a tiny leveled logger, string naming helpers (`toPascalCase`, `toCamelCase`, `toKebabCase`, …) that the emitter uses for file names and property names, and a `searchParamTypeToTs` helper that turns a FHIR search-param type (`string`, `token`, …) into the matching TypeScript `{ type; value }` literal. Anything you use to produce output that matches the generator should come from here so names stay identical.

## Installation
```bash
npm install @fhir-dsl/utils
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `LogLevel` | type | `"debug"` \| `"info"` \| `"warn"` \| `"error"`. |
| `Logger` | class | Level-gated console wrapper. |
| `logger` | const | Default singleton `Logger` (level `info`). |
| `toPascalCase` | function | `"observation_category"` → `"ObservationCategory"`. |
| `toCamelCase` | function | `"Observation-Category"` → `"observationCategory"`. |
| `toKebabCase` | function | `"ObservationCategory"` → `"observation-category"`. |
| `fhirTypeToFileName` | function | `"ObservationCategory"` → `"observation-category.ts"`. |
| `fhirPathToPropertyName` | function | `"Patient.name"` → `"name"` (strips the leading resource type and dots). |
| `capitalizeFirst` | function | `"patient"` → `"Patient"`. |
| `searchParamTypeToTs` | function | Maps a search-param type (`"string"`, `"token"`, `"date"`, ...) to a TS literal such as `{ type: "string"; value: string }`. |

## API

### `LogLevel` / `Logger` / `logger`
**Signature**
```ts
type LogLevel = "debug" | "info" | "warn" | "error";

class Logger {
  constructor(level?: LogLevel);
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

const logger: Logger;
```
**Parameters**
- `level` — Minimum level to emit. Messages below the level are dropped. Default `"info"`.

**Returns** — `Logger` methods return `void` and write to `console.debug` / `console.info` / `console.warn` / `console.error` with a `[LEVEL]` prefix.

**Example**
```ts
import { Logger, logger } from "@fhir-dsl/utils";

logger.info("generating types");
const quiet = new Logger("error");
quiet.debug("this is dropped");
quiet.error("only errors escape", { attempt: 3 });
```

**Notes** — The default singleton uses `info`. To see generator diagnostics while debugging a build, construct your own `new Logger("debug")` — the `logger` const's level is set at construction time and there's no public setter.

---

### Naming helpers
**Signature**
```ts
function toPascalCase(str: string): string;
function toCamelCase(str: string): string;
function toKebabCase(str: string): string;
function fhirTypeToFileName(typeName: string): string;
function fhirPathToPropertyName(path: string): string;
function capitalizeFirst(str: string): string;
```
**Example**
```ts
import { toPascalCase, toCamelCase, toKebabCase, fhirTypeToFileName, fhirPathToPropertyName } from "@fhir-dsl/utils";

toPascalCase("observation-category"); // "ObservationCategory"
toCamelCase("observation_category");  // "observationCategory"
toKebabCase("ObservationCategory");   // "observation-category"
fhirTypeToFileName("Observation");    // "observation.ts"
fhirPathToPropertyName("Patient.name.given"); // "name.given"
```

**Notes** — `toPascalCase` does not dedupe consecutive caps; `"ID"` → `"ID"`, not `"Id"`. `fhirPathToPropertyName` strips the leading resource type but preserves remaining dots, which matches how the generator keys into nested paths.

---

### `searchParamTypeToTs`
**Signature**
```ts
function searchParamTypeToTs(paramType: string): string;
```
**Parameters**
- `paramType` — One of `"string"`, `"token"`, `"date"`, `"reference"`, `"quantity"`, `"number"`, `"uri"`, `"composite"`, `"special"`.

**Returns** — A TypeScript literal type string such as `{ type: "string"; value: string }`, matching exactly what the generator emits into `search-params/*.ts`.

**Example**
```ts
import { searchParamTypeToTs } from "@fhir-dsl/utils";

searchParamTypeToTs("string");
// → "{ type: \"string\"; value: string }"
```

**Notes** — Useful when writing custom post-processing for the generator output; keeps hand-written declarations aligned with the emitter.
