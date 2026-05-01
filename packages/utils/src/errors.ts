/**
 * Common error machinery for the @fhir-dsl/* packages. Inspired by
 * Kysely's structured DB errors and Effect's typed error channel.
 *
 * Every domain error class extends `FhirDslError`, which gives callers:
 *
 *   - One `instanceof FhirDslError` check that catches anything thrown
 *     by any package in this monorepo.
 *   - A `kind` discriminator for `switch (err.kind)` exhaustiveness.
 *   - A structured `context` payload so the cause is a value, not a
 *     string to grep.
 *   - A native ES2022 `cause` chain for "X failed because Y failed".
 *   - A `toJSON()` that's safe to ship across process boundaries
 *     (MCP responses, log aggregators, error-tracking services).
 *
 * The `Result<T, E>` type and the `tryAsync` / `trySync` helpers give
 * callers an Effect-style typed-error channel without `try`/`catch`.
 */

/**
 * Abstract base for every error type defined in @fhir-dsl/*.
 *
 * Subclasses MUST set `kind` to a unique string literal (e.g.
 * `"core.request"`, `"fhirpath.evaluation"`) and SHOULD pass relevant
 * fields through `context` so callers can pattern-match on values
 * instead of parsing message strings.
 *
 * `cause` is the native ES2022 error chain. Wrap underlying failures
 * via `new MyError("...", { cause: originalError })` — the chain is
 * preserved through `.toJSON()` and `formatErrorChain()`.
 */
export abstract class FhirDslError<TKind extends string = string, TContext = unknown> extends Error {
  abstract readonly kind: TKind;
  readonly context: TContext;

  constructor(message: string, context: TContext, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.context = context;
    // Preserve a clean stack trace where supported.
    if (typeof (Error as { captureStackTrace?: unknown }).captureStackTrace === "function") {
      (Error as { captureStackTrace: (target: object, ctor: unknown) => void }).captureStackTrace(this, new.target);
    }
  }

  /**
   * Serialise to a transport-safe object. Includes the full `cause`
   * chain and any structured context. Stack traces are included so
   * server-side logs can correlate, but the caller may strip them
   * before forwarding to untrusted clients.
   */
  toJSON(): SerializedFhirDslError {
    return serialize(this);
  }
}

export interface SerializedFhirDslError {
  name: string;
  kind: string;
  message: string;
  context: unknown;
  stack?: string;
  cause?: SerializedFhirDslError | { name: string; message: string; stack?: string };
}

function serialize(err: unknown): SerializedFhirDslError {
  if (err instanceof FhirDslError) {
    const out: SerializedFhirDslError = {
      name: err.name,
      kind: err.kind,
      message: err.message,
      context: err.context,
    };
    if (err.stack !== undefined) out.stack = err.stack;
    if (err.cause !== undefined) out.cause = serialize(err.cause);
    return out;
  }
  if (err instanceof Error) {
    const out: SerializedFhirDslError = {
      name: err.name,
      kind: "unknown",
      message: err.message,
      context: undefined,
    };
    if (err.stack !== undefined) out.stack = err.stack;
    if (err.cause !== undefined) out.cause = serialize(err.cause);
    return out;
  }
  return {
    name: "NonError",
    kind: "unknown",
    message: String(err),
    context: err,
  };
}

/**
 * Type guard for the common base. Useful at boundaries where a generic
 * `unknown` (e.g. a `catch` parameter) needs to be narrowed before any
 * structured handling.
 *
 * ```ts
 * try { await client.create(patient) } catch (err) {
 *   if (isFhirDslError(err)) console.error(err.kind, err.context);
 *   else throw err;
 * }
 * ```
 */
export function isFhirDslError(value: unknown): value is FhirDslError {
  return value instanceof FhirDslError;
}

/**
 * Walk the `cause` chain into a one-line string suitable for logs.
 * Each link is rendered as `"Name: message"`, joined by ` ← `.
 */
export function formatErrorChain(err: unknown): string {
  const parts: string[] = [];
  let current: unknown = err;
  const seen = new WeakSet<object>();
  while (current != null) {
    if (typeof current === "object" && seen.has(current as object)) break;
    if (typeof current === "object") seen.add(current as object);
    if (current instanceof Error) {
      parts.push(`${current.name}: ${current.message}`);
      current = (current as { cause?: unknown }).cause;
      continue;
    }
    parts.push(String(current));
    break;
  }
  return parts.join(" ← ");
}

// ──────────────── Result<T, E> ────────────────

/**
 * Effect-style typed-error result. Use `tryAsync`/`trySync` to lift
 * throwing functions into a `Result`, then `match` to consume.
 *
 * ```ts
 * const r = await tryAsync(() => client.read("Patient", "123"));
 * if (r.ok) console.log(r.value.name);
 * else console.error(r.error.kind, r.error.context);
 * ```
 *
 * The discriminator is `ok: true | false` — discriminated by literal
 * boolean so `if (r.ok)` narrows in TypeScript without an extra import.
 */
export type Result<T, E = FhirDslError> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export const Result = {
  ok<T>(value: T): Ok<T> {
    return { ok: true, value };
  },
  err<E>(error: E): Err<E> {
    return { ok: false, error };
  },
  isOk<T, E>(r: Result<T, E>): r is Ok<T> {
    return r.ok;
  },
  isErr<T, E>(r: Result<T, E>): r is Err<E> {
    return !r.ok;
  },
} as const;

/**
 * Lift a throwing async function into a `Result`. Optionally pass
 * `mapError` to coerce arbitrary throws into a typed error class —
 * useful when the underlying function may throw plain `Error`s but the
 * caller wants a domain `FhirDslError` to flow through.
 */
export async function tryAsync<T, E = unknown>(
  fn: () => Promise<T>,
  mapError?: (err: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return Result.ok(await fn());
  } catch (err) {
    return Result.err(mapError ? mapError(err) : (err as E));
  }
}

/** Sync variant of `tryAsync`. */
export function trySync<T, E = unknown>(fn: () => T, mapError?: (err: unknown) => E): Result<T, E> {
  try {
    return Result.ok(fn());
  } catch (err) {
    return Result.err(mapError ? mapError(err) : (err as E));
  }
}

/**
 * Map the error channel without disturbing a successful value. Common
 * shape: convert a generic thrown `Error` into a domain `FhirDslError`.
 */
export function mapErr<T, E, F>(r: Result<T, E>, fn: (e: E) => F): Result<T, F> {
  return r.ok ? r : Result.err(fn(r.error));
}

/**
 * Map the success channel without disturbing the error.
 */
export function mapOk<T, E, U>(r: Result<T, E>, fn: (t: T) => U): Result<U, E> {
  return r.ok ? Result.ok(fn(r.value)) : r;
}

/**
 * Run one of two callbacks based on the result variant. The return
 * type is the union of both callback returns, mirroring Effect.
 */
export function match<T, E, R1, R2>(
  r: Result<T, E>,
  handlers: { ok: (value: T) => R1; err: (error: E) => R2 },
): R1 | R2 {
  return r.ok ? handlers.ok(r.value) : handlers.err(r.error);
}
