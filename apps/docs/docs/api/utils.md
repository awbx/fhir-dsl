---
sidebar_position: 9
title: "@fhir-dsl/utils"
description: "FhirDslError base, Result<T,E> + tryAsync/match toolkit, leveled logger, naming helpers, and the search-param → TS literal mapping."
---

# @fhir-dsl/utils

## Overview

`@fhir-dsl/utils` is the shared toolbox: the cross-package error contract (`FhirDslError` + `Result<T, E>` + helpers), a tiny leveled logger, string naming helpers (`toPascalCase`, `toCamelCase`, `toKebabCase`, …), and the `searchParamTypeToTs` mapper used by the generator. Every other `@fhir-dsl/*` package imports from here so error shapes and naming stay identical across the monorepo.

## Installation

```bash
npm install @fhir-dsl/utils
```

## Exports

| Name | Kind | One-liner |
|---|---|---|
| **Errors** | | |
| `FhirDslError` | abstract class | Common base for every error in `@fhir-dsl/*` — `kind` discriminator, structured `context`, ES2022 `cause`, `toJSON()`. |
| `SerializedFhirDslError` | type | The shape `toJSON()` emits — transport-safe across MCP, logs, error-trackers. |
| `isFhirDslError` | function | Type-guard that narrows `unknown` (e.g. a `catch` param) to `FhirDslError`. |
| `formatErrorChain` | function | Walk the `cause` chain into a one-line log string, cycle-guarded. |
| **Result toolkit** | | |
| `Result<T, E>` | type | `Ok<T> \| Err<E>` discriminated by literal `ok` boolean. |
| `Ok<T>` / `Err<E>` | types | The two variants. |
| `Result` | const | `{ ok, err, isOk, isErr }` constructor + guard helpers. |
| `tryAsync` | function | Lift a throwing async function into a `Result`. |
| `trySync` | function | Sync variant of `tryAsync`. |
| `mapErr` | function | Transform the error channel without disturbing a successful value. |
| `mapOk` | function | Transform the success channel without disturbing the error. |
| `match` | function | Dispatch by variant — the union-of-callbacks-return type mirrors Effect. |
| **Logger** | | |
| `LogLevel` | type | `"debug"` \| `"info"` \| `"warn"` \| `"error"`. |
| `Logger` | class | Level-gated console wrapper. |
| `logger` | const | Default singleton (level `info`). |
| **Naming helpers** | | |
| `toPascalCase` | function | `"observation_category"` → `"ObservationCategory"`. |
| `toCamelCase` | function | `"Observation-Category"` → `"observationCategory"`. |
| `toKebabCase` | function | `"ObservationCategory"` → `"observation-category"`. |
| `fhirTypeToFileName` | function | `"ObservationCategory"` → `"observation-category.ts"`. |
| `fhirPathToPropertyName` | function | `"Patient.name"` → `"name"`. |
| `capitalizeFirst` | function | `"patient"` → `"Patient"`. |
| `searchParamTypeToTs` | function | `"string"` → `'{ type: "string"; value: string }'`. |

## Error API

### `FhirDslError`

**Signature**

```ts
abstract class FhirDslError<TKind extends string = string, TContext = unknown> extends Error {
  abstract readonly kind: TKind;
  readonly context: TContext;
  // standard Error: name, message, stack, cause (ES2022)
  toJSON(): SerializedFhirDslError;
}

interface SerializedFhirDslError {
  name: string;
  kind: string;
  message: string;
  context: unknown;
  stack?: string;
  cause?: SerializedFhirDslError | { name: string; message: string; stack?: string };
}
```

**Notes**

- Subclasses MUST set `kind` to a unique string literal (e.g. `"core.request"`, `"fhirpath.evaluation"`).
- Pass relevant fields through `context` so callers can pattern-match on values instead of parsing message strings.
- `cause` is the native ES2022 chain — propagated via the optional second arg to `super()` and walked by `toJSON()` and `formatErrorChain()`.

**Example**

```ts
import { FhirDslError } from "@fhir-dsl/utils";

interface IngestErrorContext {
  bundleId: string;
  failureIndex: number;
}

class IngestError extends FhirDslError<"my.ingest", IngestErrorContext> {
  readonly kind = "my.ingest" as const;
}

throw new IngestError(
  "bundle ingest failed at entry 7",
  { bundleId: "b-1", failureIndex: 7 },
  { cause: originalError },
);
```

See the [error-handling guide](../guides/error-handling.md) for the full table of built-in subclasses and their `context` shapes.

---

### `isFhirDslError`

**Signature**

```ts
function isFhirDslError(value: unknown): value is FhirDslError;
```

**Example**

```ts
import { isFhirDslError } from "@fhir-dsl/utils";

try {
  await fhir.create("Patient", patient);
} catch (err) {
  if (isFhirDslError(err)) {
    console.error(err.kind, err.context);
  } else {
    throw err;
  }
}
```

---

### `formatErrorChain`

**Signature**

```ts
function formatErrorChain(err: unknown): string;
```

**Returns** — `"Name: message ← Name: message ← …"`. Cycle-guarded; non-Error throws are stringified.

**Example**

```ts
import { formatErrorChain } from "@fhir-dsl/utils";

formatErrorChain(err);
// → "FhirRequestError: 503 Service Unavailable ← TypeError: fetch failed"
```

---

## Result API

### `Result<T, E>` and constructors

**Signature**

```ts
type Result<T, E = FhirDslError> = Ok<T> | Err<E>;

interface Ok<T>  { readonly ok: true;  readonly value: T; }
interface Err<E> { readonly ok: false; readonly error: E; }

const Result: {
  ok<T>(value: T): Ok<T>;
  err<E>(error: E): Err<E>;
  isOk<T, E>(r: Result<T, E>): r is Ok<T>;
  isErr<T, E>(r: Result<T, E>): r is Err<E>;
};
```

**Notes** — Discriminated by the literal `ok` boolean, so `if (r.ok)` narrows in TypeScript without an extra import.

---

### `tryAsync` / `trySync`

**Signature**

```ts
function tryAsync<T, E = unknown>(
  fn: () => Promise<T>,
  mapError?: (err: unknown) => E,
): Promise<Result<T, E>>;

function trySync<T, E = unknown>(
  fn: () => T,
  mapError?: (err: unknown) => E,
): Result<T, E>;
```

**Example**

```ts
import { tryAsync } from "@fhir-dsl/utils";
import { FhirRequestError } from "@fhir-dsl/core";

const r = await tryAsync<Patient, FhirRequestError>(() => fhir.read("Patient", "123"));
if (r.ok) console.log(r.value);
else console.error("status:", r.error.status);
```

`mapError` is the boundary-coercion hook — convert arbitrary throws into a domain error before they leave your module:

```ts
const r = await tryAsync(
  () => maybeThrowingThirdParty(),
  (cause) => new MyDomainError("upstream failed", { op: "...", }, { cause }),
);
```

---

### `mapErr` / `mapOk` / `match`

**Signature**

```ts
function mapErr<T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F>;
function mapOk<T, E, U>(r: Result<T, E>, fn: (t: T) => U): Result<U, E>;
function match<T, E, R1, R2>(
  r: Result<T, E>,
  handlers: { ok: (value: T) => R1; err: (error: E) => R2 },
): R1 | R2;
```

**Example**

```ts
import { mapErr, mapOk, match } from "@fhir-dsl/utils";

const r = await tryAsync(() => fhir.read("Patient", id));
const idOnly = mapOk(r, (p) => p.id);
const domain  = mapErr(r, (e) => ({ kind: "domain.fail" as const, source: e }));
const summary = match(r, {
  ok: (p) => `read ${p.id}`,
  err: (e) => `failed: ${e.message}`,
});
```

---

## Logger

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

**Notes** — The default singleton is at level `info`. To see generator diagnostics, construct your own `new Logger("debug")` — the singleton's level is set at construction with no public setter.

**Example**

```ts
import { Logger, logger } from "@fhir-dsl/utils";

logger.info("generating types");
const quiet = new Logger("error");
quiet.debug("dropped");
quiet.error("only errors escape", { attempt: 3 });
```

---

## Naming helpers

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
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  fhirTypeToFileName,
  fhirPathToPropertyName,
} from "@fhir-dsl/utils";

toPascalCase("observation-category"); // "ObservationCategory"
toCamelCase("observation_category");  // "observationCategory"
toKebabCase("ObservationCategory");   // "observation-category"
fhirTypeToFileName("Observation");    // "observation.ts"
fhirPathToPropertyName("Patient.name.given"); // "name.given"
```

**Notes** — `toPascalCase` does not dedupe consecutive caps; `"ID"` → `"ID"`, not `"Id"`. `fhirPathToPropertyName` strips the leading resource type but preserves remaining dots.

---

## `searchParamTypeToTs`

**Signature**

```ts
function searchParamTypeToTs(paramType: string): string;
```

**Parameters** — `paramType` is one of `"string"`, `"token"`, `"date"`, `"reference"`, `"quantity"`, `"number"`, `"uri"`, `"composite"`, `"special"`.

**Returns** — A TypeScript literal type string such as `'{ type: "string"; value: string }'`, matching exactly what the generator emits into `search-params/*.ts`.

**Example**

```ts
import { searchParamTypeToTs } from "@fhir-dsl/utils";

searchParamTypeToTs("string");
// → '{ type: "string"; value: string }'
```
