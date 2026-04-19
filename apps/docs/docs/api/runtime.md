---
sidebar_position: 2
title: "@fhir-dsl/runtime"
description: "Redirect-safe FHIR fetch executor, pagination with cycle detection, and FhirError with OperationOutcome parsing."
---

# @fhir-dsl/runtime

## Overview
`@fhir-dsl/runtime` is the lower-level HTTP layer. `FhirExecutor` wraps a `performRequest`-based client with FHIR-specific concerns — cross-origin `Authorization` stripping on redirects (RFC 6750 §5.3), non-enumerable response metadata, and `OperationOutcome`-aware error construction. `paginate()` walks the `Bundle.link[rel="next"]` chain with cycle detection, and `unwrapBundle()` splits a `searchset` bundle into `{ data, included }`.

## Installation
```bash
npm install @fhir-dsl/runtime
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `FhirExecutor` | class | Wraps `fetch` with FHIR error parsing, auth-strip on cross-origin redirect, and non-enumerable metadata. |
| `ExecuteRequestOptions` | interface | `{ signal?: AbortSignal }` — forwarded to `fetch`. |
| `FhirClientConfig` | interface | Runtime-level client config (subset of the core config). |
| `paginate` | function | Async generator yielding pages of resources from a starting `Bundle`. |
| `fetchAllPages` | function | Drains `paginate()` into an array. |
| `unwrapBundle` | function | Splits a `searchset` Bundle into `{ data, included, total, hasNext, nextUrl, raw }`. |
| `SearchResult` | interface | Return shape of `unwrapBundle`. |
| `FhirError` | class | Error with `status`, `statusText`, `operationOutcome`, and `responseText` fallback. |
| `OperationOutcome` / `OperationOutcomeIssue` | interface | FHIR outcome shape re-exported for convenience. |

## API

### `FhirExecutor`
**Signature**
```ts
class FhirExecutor {
  constructor(config: FhirClientConfig);
  execute<T = unknown>(query: CompiledQuery, options?: ExecuteRequestOptions): Promise<T>;
  executeUrl<T = unknown>(url: string, options?: ExecuteRequestOptions): Promise<T>;
}
interface ExecuteRequestOptions {
  signal?: AbortSignal;
}
interface FhirClientConfig {
  baseUrl: string;
  auth?: AuthConfig;
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
  retry?: RetryConfig;
}
```
**Parameters**
- `config.baseUrl` — used as the origin for `execute()` and as the trust boundary for `executeUrl()` (auth is stripped for any URL whose origin differs).
- `config.auth` — static creds or a pluggable `AuthProvider`.
- `config.retry` — transient-failure retries (429/503) honouring `Retry-After`.

**Returns** — Parsed JSON body, with response headers attached as three non-enumerable properties (`headers`, `location`, `etag`) so `JSON.stringify(result)` stays clean.

**Example**
```ts
import { FhirExecutor } from "@fhir-dsl/runtime";

const exec = new FhirExecutor({ baseUrl: "https://fhir.example/r4" });
const bundle = await exec.execute({ method: "GET", path: "Patient", params: [] });
const next = await exec.executeUrl(bundle.link?.find((l) => l.relation === "next")?.url ?? "");
```

**Notes**
- **Cross-origin Authorization strip (RFC 6750 §5.3).** When `executeUrl()` is called with a URL whose origin differs from `baseUrl`, the auth provider **and** any pre-set `Authorization` header are dropped before the request. This prevents a server-controlled `next` link from exfiltrating bearer tokens to a third-party host.
- **Non-enumerable metadata.** Parsed resources get `Object.defineProperty(value, "headers", { enumerable: false, ... })`, with `Location`, `ETag`, and `Last-Modified` surfaced when present. `location` and `etag` are also attached directly as non-enumerable properties.
- **`Prefer: respond-async` + 202 polling.** The higher-level `FhirClient` in `@fhir-dsl/core` polls `Content-Location` on 202 responses; `FhirExecutor` itself does not poll — if you need async semantics, use the core client with `async: AsyncPollingConfig`.
- **Auto-POST upgrade.** `SearchQueryBuilder.usePost()` forces POST; the builder also auto-upgrades GET to POST when the URL exceeds the default `1900`-byte threshold (`DEFAULT_AUTO_POST_THRESHOLD`) — override per-builder via `.getUrlByteLimit(n)`.

---

### `paginate` / `fetchAllPages`
**Signature**
```ts
function paginate<T extends Resource>(
  executor: FhirExecutor,
  firstBundle: Bundle,
  options?: ExecuteRequestOptions,
): AsyncGenerator<T[], void, undefined>;

function fetchAllPages<T extends Resource>(
  executor: FhirExecutor,
  firstBundle: Bundle,
  options?: ExecuteRequestOptions,
): Promise<T[]>;
```
**Parameters**
- `executor` — the `FhirExecutor` to follow `next` links with.
- `firstBundle` — the initial `Bundle` (usually the result of an `execute()`).
- `options.signal` — abort signal propagated to every follow-up `fetch`.

**Returns** — `paginate` yields each page's resources as a `T[]`; `fetchAllPages` returns a single flat array.

**Example**
```ts
const first = await exec.execute<Bundle>({ method: "GET", path: "Patient", params: [{ name: "_count", value: 50 }] });
for await (const page of paginate<Patient>(exec, first)) {
  console.log(`got ${page.length} patients`);
}
```

**Notes** — Visited `next` URLs are tracked in a `Set`; if the server produces a cycle, the loop terminates instead of issuing unbounded requests. `paginate` also peeks one link ahead and aborts early if the fetched bundle's own `next` points back into the visited set.

---

### `unwrapBundle`
**Signature**
```ts
function unwrapBundle<Primary extends Resource, Included extends Resource = never>(
  bundle: Bundle,
): SearchResult<Primary, Included>;

interface SearchResult<Primary extends Resource, Included extends Resource = never> {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number;
  hasNext: boolean;
  nextUrl?: string;
  raw: Bundle;
}
```
**Parameters**
- `bundle` — a FHIR `Bundle` of type `searchset`. Entries with `search.mode === "include"` route to `included`.

**Example**
```ts
import { unwrapBundle } from "@fhir-dsl/runtime";
const { data, included, hasNext, nextUrl } = unwrapBundle<Patient, Organization>(bundle);
```

---

### `FhirError`, `OperationOutcome`, `OperationOutcomeIssue`
**Signature**
```ts
class FhirError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly operationOutcome?: OperationOutcome | null;
  readonly responseText?: string; // raw body when it wasn't JSON
  readonly issues: OperationOutcomeIssue[];
}
interface OperationOutcome { resourceType: "OperationOutcome"; issue: OperationOutcomeIssue[]; }
interface OperationOutcomeIssue {
  severity: "fatal" | "error" | "warning" | "information";
  code: string;
  details?: { text?: string };
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}
```
**Example**
```ts
try {
  await exec.execute({ method: "GET", path: "Patient/does-not-exist", params: [] });
} catch (err) {
  if (err instanceof FhirError) {
    console.error(err.status, err.issues[0]?.diagnostics, err.responseText);
  }
}
```

**Notes** — When the server returns a non-JSON body (HTML error page, `text/plain` from an auth proxy), `operationOutcome` stays `null` and `responseText` carries the raw text so diagnostics aren't lost.
