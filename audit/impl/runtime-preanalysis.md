# DSL-Explorer Runtime Pre-Analysis (pre-spec-reader)

Answers to the 9 challenge questions embedded in task #6, produced by static reading of `packages/runtime/` + REST-touching parts of `packages/core/`. Preserved here so findings persist independent of the final impl-map.

| # | Question | Finding | Severity | Already in AUDIT.md? |
|---|---|---|---|---|
| 1 | Can a request be aborted via AbortSignal? | No. `AbortSignal` is NOT threaded into `fetch`. Only `stream()` checks a signal *between* pages, never inside the in-flight request. | High | Yes (§3 runtime) |
| 2 | Does executor retry 429/503? Respect Retry-After? Exponential backoff on 5xx? | No retry logic of any kind. Only a single 401 hook via `provider.onUnauthorized()`. | High | Yes (§3 runtime) |
| 3 | Pagination: broken next URL or loop handling? | No cycle detection on `Bundle.link[rel=next]`. Infinite loop possible if server returns a page whose next points back. | Medium | No — NEW FINDING |
| 4 | POST _search content-type? | **VERIFIED CORRECT** — `search-query-builder.ts:685` sets `application/x-www-form-urlencoded` per spec. Earlier pre-read concern refuted by spec-challenger's REST pre-read. | None (positive) | — |
| 5 | Is `Prefer` header ever threaded? | No. `Prefer: return=minimal \| representation \| OperationOutcome` not exposed anywhere. | Medium | No — NEW FINDING |
| 6 | Is `If-Match` / `ETag` threaded on update? | No. Concurrent-update safety primitives absent. | High | Partial (AUDIT mentions "no conditional operations") |
| 7 | OperationOutcome extraction on non-JSON bodies? | Error body is silently lost if not JSON. No fallback to `.text()`. | Medium | No — NEW FINDING |
| 8 | 204 No Content on delete? 201 Created with Location? | **Bug:** `response.json()` is called unconditionally — 204 has no body and will throw. **Bug:** 201 `Location` header not surfaced to caller (can't read assigned ID). | High (both) | No — NEW BUG |
| 9 | 401 `onUnauthorized` retry contract? | Single-retry only. No cap on consecutive 401s (theoretically could recurse if `onUnauthorized` returns new tokens that still get 401). | Low | Partial |

**Net-new items for the final impl-map / bug report:**
- (#3) Pagination cycle detection missing
- (#5) `Prefer` header not plumbed
- (#7) Non-JSON error body swallowed
- (#8) 204 handling throws; 201 Location header not surfaced

These are NOT in AUDIT.md as of v0.19.0 and should be flagged as new findings in docs-engineer's Bug Report.

**Status:** pre-analysis. Will be folded into `audit/impl/runtime-impl-map.md` once `audit/spec/fhir-r5-rest-rules.md` lands (task #3 → task #6).
