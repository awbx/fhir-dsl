# Runtime + REST Execution → R5 REST Rules — Impl Map

**Source audit.** Commit `4f91589` on `main`. Spec rules: `audit/spec/r5-rest-rules.md`. Files read: `packages/runtime/src/{executor,pagination,result,errors,config,index}.ts`, `packages/core/src/{fhir-client,http,auth,read-query-builder,transaction-builder,search-query-builder,compiled-query}.ts`.

**Supersedes** `audit/impl/runtime-preanalysis.md` (kept for archival — see `Overturned pre-analysis rows` section at bottom).

**Legend.** IMPLEMENTED / PARTIAL / MISSING / INCORRECT.

**Architecture note.** The `packages/runtime` package is a thin wrapper exposing `FhirExecutor` (core-less) + `paginate` + `unwrapBundle` + `FhirError`. The canonical request pipeline actually in use by `FhirClient` (from `packages/core`) is `createFetchExecutor` → `performRequest` → `fetch`. Both pipelines share `http.ts:performRequest` and therefore share almost every REST-level deficiency. Where they differ, both are listed.

---

## 1. Read (REST-READ-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-READ-001 GET [base]/[type]/[id] | IMPLEMENTED | read-query-builder.ts:42-48 | Emits `GET <rt>/<id>` with no params. `Accept: application/fhir+json` set in executor. |
| REST-READ-002 200/404/410 handling | PARTIAL | fhir-client.ts:55-58, executor.ts:41-44 | All non-2xx raise `FhirRequestError`/`FhirError`; caller cannot distinguish 404 from 410 except via `.status`. No typed differentiation for Gone vs. Not Found. |
| REST-READ-003 HEAD support | MISSING | — | No `head()` API on `FhirClient`. |
| REST-READ-004 `_format` | PARTIAL | — | Not exposed as a DSL knob. Caller can pass via raw `search(...).$call(...)` construction but no typed helper. |
| `ETag` / `Last-Modified` read back | MISSING | executor.ts:46, fhir-client.ts:60 | `response.json()` returns JSON body only. Response headers are discarded; caller cannot read `ETag` for a subsequent `If-Match` update. **This is load-bearing** — version-aware updates impossible without it. |

## 2. VRead (REST-VREAD-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-VREAD-001 GET `.../_history/<vid>` | MISSING | — | No DSL API for versioned read. |
| REST-VREAD-002 status codes | N/A | — | Would be PARTIAL once implemented (same status-diff gap as REST-READ-002). |
| REST-VREAD-003 HEAD | MISSING | — | — |

## 3. Update (REST-UPDATE-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-UPDATE-001 PUT `/type/id` | PARTIAL | transaction-builder.ts:81-97 | Available **only** inside a transaction/batch. No direct `client.update(resource)` on `FhirClient`. |
| REST-UPDATE-002 server ignores submitted versionId | IMPLEMENTED (passthrough) | — | Not our concern client-side. |
| REST-UPDATE-003 200 vs 201 | PARTIAL | executor.ts:41-46, fhir-client.ts:55-60 | Caller can inspect response body but NOT the status code (discarded on success). Cannot distinguish create-via-PUT (201) from update (200). |
| REST-UPDATE-004 Location / ETag / Last-Modified read-back | MISSING | executor.ts:46 | Response headers not surfaced. |
| REST-UPDATE-005 error codes | PARTIAL | errors.ts:15-32 | `FhirError.status` exposes it, but no typed discriminated subclasses for 409/412/422. |
| REST-UPDATE-006 `If-Match` header | **MISSING** | transaction-builder.ts, fhir-client.ts, executor.ts | No API to thread `If-Match`. Concurrent-update safety unavailable. |

## 4. Conditional Update (REST-COND-UPDATE-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-COND-UPDATE-001 `PUT /type?search` | MISSING | transaction-builder.ts:81-97 | `updateEntry` hard-codes URL as `<rt>/<id>`. |
| REST-COND-UPDATE-002/003/004 | MISSING | — | No surface. |

## 5. Patch (REST-PATCH-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-PATCH-001 PATCH verb + content types | **MISSING** | compiled-query.ts:1 | `HttpMethod` type includes `"PATCH"`, but no builder emits it. No JSON-Patch / XML-Patch / FHIRPath-Patch API. |
| REST-PATCH-002..004 | MISSING | — | — |
| REST-COND-PATCH-001 | MISSING | — | — |

## 6. Delete (REST-DELETE-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-DELETE-001 DELETE `/type/id` | PARTIAL | transaction-builder.ts:99-109 | Only inside transaction/batch. No direct `client.delete()` on `FhirClient`. |
| REST-DELETE-002 410 vs 404 | PARTIAL | errors.ts | `.status` available, no typed differentiation. |
| REST-DELETE-003 204 / 200 / 202 response handling | **INCORRECT** | fhir-client.ts:60, executor.ts:46 | Both executors call `response.json()` **unconditionally** on success. For a 204 No Content response (allowed per spec), the body is empty and `.json()` throws `SyntaxError: Unexpected end of JSON input`. **Bug** — any DELETE that returns 204 will reject with a confusing parse error. |
| REST-DELETE-004 405/409 | PARTIAL | errors.ts | Status-only surfacing. |
| REST-COND-DELETE-001 `DELETE /type?search` | MISSING | transaction-builder.ts:99-109 | Hard-coded URL. |

## 7. Create (REST-CREATE-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-CREATE-001 POST `/type` | PARTIAL | transaction-builder.ts:68-79 | Only inside transaction/batch. No direct `client.create()` on `FhirClient`. |
| REST-CREATE-002 `Location` / ETag / Last-Modified read-back | **INCORRECT** | fhir-client.ts:60, executor.ts:46 | Response headers discarded. Caller **cannot retrieve the assigned `id`** when the server honors `Prefer: return=minimal` and returns an empty body with `Location: /Patient/abc/_history/1`. The id is thrown away. |
| REST-CREATE-003 error codes | PARTIAL | errors.ts | Status-only. |
| REST-COND-CREATE-001 `If-None-Exist` header | **MISSING** | transaction-builder.ts:68-79 | No way to thread the header. Bundle-level conditional create inside a transaction is also missing (see REST-BUND-006). |

## 8. History (REST-HIST-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-HIST-001 three URL forms | MISSING | — | No `history()` API. |
| REST-HIST-002 `Bundle.type=history` | N/A | — | — |
| REST-HIST-003..005 | MISSING | — | — |

## 9. Capabilities (REST-CAP-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-CAP-001 `GET /metadata` | MISSING | fhir-client.ts:99-150 | No `capabilities()` API. |
| REST-CAP-002..004 | MISSING | — | — |

## 10. Batch & Transaction (REST-BUND-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-BUND-001 `POST [base]` + Bundle body | IMPLEMENTED | transaction-builder.ts:119-141 | `execute()` posts Bundle to empty path. |
| REST-BUND-002 batch semantics | PARTIAL | transaction-builder.ts:174-200 | Bundle built with `type: "batch"`. No per-entry response inspection helper — caller must unwrap `Bundle.entry[i].response` manually. |
| REST-BUND-003 transaction atomicity | IMPLEMENTED (passthrough) | transaction-builder.ts:146-172 | Client doesn't need to enforce; server does. |
| REST-BUND-004 `fullUrl` cross-entry refs | **MISSING** | transaction-builder.ts:119-131 | `compile()` emits entries WITHOUT `fullUrl`. Client cannot express `urn:uuid:...` placeholders → references between newly-created resources in the same transaction are impossible. |
| REST-BUND-005 conditional references | MISSING | — | No support for `reference: "Patient?identifier=..."` as a dependency-free reference (the raw field is writable by the caller, but the DSL offers no helper). |
| REST-BUND-006 `entry.request.ifNoneExist` | MISSING | transaction-builder.ts:68-79 | `createEntry` does not plumb the field. |
| REST-BUND-007 per-entry response fields | PARTIAL | transaction-builder.ts:133-141 | Returns the response `Bundle` verbatim; caller reads `.entry[i].response.status/location/etag` themselves. No typed helper. |
| REST-BUND-008 response `Bundle.type=...-response` | N/A | — | Decode path doesn't check. |
| REST-BUND-009 suggested processing order | N/A (server-side) | — | OPEN-QUESTION per spec; not a client concern. |

## 11. Prefer, ETag, Headers (REST-HDR-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-HDR-001 `Prefer: return=minimal` | MISSING | fhir-client.ts:38-43, executor.ts:24-29 | Not plumbed. Caller can set via `config.headers` but no typed DSL API. |
| REST-HDR-002 `Prefer: return=representation` | MISSING | — | Same. |
| REST-HDR-003 `Prefer: return=OperationOutcome` | MISSING | — | Same. |
| REST-HDR-004 server SHOULD honor | N/A (server-side) | — | — |
| REST-HDR-005 `Prefer: handling=strict\|lenient` | **MISSING** | — | No typed plumbing. |
| REST-HDR-006 `Prefer: respond-async` | MISSING | — | Same. No async polling loop either — see §14 below. |
| REST-HDR-007 `ETag: W/"<vid>"` | MISSING (read-back) | fhir-client.ts:60, executor.ts:46 | Response headers discarded; caller cannot read ETag. |
| REST-HDR-008 `Location` read-back | MISSING | — | Same. See REST-CREATE-002. |
| REST-HDR-009 `Last-Modified` read-back | MISSING | — | Same. |
| REST-HDR-010 `Content-Location` (async) | MISSING | — | Async entirely unimplemented. |

## 12. MIME types (REST-MIME-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-MIME-001 `application/fhir+json` default | IMPLEMENTED | fhir-client.ts:39-40, executor.ts:25-26 | Both `Accept` and `Content-Type` default to `application/fhir+json`. |
| REST-MIME-002 `_format` override | MISSING | — | Not plumbed. |
| REST-MIME-003 PATCH content types | MISSING | — | PATCH entirely unimplemented. |

## 13. HEAD, OPTIONS, Search (REST-HEAD-*, REST-SEARCH-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-HEAD-001 HEAD support | MISSING | compiled-query.ts:1 | `HttpMethod` type has no `"HEAD"`. |
| REST-SEARCH-001 POST _search + form body | IMPLEMENTED | search-query-builder.ts:680-687, fhir-client.ts:38-43 | `Content-Type: application/x-www-form-urlencoded` correctly set via per-query header spread (conceded to spec-challenger; see core-impl-map SRCH-POST-001). |
| REST-SEARCH-002 Bundle.type=searchset | PARTIAL | search-query-builder.ts:697-740 | Decode path doesn't verify type; accepts any Bundle. |

## 14. Async pattern (REST-ASYNC-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-ASYNC-001..006 | **MISSING (entire section)** | — | No `Prefer: respond-async` surfacing, no 202 + `Content-Location` handling, no polling loop, no cancellation, no `Retry-After` / `X-Progress` parsing. Bulk data unavailable. |

## 15. Error handling (REST-ERR-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| REST-ERR-001 OperationOutcome on error | PARTIAL | fhir-client.ts:56-57, executor.ts:42-43, errors.ts:15-32 | Both executors attempt `response.json()` with `.catch(() => null)`. **Gap:** if the error body is non-JSON (plain text from a proxy, HTML 502 page from a gateway), it is silently discarded. Spec says OperationOutcome *SHOULD* be returned; reality is that proxies/gateways often inject non-FHIR bodies. Client has no fallback to `.text()`, so diagnostic information is lost. |
| REST-ERR-002 `OperationOutcome.issue` shape | IMPLEMENTED | errors.ts:6-13, 22-23 | `FhirError` exposes `issues` getter and derives a message from `issue[0].diagnostics \|\| details.text`. |
| REST-ERR-003 415 Unsupported Media Type | PARTIAL | errors.ts | Status-only; no typed subclass. |

## 16-22. Operations framework (OP-*)

**All MISSING** — `FhirClient` exposes no operation-invocation API.

| Rule | Status | File:line | Note |
|---|---|---|---|
| OP-INV-001..005 URL forms, GET-vs-POST | MISSING | fhir-client.ts:99-150 | No `.operation(name, scope, params?)` method. |
| OP-PARM-001..007 Parameters resource shape | MISSING | — | No helper to build/parse a Parameters resource; callers would hand-roll as plain JS objects. |
| OP-PAGE-001/002 paging over operation responses | MISSING | pagination.ts | `paginate()` could be re-used IF a caller got a Bundle out of an operation manually, but there's no integrated flow. |
| OP-VAL-001..005 `$validate` | MISSING | — | The DSL has a `validate()` chain on search/read, but that is Ajv-based **client-side** schema validation via `validation.ts`, not the server-side `$validate` operation. These should not be conflated. |
| OP-EV-001/002 `$everything` | MISSING | — | — |
| OP-EXP-001..004 `$expand` | MISSING | — | — |
| OP-LOOK-001/002, OP-TRAN-001/002, OP-META-*, OP-GQL-001, OP-GRAPH-001, OP-VC-001, OP-SUB-001, OP-FIND-001, OP-CLOS-001, OP-APPLY-001, OP-TRANS-001, OP-MATCH-001, OP-MERGE-001, OP-SUBMIT-001, OP-DOC-001/002 | MISSING | — | No catalogue support. |

## 23. Interaction matrix — what the client CAN do

| HTTP | URL shape | Interaction | Supported? | Via |
|------|-----------|-------------|------------|-----|
| GET | `/metadata` | capabilities | **No** | — |
| GET | `/<type>/<id>` | read | Yes | `client.read(rt, id)` |
| GET | `/<type>/<id>/_history/<vid>` | vread | **No** | — |
| PUT | `/<type>/<id>` | update | Partial (transaction-only) | `txn.update(res)` |
| PUT | `/<type>?params` | conditional update | **No** | — |
| PATCH | `/<type>/<id>` | patch | **No** | — |
| PATCH | `/<type>?params` | conditional patch | **No** | — |
| DELETE | `/<type>/<id>` | delete | Partial (transaction-only) | `txn.delete(rt, id)` |
| DELETE | `/<type>?params` | conditional delete | **No** | — |
| POST | `/<type>` | create | Partial (transaction-only) | `txn.create(res)` |
| GET | `/<type>/<id>/_history` | instance history | **No** | — |
| GET | `/<type>/_history` | type history | **No** | — |
| GET | `/_history` | system history | **No** | — |
| GET | `/<type>?params` | search | Yes | `client.search(rt).execute()` |
| POST | `/<type>/_search` | search (POST) | Yes (auto-POST >1900 chars or `.usePost()`) | — |
| POST | `[base]` | batch/transaction | Yes | `client.transaction() / .batch()` |
| GET/POST | `/$op` / `/<type>/$op` / `/<type>/<id>/$op` | operation | **No** | — |
| HEAD | any | header-only probe | **No** | — |

---

## Runtime-level cross-cutting concerns (the 9 task probes)

These are the questions from task #6's description, answered against current source.

1. **AbortSignal.**
   - Search `.stream()` checks a signal BETWEEN pages only (search-query-builder.ts:756 `options?.signal?.throwIfAborted()`). The in-flight `fetch()` is NOT aborted.
   - No `signal` parameter flows into `http.ts:performRequest` (line 35 `fetchFn(req.url, { method, headers, ...body })` — no signal).
   - Verdict: **PARTIAL** — stream can cooperatively stop between pages; an in-flight request cannot be cancelled. File fix: thread `signal` through `FhirRequest` → `performRequest` → `fetchFn(url, { ..., signal })`.

2. **Retry 429/503 / Retry-After / exponential backoff.**
   - `http.ts:42-47` has one retry hook: 401 → `provider.onUnauthorized()` → single retry. That's it.
   - No 429 handling, no 5xx retry, no `Retry-After` parse, no exponential backoff, no jitter, no circuit breaker.
   - Verdict: **MISSING** entirely.

3. **Pagination cycle detection.**
   - `search-query-builder.ts:769-774` (`stream()`) and `runtime/src/pagination.ts:18-22` both follow `bundle.link.find(l => l.relation === "next")` with no `seen` set, no depth cap, no `nextLink.url === previous URL` check.
   - Verdict: **MISSING** cycle detection. A server returning `next.url === self.url` causes an infinite loop. **Hit already raised in my runtime-preanalysis.md row #3 and confirmed via spec-challenger.**

4. **POST _search content-type.**
   - `application/x-www-form-urlencoded` is correctly set at search-query-builder.ts:685 and wins over the default `application/fhir+json` via spread order in fhir-client.ts:42 and executor.ts:28.
   - Verdict: **IMPLEMENTED.** (My initial pre-analysis was wrong; I conceded to spec-challenger. See "Overturned pre-analysis rows" below.)

5. **Prefer header threaded?**
   - No. Neither executor has a typed API for `Prefer:`. Caller can inject via `config.headers` as a blanket setting, but there is no per-request API.
   - Verdict: **MISSING.**

6. **If-Match / ETag on update.**
   - No `If-Match` header plumbing. Even if a caller extracts an ETag from a response, there's no read-back path (see REST-HDR-007 above — response headers discarded).
   - Verdict: **MISSING.** Concurrent-update safety unavailable.

7. **OperationOutcome extraction on non-JSON error bodies.**
   - `fhir-client.ts:56`: `const errorBody = await response.json().catch(() => null);`
   - `executor.ts:42`: same pattern.
   - If the server / proxy / gateway returns a non-JSON body (HTML 502, plain-text 503, proxy error page), `json()` throws and the catch silently discards to `null`. `FhirError.operationOutcome` becomes `null`, caller loses all diagnostic context except HTTP status+statusText.
   - Verdict: **INCORRECT** / PARTIAL. Spec does not REQUIRE non-JSON fallback, but real-world robustness does. Fix: `try { .json() } catch { .text() }` and attach the text to `FhirError` as a fallback.

8. **204 No Content on delete / 201 Created with Location.**
   - **204 bug.** `fhir-client.ts:60` / `executor.ts:46` call `response.json()` **unconditionally** on success. A 204 response has an empty body → `.json()` throws `SyntaxError`. Any DELETE that returns 204 will reject the promise.
   - **201 Location bug.** `Location` header is never read. When `Prefer: return=minimal` is honored (body omitted), the caller can neither retrieve the newly-assigned id nor confirm the request was create-via-PUT vs. update.
   - Verdict: **INCORRECT** for both. Fix: check `response.status === 204 \|\| content-length === 0` before calling `.json()`; expose response headers via a wider return type.

9. **401 `onUnauthorized` retry contract.**
   - `http.ts:42-47`: single-retry only. Not recursive; no cap needed because flow is serial. If the refreshed auth header ALSO yields 401, that 401 propagates as `FhirError`.
   - No retry counter, no cap for tandem 401s. Slight concern: if `onUnauthorized()` throws, the original 401 response is never returned to caller (the error surfaces instead) — currently acceptable.
   - Verdict: **IMPLEMENTED** with the single-retry contract. No changes needed unless multi-step auth flows (device code grant, MFA) are required.

---

## Net-new findings / upgrades to AUDIT.md v0.19.0

Items **not** already in AUDIT.md:

1. **204 No Content on delete throws** (REST-DELETE-003) — confirmed bug at fhir-client.ts:60 / executor.ts:46.
2. **201 Location header discarded** (REST-CREATE-002) — confirmed bug; caller cannot retrieve assigned id when `return=minimal`.
3. **Response headers never surfaced** (REST-HDR-007/008/009) — ETag, Location, Last-Modified all dropped.
4. **`If-Match` never threaded** (REST-UPDATE-006) — concurrent-update safety unavailable.
5. **`Prefer:` header absent from typed API** (REST-HDR-001..006) — `return=minimal/representation/OperationOutcome` and `handling=strict/lenient` and `respond-async` all missing.
6. **Retry logic entirely absent** — no 429/503 retry, no `Retry-After`, no backoff.
7. **Pagination cycle detection missing** (paginate / stream) — infinite-loop vector.
8. **AbortSignal not threaded into fetch** — in-flight requests uncancellable.
9. **Non-JSON error bodies silently discarded** (REST-ERR-001).
10. **`fullUrl` missing from transaction entries** (REST-BUND-004) — cross-entry references via `urn:uuid:` impossible.
11. **No direct `client.create/update/delete/patch`** — all mutations require a transaction/batch wrapper.
12. **No `$operation` invocation API** (OP-INV-*) — entire operations framework absent.
13. **No `capabilities()`** — clients cannot introspect server support before attempting features.
14. **No `history()` / `vread()` / `HEAD`** — interaction matrix has large voids.
15. **PATCH verb fully absent** — despite `HttpMethod` type including `"PATCH"`.
16. **Async pattern not supported** — no `Prefer: respond-async` / 202 / `Content-Location` polling.

## Overturned pre-analysis rows (from `runtime-preanalysis.md`)

- **Row #4 (POST _search content-type)**: previously hedged as "High if confirmed". Now **CONFIRMED IMPLEMENTED** — per-query `application/x-www-form-urlencoded` header wins via spread order. Scrubbed from the findings list. Credit: spec-challenger's pushback.

## Unchanged from pre-analysis

- Row #1 AbortSignal gap — still PARTIAL.
- Row #2 retry/backoff missing — still MISSING.
- Row #3 pagination cycle detection — still MISSING.
- Rows #5-8 all still valid (Prefer, If-Match, non-JSON error body, 204/201) as detailed above.
- Row #9 401 retry contract — still IMPLEMENTED with single-retry.

---

## Status

Task #6 complete. Feeds test task #9 (REST + runtime compliance tests) and doc task #16 (Bug Report with reproductions).
