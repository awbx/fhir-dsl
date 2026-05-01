---
id: async-pattern
title: Async Pattern
sidebar_label: Async Pattern
sidebar_position: 6
---

# Async Pattern (`Prefer: respond-async`)

FHIR R5 §3.2.6 defines an **async pattern** for requests that are too expensive for the server to satisfy synchronously. The client signals willingness with `Prefer: respond-async`; the server replies `202 Accepted` with a `Content-Location` header pointing at a status URL; the client polls that URL until a non-202 status lands, honouring `Retry-After` between polls.

fhir-dsl implements this as a first-class executor mode. You opt in per-request via `ExecuteOptions.prefer`, and configure polling globally via `FhirClientConfig.async`.

## When to use it

- **`$everything`** on a busy patient — the server may need seconds to hours.
- **`$export`** (bulk data) — always async; the job can take minutes.
- **Aggregate operations** (`$evaluate-measure`, `$group-export`) on large populations.
- **Ad-hoc long searches** where the server would otherwise hit a timeout.

For a routine search that returns in well under a second, do not enable async — the 202 polling adds at least one extra round-trip.

## The flow

```
  Client                                          Server
    │
    │── POST /Patient/$everything ────────────────►
    │   Prefer: respond-async
    │
    ◄── 202 Accepted ─────────────────────────────
    │   Content-Location: /async/job-123
    │   Retry-After: 10
    │
    │  (wait 10s)
    │
    │── GET /async/job-123 ────────────────────────►
    │
    ◄── 202 Accepted (still working)──────────────
    │   Retry-After: 5
    │
    │  (wait 5s)
    │
    │── GET /async/job-123 ────────────────────────►
    │
    ◄── 200 OK ───────────────────────────────────
        Bundle / OperationOutcome / ...
```

Everything between the initial POST and the final 200 happens inside `.execute()`. The caller sees a single `Promise` that resolves with the final body.

## Minimal example

```typescript
import { createFhirClient } from "@fhir-dsl/core";
import type { FhirSchema } from "./fhir/r4/client";

const fhir = createFhirClient<FhirSchema>({
  baseUrl: "https://fhir.example/r4",
  // Enable polling. Defaults: pollingInterval 2000 ms, maxAttempts 60.
  async: { pollingInterval: 1000, maxAttempts: 30 },
});

const bundle = await fhir
  .operation("$everything", {
    scope: { kind: "instance", resourceType: "Patient", id: "example" },
  })
  .execute({ prefer: { respondAsync: true } });

console.log((bundle as { resourceType?: string }).resourceType); // "Bundle"
```

Two pieces combined:

1. `async: { ... }` on the client tells the executor *how* to poll.
2. `prefer: { respondAsync: true }` on a specific `.execute()` call tells the executor *when* to ask for async.

:::note Gotcha — both pieces are required
If you set `prefer: { respondAsync: true }` but forget the client-level `async` config, a 202 response is returned as-is (whatever body the server sent, typically empty). No polling happens. Likewise, if you configure `async` but never send `respondAsync`, the server will answer synchronously and polling never triggers.
:::

## The `Prefer` header

`ExecuteOptions.prefer` is typed as `PreferOptions` (`packages/core/src/query-builder.ts:55`):

```typescript
interface PreferOptions {
  return?: "minimal" | "representation" | "OperationOutcome";
  handling?: "strict" | "lenient";
  respondAsync?: boolean;
}
```

`compilePreferHeader(options)` joins the active directives with `, `:

```typescript
.execute({
  prefer: { respondAsync: true, handling: "strict" },
})
// sets Prefer: handling=strict, respond-async
```

Source: `packages/core/src/query-builder.ts:86`.

## 202 + `Content-Location` detection

`maybePollAsync` (`packages/core/src/fhir-client.ts:161`) runs after every request. It returns early unless:

- `config.async` is set (the client opted into polling); **and**
- the response status is exactly `202`; **and**
- the response carries a `Content-Location` header.

When all three hold, it loops up to `maxAttempts` times, sleeping `Retry-After` (if the server sent one) or `pollingInterval` otherwise, GETting the status URL each time. On a 2xx non-202 response, the final body is returned to the caller. On a 4xx/5xx, a `FhirRequestError` is thrown with the server's `OperationOutcome`.

## `Retry-After`

`parseRetryAfterToMs` (`fhir-client.ts:203`) accepts both shapes the RFC permits:

- **Delta-seconds** — `Retry-After: 10` → 10 000 ms.
- **HTTP-date** — `Retry-After: Fri, 19 Apr 2026 14:00:00 GMT` → `max(0, date - now)`.

If the server does not send `Retry-After`, the client falls back to `pollingInterval` (default 2000 ms).

:::note One gotcha — clock skew is your problem
HTTP-date `Retry-After` is interpreted against the *client's* clock. If your client is ahead of the server, you may poll sooner than the server intended; if behind, you wait longer. The delta-seconds form avoids this — and most servers send seconds.
:::

## `AsyncPollingConfig`

```typescript
interface AsyncPollingConfig {
  /** Polling interval when the server does not send Retry-After. Default: 2000ms. */
  pollingInterval?: number;
  /** Maximum number of poll attempts before giving up. Default: 60. */
  maxAttempts?: number;
}
```

With the defaults, the client will poll for up to `60 × 2000 ms = 120 s` on a server that never sets `Retry-After`. Servers that *do* set `Retry-After` will stretch or compress that budget as they see fit — `maxAttempts` is a count of polls, not a wall-clock deadline.

Tune them per workload:

```typescript
// Bulk export — patient expected to take minutes
createFhirClient({ async: { pollingInterval: 15_000, maxAttempts: 40 } }); // up to 10 minutes

// Sync-ish operation just in case it's slow
createFhirClient({ async: { pollingInterval: 500,    maxAttempts: 20 } }); // up to ~10 s
```

## `AsyncPollingTimeoutError`

When `maxAttempts` is exhausted without a terminal response, the client throws:

```typescript
class AsyncPollingTimeoutError extends FhirDslError<"core.async_polling_timeout", AsyncPollingTimeoutErrorContext> {
  readonly kind: "core.async_polling_timeout";
  readonly statusUrl: string;
  readonly attempts: number;
}
interface AsyncPollingTimeoutErrorContext {
  readonly statusUrl: string;
  readonly attempts: number;
}
```

(`packages/core/src/fhir-client.ts`.) Like every error in the monorepo, it extends [`FhirDslError`](../guides/error-handling.md) — pattern-match on `kind` rather than the class identity, and read structured `context` instead of parsing `.message`. Catch it separately from `FhirRequestError`:

```typescript
import { isFhirDslError } from "@fhir-dsl/utils";

try {
  const bundle = await fhir
    .operation("$export", { scope: { kind: "system" } })
    .execute({ prefer: { respondAsync: true } });
} catch (err) {
  if (isFhirDslError(err) && err.kind === "core.async_polling_timeout") {
    // Pick up later by polling err.context.statusUrl yourself, or give up
    console.warn(`gave up after ${err.context.attempts} polls of ${err.context.statusUrl}`);
  } else throw err;
}
```

:::note Gotcha — the job is not cancelled by a timeout
`AsyncPollingTimeoutError` just means the *client* stopped waiting. The server's job keeps running. If you have a handle on the status URL you can resume polling later, or call whatever cancellation endpoint the server exposes (there is no standard one in FHIR).
:::

## `AbortSignal` works here too

Pass a signal to `execute({ signal })` and polling honours it:

```typescript
const controller = new AbortController();
setTimeout(() => controller.abort(), 30_000);

const bundle = await fhir
  .operation("$everything", { scope: { kind: "instance", resourceType: "Patient", id: "example" } })
  .execute({ prefer: { respondAsync: true }, signal: controller.signal });
```

The `sleepWithAbort` helper (`fhir-client.ts:212`) rejects the in-flight sleep with an `AbortError` as soon as the controller aborts, so an abort during a 30 s `Retry-After` wait does not have to wait for the sleep to finish.

## The wire diagram

```
  query builder                  executor                    server
       │                             │                          │
       │─.execute({ prefer:          │                          │
       │   { respondAsync: true }})─►│                          │
       │                             │─POST /Patient/$everything▶
       │                             │  Prefer: respond-async   │
       │                             │                          │
       │                             ◄─202 Accepted ────────────
       │                             │   Content-Location: /j/1 │
       │                             │   Retry-After: 10        │
       │                             │                          │
       │                             │  sleep 10s (or until abort)
       │                             │                          │
       │                             │─GET /j/1 ────────────────▶
       │                             │                          │
       │                             ◄─200 OK Bundle────────────
       │                             │                          │
       ◄──── Promise resolves ───────│                          │
          with final Bundle
```

End-to-end, the caller sees one `Promise`. The polling loop is an internal detail — and because polling goes through the same `performRequest` the original call did, retry / redirect-safe auth / headers / the configured `fetch` all apply on every poll.
