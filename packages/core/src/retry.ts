// REST-6 (spec): 429 Too Many Requests and 503 Service Unavailable indicate
// transient capacity problems. Clients SHOULD retry after the delay advertised
// in the `Retry-After` header (RFC 7231 §7.1.3). Absent the header, back off
// with jitter to avoid thundering-herd on server recovery.

export interface RetryPolicy {
  /** Max total attempts including the first one. Default 3. */
  maxAttempts?: number;
  /** HTTP statuses that are considered retryable. Default `[429, 503]`. */
  retryOn?: ReadonlyArray<number>;
  /** Base backoff in ms for exponential backoff when no Retry-After. Default 100. */
  baseBackoffMs?: number;
  /** Upper bound on a single backoff in ms. Default 30_000. */
  maxBackoffMs?: number;
  /** Injectable clock for tests. Default `setTimeout`. */
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  /** Injectable jitter RNG for tests. Default `Math.random`. */
  random?: () => number;
}

export type RetryConfig = RetryPolicy | boolean | undefined;

export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_BASE_BACKOFF_MS = 100;
export const DEFAULT_MAX_BACKOFF_MS = 30_000;
export const DEFAULT_RETRY_STATUSES: ReadonlyArray<number> = [429, 503];

export function resolveRetryPolicy(config: RetryConfig): Required<RetryPolicy> | undefined {
  if (config === false) return undefined;
  const p = config === true || config === undefined ? {} : config;
  return {
    maxAttempts: p.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
    retryOn: p.retryOn ?? DEFAULT_RETRY_STATUSES,
    baseBackoffMs: p.baseBackoffMs ?? DEFAULT_BASE_BACKOFF_MS,
    maxBackoffMs: p.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS,
    sleep: p.sleep ?? defaultSleep,
    random: p.random ?? Math.random,
  };
}

function defaultSleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const t = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(abortError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function abortError(): Error {
  const DOMExceptionCtor = (globalThis as { DOMException?: typeof DOMException }).DOMException;
  if (DOMExceptionCtor) return new DOMExceptionCtor("aborted", "AbortError");
  const e = new Error("aborted");
  e.name = "AbortError";
  return e;
}

// RFC 7231 §7.1.3: Retry-After is either delta-seconds or HTTP-date. Absent/
// invalid values return undefined so the caller falls back to backoff.
export function parseRetryAfter(value: string | null | undefined, now: number = Date.now()): number | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed) * 1000;
  const date = Date.parse(trimmed);
  if (Number.isNaN(date)) return undefined;
  return Math.max(0, date - now);
}

// Full-jitter exponential backoff (AWS-recommended): waits a random value in
// [0, min(maxBackoffMs, base * 2^attempt)]. `attempt` is 0-indexed for the
// *next* sleep (0 before the 2nd try, 1 before the 3rd, …).
export function computeBackoffMs(policy: Required<RetryPolicy>, attempt: number): number {
  const cap = Math.min(policy.maxBackoffMs, policy.baseBackoffMs * 2 ** attempt);
  return Math.floor(policy.random() * cap);
}
