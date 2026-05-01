# @fhir-dsl/utils

Shared toolbox for the `fhir-dsl` monorepo: the cross-package error contract (`FhirDslError` + `Result<T, E>` + helpers), a leveled logger, naming helpers, and the search-param → TS literal mapper.

Every other `@fhir-dsl/*` package re-exports its own error subclasses from here, so error shapes stay identical across the monorepo. You can install `@fhir-dsl/utils` directly when you want to extend the contract from your own code.

## Install

```bash
npm install @fhir-dsl/utils
```

## Errors

Every error in `@fhir-dsl/*` extends `FhirDslError`, which carries:

- `kind` — a string-literal discriminator (e.g. `"core.request"`, `"fhirpath.evaluation"`).
- `context` — a structured payload, typed per subclass.
- `cause` — the native ES2022 cause chain, walked by `toJSON()` and `formatErrorChain()`.
- `toJSON()` — returns a transport-safe `SerializedFhirDslError`.

```ts
import { isFhirDslError, formatErrorChain } from "@fhir-dsl/utils";
import { FhirRequestError } from "@fhir-dsl/core";

try {
  await fhir.read("Patient", "123");
} catch (err) {
  if (isFhirDslError(err)) {
    console.error(err.kind, err.context);
    console.error(formatErrorChain(err));
    // FhirRequestError: 503 Service Unavailable ← TypeError: fetch failed
  }
  if (err instanceof FhirRequestError) {
    console.error("status:", err.context.status);
  }
}
```

To define your own subclass, extend `FhirDslError` with a unique `kind` and a typed context payload:

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

## Result toolkit

`Result<T, E>` is a discriminated union with a literal `ok` boolean — narrow without an extra import. `tryAsync` / `trySync` lift throwing functions into a `Result`, with an optional `mapError` hook for boundary coercion.

```ts
import { tryAsync, mapOk, match } from "@fhir-dsl/utils";

const r = await tryAsync(() => fhir.read("Patient", "123"));
if (r.ok) console.log(r.value);
else console.error("status:", r.error.context.status);

const idOnly = mapOk(r, (p) => p.id);

const summary = match(r, {
  ok: (p) => `read ${p.id}`,
  err: (e) => `failed: ${e.message}`,
});
```

`mapErr` / `mapOk` / `match` round out an Effect-style typed channel — see the [error-handling guide](https://awbx.github.io/fhir-dsl/docs/guides/error-handling) for the full surface and the table of built-in subclasses.

## Logger

```ts
import { Logger, logger } from "@fhir-dsl/utils";

logger.info("generating types"); // default singleton, level "info"

const quiet = new Logger("error");
quiet.debug("dropped"); // suppressed
quiet.error("only errors escape", { attempt: 3 });
```

The default singleton is at level `info` and has no public level setter — construct your own `new Logger("debug")` when you need verbose output (e.g. generator diagnostics).

## Internal helpers

Re-exported for the generator and CLI; stable but rarely useful outside the monorepo.

```ts
import {
  toPascalCase,        // "observation-category" → "ObservationCategory"
  toCamelCase,         // "observation_category" → "observationCategory"
  toKebabCase,         // "ObservationCategory"   → "observation-category"
  fhirTypeToFileName,  // "Observation"           → "observation.ts"
  fhirPathToPropertyName, // "Patient.name.given" → "name.given"
  capitalizeFirst,     // "patient" → "Patient"
  searchParamTypeToTs, // "string"  → '{ type: "string"; value: string }'
} from "@fhir-dsl/utils";
```

`searchParamTypeToTs` returns the exact TypeScript literal the generator emits into `search-params/*.ts`; the inputs are FHIR search-param types (`"string"`, `"token"`, `"date"`, `"reference"`, `"quantity"`, `"number"`, `"uri"`, `"composite"`, `"special"`).

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
