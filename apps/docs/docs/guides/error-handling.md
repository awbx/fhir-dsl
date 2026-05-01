---
id: error-handling
title: Error Handling
sidebar_label: Error Handling
description: "FhirDslError base, kind discriminator, structured context, cause chain, and the Result<T,E> + tryAsync toolkit for Effect-style typed handling."
---

# Error Handling

`@fhir-dsl/*` ships with a single error contract across every package, designed to feel like Kysely's structured DB errors with an Effect-style `Result<T, E>` channel on top.

The promise:

- **One catch.** `instanceof FhirDslError` matches anything thrown by anything in the monorepo.
- **One discriminator.** Every error has a `kind` literal you can `switch` on exhaustively.
- **One shape.** Every error carries structured `context` so the cause is a value, not a string to grep.
- **One serialiser.** `toJSON()` walks the `cause` chain into a transport-safe object — drop it into MCP responses, log aggregators, or error-tracking services as-is.

## At a glance

```ts
import { isFhirDslError, formatErrorChain, tryAsync, match } from "@fhir-dsl/utils";

const r = await tryAsync(() => fhir.create("Patient", patient));

match(r, {
  ok: (created) => console.log("created", created.id),
  err: (e) => {
    if (isFhirDslError(e)) {
      // typed handling — `e.kind` is a string literal, `e.context` is a payload
      console.error(e.kind, e.context);
    } else {
      // not one of ours — re-throw or log raw
      console.error("unknown:", formatErrorChain(e));
    }
  },
});
```

## The base class

Every domain error in `@fhir-dsl/*` extends `FhirDslError`:

```ts
abstract class FhirDslError<TKind extends string = string, TContext = unknown> extends Error {
  abstract readonly kind: TKind;
  readonly context: TContext;
  // standard Error: name, message, stack, cause (ES2022)
  toJSON(): SerializedFhirDslError;
}
```

Subclasses set `kind` to a unique string literal and pass relevant fields through `context`. Examples from the monorepo:

| Class | `kind` | `context` shape |
|---|---|---|
| `FhirRequestError` (core) | `"core.request"` | `{ status, statusText, operationOutcome }` |
| `AsyncPollingTimeoutError` (core) | `"core.async_polling_timeout"` | `{ statusUrl, attempts }` |
| `ValidationError` (core) | `"core.validation"` | `{ resourceType, issues, index? }` |
| `FhirError` (runtime) | `"runtime.fhir"` | `{ status, statusText, operationOutcome?, responseText? }` |
| `FhirPathSetterError` (fhirpath) | `"fhirpath.setter"` | `undefined` |
| `FhirPathEvaluationError` (fhirpath) | `"fhirpath.evaluation"` | `undefined` |
| `FhirPathLexerError` (fhirpath) | `"fhirpath.lexer"` | `{ pos }` |
| `FhirPathParseError` (fhirpath) | `"fhirpath.parse"` | `{ pos }` |
| `FhirPathInvariantCompileError` (fhirpath) | `"fhirpath.invariant_compile"` | `{ definition }` |
| `UcumError` (fhirpath) | `"fhirpath.ucum"` | `undefined` |
| `SmartAuthError` (smart) | `"smart.auth"` | `{ error, errorDescription?, status?, body? }` |
| `DiscoveryError` (smart) | `"smart.discovery"` | `{ url, status? }` |

Existing fields are preserved — `err.status`, `err.issues`, `err.pos`, `err.definition` etc. all keep working. `kind`, `context`, and `toJSON()` are additive.

## Catching errors

### One-line narrow at the boundary

`isFhirDslError` lifts an `unknown` from a `catch` clause into the structured shape:

```ts
import { isFhirDslError } from "@fhir-dsl/utils";

try {
  await fhir.create("Patient", patient);
} catch (err) {
  if (isFhirDslError(err)) {
    // err.kind, err.context, err.toJSON() all available
    console.error(err.kind, err.context);
  } else {
    throw err; // not ours — propagate
  }
}
```

### Exhaustive switch on `kind`

```ts
function describe(err: FhirDslError): string {
  switch (err.kind) {
    case "core.request":
      // err is FhirRequestError-shaped here — TS narrows by `kind`
      return `HTTP ${(err as FhirRequestError).status}: ${err.message}`;
    case "core.validation":
      return `Validation failed: ${(err as ValidationError).issues.length} issue(s)`;
    case "smart.auth":
      return `OAuth: ${(err as SmartAuthError).error}`;
    case "fhirpath.evaluation":
      return `FHIRPath: ${err.message}`;
    default:
      return `${err.kind}: ${err.message}`;
  }
}
```

### Walk the cause chain

```ts
import { formatErrorChain } from "@fhir-dsl/utils";

formatErrorChain(err);
// → "FhirRequestError: 503 Service Unavailable ← TypeError: fetch failed ← AbortError: aborted"
```

The walk is cycle-guarded, so circular `cause` references won't spin.

### Serialise for the wire

```ts
const wire = JSON.stringify(err);
// → {"name":"FhirRequestError","kind":"core.request","message":"...","context":{"status":503,"statusText":"Service Unavailable",...},"stack":"...","cause":{...}}
```

Round-trips cleanly through `JSON.parse` — preserve it across MCP responses, log aggregators, and error-tracking services.

## The `Result<T, E>` toolkit

For callers who want typed error handling without `try`/`catch`, `@fhir-dsl/utils` ships a thin Effect-flavoured `Result` channel.

### Lifting a throwing op

```ts
import { tryAsync, trySync } from "@fhir-dsl/utils";

// Async — common case for any FHIR network call
const r = await tryAsync(() => fhir.read("Patient", "123"));
if (r.ok) console.log("got", r.value.name);
else console.error("err", r.error);

// Sync — for FHIRPath / generator / parser code
const parsed = trySync(() => parseExpression(rawInput));
```

### Coercing arbitrary throws into a domain error

`tryAsync` accepts an optional second argument that maps the caught value into your preferred error shape — useful at module boundaries where you want a single error type to escape:

```ts
import { tryAsync, FhirDslError } from "@fhir-dsl/utils";

class MyServiceError extends FhirDslError<"my.service", { op: string }> {
  readonly kind = "my.service" as const;
}

const r = await tryAsync(
  () => fhir.create("Patient", patient),
  (cause) => new MyServiceError("create patient failed", { op: "create" }, { cause }),
);
// r.error is now MyServiceError, original error preserved on .cause
```

### Composing

```ts
import { mapErr, mapOk, match, Result } from "@fhir-dsl/utils";

const r: Result<Patient, FhirRequestError> = await tryAsync(/* ... */);

// Transform the success channel
const idOnly = mapOk(r, (p) => p.id);

// Transform the error channel — coerce HTTP errors to a domain shape
const domain = mapErr(r, (e) => ({ kind: "domain.create_failed" as const, status: e.status }));

// Dispatch by variant
const summary = match(r, {
  ok: (p) => `created ${p.id}`,
  err: (e) => `failed: ${e.message}`,
});
```

### When to reach for `Result` vs `try/catch`

- **`try/catch`** — when an error is exceptional (out-of-band, you bail). Works fine; the structured `FhirDslError` shape is yours either way.
- **`Result`** — when an error is expected (validation, network, auth) and the caller routinely needs to handle both branches. The compiler checks both branches; you can compose without nesting.

Both are first-class. Pick by what reads better at the call site.

## Wrapping your own errors

If you're building on top of `@fhir-dsl/*`, extending `FhirDslError` for your own domain types gets you the same machinery for free:

```ts
import { FhirDslError } from "@fhir-dsl/utils";

interface IngestErrorContext {
  bundleId: string;
  resourceCount: number;
  failureIndex: number;
}

export class IngestError extends FhirDslError<"my.ingest", IngestErrorContext> {
  readonly kind = "my.ingest" as const;

  constructor(message: string, context: IngestErrorContext, options?: ErrorOptions) {
    super(message, context, options);
  }
}

// Usage:
throw new IngestError(
  "bundle ingest failed at entry 7",
  { bundleId: bundle.id, resourceCount: bundle.entry.length, failureIndex: 7 },
  { cause: originalError },
);
```

Your callers get the same `instanceof FhirDslError`, `kind`-switch, `toJSON`, and `tryAsync` behaviour with no extra wiring.

## Migrating from `try/catch` strings

If you have code that grepped error messages, the structured `context` is the upgrade path:

```ts
// Before
try { await fhir.create("Patient", p); }
catch (err) {
  if (err instanceof Error && err.message.includes("503")) { /* ... */ }
}

// After
try { await fhir.create("Patient", p); }
catch (err) {
  if (isFhirDslError(err) && err.kind === "core.request" && err.context.status === 503) { /* ... */ }
}
```

The `context` field is the same data the message was built from — but as a value, not a string.

## See also

- [`@fhir-dsl/utils` API reference](../api/utils.md) — full export list and signatures.
- [`@fhir-dsl/core` API reference](../api/core.md) — `FhirRequestError` and `ValidationError` details.
- [Validation guide](./validation.md) — `ValidationError` issue shape and integration with Standard Schema.
