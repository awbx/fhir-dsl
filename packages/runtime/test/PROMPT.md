# Test Prompt: `@fhir-dsl/runtime`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/runtime` — the HTTP executor + pagination layer — to
production-grade coverage using **vitest**. No source changes. No new
runtime dependencies (devtime `msw` is acceptable if you need it).

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/runtime` is the
HTTP layer used by `@fhir-dsl/core`'s default executor: it sends the
compiled request, handles retries / aborts / errors, parses pagination
`link` relations, and produces result envelopes.

## Package brief

Public surface (`packages/runtime/src/index.ts`):

- `config.ts` — `RuntimeConfig`, retry settings, timeouts.
- `errors.ts` — `FhirRequestError` + helpers; carries `OperationOutcome`
  when the server sent one.
- `executor.ts` — the function used by core to issue a request, honoring
  retry + abort + timeout.
- `pagination.ts` — parses Bundle `link[]` into `next`, `prev`, `first`,
  `last`, `self`.
- `result.ts` — assembles the `SearchResult`/`ReadResult` shape.

### Files to read first

1. `packages/runtime/src/index.ts`
2. `packages/runtime/src/config.ts`
3. `packages/runtime/src/errors.ts` + `errors.test.ts`
4. `packages/runtime/src/executor.ts` + `executor.test.ts`
5. `packages/runtime/src/pagination.ts` + `pagination.test.ts`
6. `packages/runtime/src/result.ts` + `result.test.ts`

## Existing coverage (do not duplicate)

- `errors.test.ts` — error construction with/without OperationOutcome.
- `executor.test.ts` — base happy-path + an error path.
- `pagination.test.ts` — next/self link extraction.
- `result.test.ts` — envelope shape.

## Coverage gaps to fill

Write tests in `packages/runtime/test/`.

### Retry matrix

1. **Retryable status codes**. 408, 429, 500, 502, 503, 504 each retry up
   to the configured max; counter increments; final failure surfaces the
   status.
2. **Non-retryable status codes**. 400, 401, 403, 404, 422 fail
   immediately with no retry.
3. **Network errors**. A rejected `fetch` (`TypeError`, `fetch failed`)
   retries if retry-on-network-error is enabled; otherwise fails.
4. **Retry-After header**. If the server sends `Retry-After: 3`, the
   executor waits ≥ 3s (use fake timers + `vi.useFakeTimers()`); a
   date-form `Retry-After: <HTTP-date>` is also honored. Invalid values
   fall back to the default backoff.
5. **Backoff growth**. With default config, successive retries wait
   longer — assert monotonically increasing sleeps. Include jitter's
   upper bound if the implementation adds jitter.

### Timeout + abort

6. **Timeout**. A request that takes longer than `config.timeoutMs`
   aborts and throws a descriptive error. Use fake timers.
7. **External `AbortSignal`**. An aborted signal immediately rejects the
   in-flight request with an abort error.
8. **Abort during retry sleep**. Aborting while the executor is waiting
   between retries short-circuits the sleep and throws.

### Pagination

9. **Every link rel present**: `next`, `prev`, `first`, `last`, `self`
   are each surfaced when the server returns them.
10. **Missing `link[]`**: `pagination()` returns an object with all
    fields `undefined` and does not throw.
11. **Duplicate rels**: a bundle with two `next` links uses the first
    (document the chosen policy in the test title).
12. **Malformed URL** in a link: the parser does not throw; it either
    surfaces the raw string or skips the entry (match the implementation).

### Result assembly

13. **`raw`** always references the original Bundle passed in (identity
    equality).
14. **`data` vs `included`** split: `entry[].search.mode === "match"`
    (or missing) goes to `data`; `"include"` goes to `included`;
    `"outcome"` is dropped.
15. **`total`** passes through; missing → `undefined`.

### `FhirRequestError`

16. **With `OperationOutcome`**: `err.operationOutcome` is populated,
    `issue` is accessible, and `err.message` includes the primary issue
    diagnostic.
17. **Without body** (HTML 502 from a proxy): `operationOutcome` is
    `undefined`, `err.body` is the raw text, and `err.message` is still
    useful.

## Research directives

- HTTP retry / backoff — RFC 7231 §7.1.3 for `Retry-After`:
  <https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.3>.
- FHIR Bundle link format:
  <https://www.hl7.org/fhir/R4/bundle.html> (see `Bundle.link`).
- FHIR OperationOutcome:
  <https://www.hl7.org/fhir/R4/operationoutcome.html>.
- AbortSignal + AbortController MDN:
  <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal>.
- vitest fake timers:
  <https://vitest.dev/guide/mocking.html#timers>.

## Conventions

- vitest `globals: true`. Use `vi.useFakeTimers()` for retry + timeout
  tests — never actually sleep.
- No network. Either override `fetch` with a `vi.fn()` or use `msw/node`
  with a tight per-test lifecycle.
- Assert on timings: after advancing timers, check the mocked fetch was
  called the expected number of times at the expected moments.

## Workflow

1. Read source + existing tests.
2. Write new tests in `packages/runtime/test/` grouped by concern:
   `retry.test.ts`, `timeout-abort.test.ts`, `pagination.test.ts`,
   `result.test.ts`, `errors.test.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 test.
- No real HTTP.
- All three gates green.
- No source changes.

## Out of scope

- Adding new retry policies or timeout knobs.
- HTTP/2, streaming, or compression.
- Replacing `fetch` at runtime.
