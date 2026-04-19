---
name: DSL-Explorer REST + Search Pre-Read (pre-spec-reader)
description: Static-read findings on core query-builder + transaction/batch + runtime, to be folded into rest-challenge.md once test-engineer suites land.
type: working-document
---

# DSL-Explorer REST + Search Pre-Read (pre-spec-reader)

Companion to `runtime-preanalysis.md`. Findings produced by static reading of:

- `packages/core/src/search-query-builder.ts` (778 lines, `SearchQueryBuilderImpl`)
- `packages/core/src/fhir-client.ts` (157 lines; `createFetchExecutor`, `createUrlExecutor`, `FhirClient`)
- `packages/core/src/transaction-builder.ts` (201 lines; `MutationBundleBuilderBase`, `Transaction/BatchBuilderImpl`)
- `packages/core/src/http.ts` (50 lines; `performRequest` + 401 retry path)
- `packages/runtime/src/executor.ts` (65 lines) + `pagination.ts` (34 lines)

Goal: formalize into `audit/challenge/rest-challenge.md` rows once test-engineer's REST/search suites exist.

---

## 1. search-query-builder.ts

### 1.1 Comma escaping in OR values — CONFIRMED BUG
`search-query-builder.ts:146` joins OR values with a literal comma and no escape:

```ts
const joined = (value as readonly (string | number)[]).map((v) => String(v)).join(",");
```

FHIR R5 §3.1.1 *"Advanced Search"*: literal commas inside a token/string value MUST be percent-escaped as `%2C` so the comma retains its OR semantics. A value `"acme, inc"` inside an OR list silently becomes two OR-terms `acme` and ` inc`.

**Severity:** High. Already flagged in AUDIT.md line 62. Test should lock down the fix contract (percent-encode literal `,` in OR values; leave separators as `,`).

### 1.2 Composite `$` separator — CONFIRMED BUG
`search-query-builder.ts:304`:

```ts
const compositeValue = Object.values(values as Record<string, string | number>).join("$");
```

Same bug class as 1.1: `$` is the composite-component separator per FHIR R5 §3.1.1.5.4. A component value containing literal `$` will corrupt the composite. No percent-escape path.

**Severity:** Medium-High. Not in AUDIT.md. Test: `whereComposite("code-value-quantity", { code: "price$usd", value: 5 })` → URL must show `price%24usd$5`, not `price$usd$5`.

### 1.3 Token URL encoding `|` — NEED TO VERIFY
`encodeParam` at `search-query-builder.ts:60-64` returns raw `{ name, value }`. The `|` separator inside token params (`system|code`) is legal literal in search values, but the *value portion on either side* of `|` must be percent-encoded if it contains a pipe. Current code does not touch this; it relies on `URLSearchParams.append()` (in `fhir-client.ts:35`) to percent-encode the whole value — which would over-encode the separator `|` itself.

**Conflict:** FHIR spec allows `|` raw in URL; `URLSearchParams.append()` encodes `|` as `%7C`. Need to confirm via test whether servers accept `%7C` as token separator. If not → bug: `|` must be preserved raw.

**Severity:** Medium. Not in AUDIT.md.

### 1.4 Sort multi-key formatting — LOOKS OK
`search-query-builder.ts:660-663`:

```ts
const sortValue = this.#state.sorts.map((s) => (s.direction === "desc" ? `-${s.param}` : s.param)).join(",");
params.push({ name: "_sort", value: sortValue });
```

Matches FHIR R5 §3.1.1.4.3 (`,`-joined, `-` prefix for desc). No obvious bug. Worth a test anyway to lock in.

### 1.5 POST auto-switch threshold — CHARS not BYTES (confirmed #3 from preliminary-hits)
`search-query-builder.ts:58, 677-678`:

```ts
const DEFAULT_AUTO_POST_THRESHOLD = 1900;
...
const wouldExceedThreshold = paramsToFormBody(params).length > threshold;
```

`.length` on a `string` = UTF-16 code units, not bytes. Spec constraint (conservative HTTP URL limits, typically 2048 octets) is byte-denominated. A query with multi-byte UTF-8 chars (Chinese, emoji) passes the `.length` check while exceeding 2048 bytes on the wire.

**Severity:** Medium. Also measures the form-body-style string (`URLSearchParams.toString()`) rather than the actual GET URL length. Discrepancy between "what we measure" and "what hits the wire" on GET path — the form body is *always* shorter than the URL-encoded GET query for non-ASCII.

### 1.6 POST `_search` Content-Type — CORRECT
`search-query-builder.ts:685`: `"Content-Type": "application/x-www-form-urlencoded"`. Matches FHIR R5 §3.1.1 *"POST search"*. This refutes the pre-read worry in `runtime-preanalysis.md` Q4 — the correct CT *is* sent. Runtime pre-read row #4 should be marked "verified OK".

### 1.7 `whereMissing` — LOOKS OK
`search-query-builder.ts:186-198`: emits `name:missing=true|false`. Matches FHIR §3.1.1.5.2. Boolean is String-cased correctly. No bug.

### 1.8 Chain encoding — LOOKS OK but NO ESCAPE on hop names
`whereChained` (line 371) builds `${refParam}:${targetResource}.${targetParam}`; `whereChain` (line 403) joins via `.`. If `targetParam` itself were `.`-containing it would corrupt the chain, but FHIR search param names are `[A-Za-z][A-Za-z0-9\-]*` per spec, so non-issue in practice.

### 1.9 `_revinclude` source prefix — LOOKS OK
`search-query-builder.ts:356`: `${sourceResource}:${param}`. Matches §3.1.2.

### 1.10 Modifier + OR interaction — LIKELY BUG
`where("code", "eq", ["a","b"])` (line 140) produces one CompiledSearchParam with no modifier. There is no way to say `code:not=a,b` via the fluent API — `whereIn` always drops modifiers. If the user wants `_tag:not=X,Y` they fall off the typed API. Not a bug against spec per se, but a coverage gap.

**Severity:** Low. Feature gap, not spec violation.

---

## 2. fhir-client.ts — `createFetchExecutor` / `createUrlExecutor`

### 2.1 `response.json()` on success — 204 No Content WILL THROW
`fhir-client.ts:60` and `:80` call `response.json()` unconditionally on `response.ok`. A DELETE returning 204 (standard per FHIR §3.2.0.5.4) has empty body; `.json()` rejects with `SyntaxError`. Cross-references runtime-preanalysis Q8 — bug is in *core* as well as runtime.

**Severity:** High. Already flagged in runtime-preanalysis.md for `runtime/executor.ts:46`. Confirming same bug at `core/fhir-client.ts:60` and `:80`.

### 2.2 `201 Created Location` header not surfaced
Executor returns parsed body only. The `Location` header on 201 (which contains the server-assigned id + version, per FHIR §3.2.0.5.1) is discarded. Caller can't read assigned id on create-without-id.

**Severity:** High. New finding.

### 2.3 No `ETag` extraction on reads
Read executor returns body only. `ETag` (= `W/"versionId"`, per §3.2.0.5.1) is gone. Consumer can't do optimistic concurrency.

**Severity:** High. Pairs with 3.1 below.

### 2.4 Error-body non-JSON swallow
`fhir-client.ts:56`: `await response.json().catch(() => null)`. If server returns `text/html` 500 page or `application/xml` OperationOutcome, `errorBody === null` and the message is lost to the user. Confirms runtime-preanalysis Q7.

**Severity:** Medium. No fallback to `.text()`.

### 2.5 No AbortSignal
No `signal` plumbed through `fetch`. Already flagged (Q1 runtime-preanalysis). Same deficiency in `core/http.ts` and `core/fhir-client.ts`.

### 2.6 `Prefer` header not exposed
Not plumbed. §3.2.0.1.11 (`return=minimal|representation|OperationOutcome`, `handling=strict|lenient`). Confirms runtime-preanalysis Q5.

**Severity:** Medium. API gap.

---

## 3. transaction-builder.ts

### 3.1 No `ifMatch` / `ifNoneMatch` / `ifNoneExist` / `ifModifiedSince` on entry.request
`TransactionEntry.request` (line 7-13) has only `{ method, url }`. FHIR R5 §3.2.5.1 ("Bundle.entry.request") lists required fields `ifNoneMatch`, `ifModifiedSince`, `ifMatch`, `ifNoneExist`. Builder has NO API surface for any of them.

**Consequences:**
- Cannot do conditional create (`ifNoneExist=identifier=...`)
- Cannot do conditional update / conditional version-aware update (`ifMatch=W/"1"`)
- Cannot do conditional delete (`ifMatch`)

**Severity:** High. Cross-reference AUDIT.md "no conditional operations" — confirms and expands it.

### 3.2 No `fullUrl` on entries
`compile()` (line 119-131) builds entries with `{ resource, request }` but no `fullUrl`. Per FHIR §3.2.5.1 transaction semantics, `fullUrl` is how the server wires intra-bundle references (e.g. using `urn:uuid:X` placeholders). Without `fullUrl`, POSTs that reference newly-created resources inside the same bundle cannot be wired. For `batch` it's less critical; for `transaction` it's a correctness hole.

**Severity:** High for transactions. Not in AUDIT.md.

### 3.3 Transaction vs batch semantics documentation
Builder distinguishes the two types at the wire level (line 15, 58). That's correct. But the API surface is identical — user has no signal that transaction = all-or-nothing while batch = independent entries. That's a docs issue, not a bug.

### 3.4 PUT update — id required but vread/history/versioned PUT absent
`updateEntry` (line 81) requires `resource.id`. No way to target a specific version — PUT always goes to `ResourceType/id`, never `ResourceType/id/_history/vid`. Missing version-aware update is tied to 3.1 (`ifMatch` absent).

### 3.5 PATCH absent
Builder offers create/update/delete. No `PATCH` method. FHIR R5 §3.2.0.5.2 supports PATCH with `application/json-patch+json` or `application/fhir+json` (merge patch). Cross-reference AUDIT.md "PATCH absent".

### 3.6 `search-type` + `GET` entries absent
Bundle entries of method GET (read-via-bundle, search-via-bundle) not supported. Useful for "fetch N things in one round-trip". Gap, not bug.

---

## 4. fhir-client.ts — `FhirClient` top-level surface

Beyond search/read/transaction/batch exposed at lines 110-149, there is no:

- `vread(type, id, version)` (§3.2.0.5.1.3)
- `history(type, id?)` / `historyType(type)` / `historySystem()` (§3.2.0.5.3)
- `patch(type, id, ops)` (§3.2.0.5.2)
- `capabilities()` / metadata discovery (§3.2.0.4)
- Operations invoker — `$validate`, `$everything`, `$expand`, custom ops (§3.2.0.6)
- Conditional read/update/delete at the single-resource level (§3.2.0.5.1 "conditional")

**Severity:** All High for REST completeness. These belong in DocsEngineer's Missing-Features list (task #15).

---

## 5. http.ts — `performRequest` + 401 retry

### 5.1 401 retry has no cap
`http.ts:44-47`: one refresh attempt. If the refreshed token *also* yields 401, the second response propagates as-is to the executor which raises `FhirRequestError`. So not truly "infinite recursion" — but `onUnauthorized()` has no way to see the second 401 and distinguish "token still stale" from "permissions actually denied". Runtime-preanalysis Q9 marked this "Low" — confirm.

### 5.2 No 429 / 503 / Retry-After handling
Already flagged (Q2 runtime-preanalysis). `http.ts:42-49` is the only retry surface. No Retry-After parsing, no backoff.

### 5.3 No request body for methods that FHIR doesn't send body on
`http.ts:38`: `...(req.body != null ? { body } : {})`. OK — does not force body on GET. Minor: some runtimes reject `fetch` with a body on GET/HEAD; existing gating is correct.

---

## 6. pagination.ts + runtime/executor.ts

### 6.1 No cycle detection (already flagged)
`pagination.ts:18-23` follows `Bundle.link[rel=next]` with no visited-set. A misbehaving server can loop forever. Cross-references runtime-preanalysis Q3.

### 6.2 No host validation on nextLink
`pagination.ts:20`: `executor.executeUrl(nextLink.url)`. Spec allows cross-host next-links, but the runtime uses the *same* auth headers (`executor` closes over `config.headers` and `auth`). Sending the `Authorization` header to an arbitrary different host is a credential-leak risk.

**Severity:** Medium security. Cross-reference preliminary-hits row #4. Suggested fix: default to same-origin; require explicit opt-in (`allowCrossHostPagination: true`) otherwise.

### 6.3 204 throws on executor path too
`runtime/executor.ts:46` same as fhir-client 2.1. Hit on DELETE or 304 responses.

---

## Summary of net-new findings vs AUDIT.md v0.19.0

| # | Finding | File:Line | Severity | AUDIT v0.19.0? |
|---|---|---|---|---|
| 1.1 | OR values: literal comma not escaped | search-query-builder.ts:146 | High | YES (line 62) |
| 1.2 | Composite `$` separator not escaped | search-query-builder.ts:304 | High | NO — NEW |
| 1.3 | Token `\|` over-encoded by URLSearchParams | fhir-client.ts:35 | Medium (verify) | NO — NEW |
| 1.5 | POST threshold uses UTF-16 `.length`, not bytes | search-query-builder.ts:678 | Medium | Partial |
| 2.1 | `response.json()` throws on 204 | fhir-client.ts:60,80 / runtime/executor.ts:46 | High | NO — NEW |
| 2.2 | 201 `Location` header not surfaced | fhir-client.ts:60 | High | NO — NEW |
| 2.3 | `ETag` not extracted on reads | fhir-client.ts:60 | High | NO — NEW |
| 2.4 | Non-JSON error body silently `null` | fhir-client.ts:56 | Medium | NO — NEW |
| 2.5 | No AbortSignal plumbed | http.ts:35 | High | YES |
| 2.6 | `Prefer` header not exposed | — | Medium | NO — NEW |
| 3.1 | No `ifMatch`/`ifNoneExist`/`ifNoneMatch` on bundle.request | transaction-builder.ts:7 | High | Partial |
| 3.2 | No `fullUrl` on transaction entries | transaction-builder.ts:119 | High | NO — NEW |
| 3.5 | PATCH absent | — | High | YES |
| 4.0 | No vread/history/capabilities/operations | fhir-client.ts | High | YES |
| 5.2 | No 429/503/Retry-After handling | http.ts | High | YES |
| 6.1 | Pagination cycle detection missing | pagination.ts:18 | Medium | NO — NEW |
| 6.2 | Auth headers sent to cross-host nextLink | pagination.ts:20 | Medium (sec) | NO — NEW |

**New-since-AUDIT count:** 10 items (1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.6, 3.2, 6.1, 6.2).

---

## Next steps

1. When `audit/spec/fhir-r5-rest-rules.md` + `fhir-r5-search-rules.md` land (tasks #2, #3), cite exact spec §-quotes for each row above.
2. When test-engineer's REST/search suites land (tasks #8, #9), each row should produce one failing test.
3. Fold into `audit/challenge/rest-challenge.md`; this doc stays as the working notebook.
4. Rows 2.1, 2.2, 2.3, 3.1, 3.2, 6.2 should feed DocsEngineer's Bug Report (task #16).
5. Row 1.6 (POST CT) should be explicitly marked *verified correct* in the impl-map — refutes the runtime-preanalysis Q4 worry.

**Status:** pre-read, to be folded.
