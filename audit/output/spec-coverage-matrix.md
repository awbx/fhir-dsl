# Spec Coverage Matrix

**Commit:** `4f91589` on `main`
**Sources:** `audit/spec/*.md` (rule counts), `audit/impl/*.md` (status per rule), `audit/debate/decisions.md` (verdicts)
**Convention:** Every percentage is computed as `IMPLEMENTED / TOTAL`. `PARTIAL`, `INCORRECT`, and `MISSING` are reported as separate counts and **do not count as implemented**. Tests column shows on-disk Vitest coverage for each category. A rule is "tested" if at least one `it(...)` in the suite names the rule ID.

**Test files on disk at time of audit:**
- `packages/fhirpath/test/spec-compliance.test.ts` (1065 lines — FP-* coverage)
- `packages/fhirpath/test/spec-gaps.test.ts` (77 lines — MISSING-feature pins)
- `packages/core/test/search-spec-compliance.test.ts` (558 lines — SRCH-* coverage)
- `packages/core/test/search-url-edge-cases.test.ts` (145 lines — escape family pins)
- `packages/runtime/test/` — **no spec-compliance tests yet** (task #9 pending)

---

## FHIRPath N1 — `@fhir-dsl/fhirpath`

**Source of truth:** `audit/spec/fhirpath-n1-rules.md`; impl status from `audit/impl/fhirpath-impl-map.md`.

| Feature area | Spec rules (total) | Implemented | Partial | Incorrect | Missing | Coverage % | Tested? | Impl citation |
|---|---:|---:|---:|---:|---:|---:|---|---|
| FHIRPath-nav (FP-NAV-*) | 5 | 3 | 1 | 1 | 0 | **60%** (3/5) | Yes | `nav.ts:4-12`, `operators.ts:98-103` |
| FHIRPath-idx (FP-IDX-*) | 2 | 1 | 0 | 0 | 1 | **50%** (1/2) | Yes (gap pin) | `builder.ts` Proxy, `nav.ts:5-11` |
| FHIRPath-filter (FP-SEL-*) | 4 | 2 | 2 | 0 | 0 | **50%** (2/4) | Yes | `builder.ts:96-170`, `filtering.ts:5-99` |
| FHIRPath-subset (FP-SUB-*) | 8 | 5 | 3 | 0 | 0 | **62%** (5/8) | Yes | `subsetting.ts:6-35` |
| FHIRPath-combine (FP-COM-*) | 4 | 3 | 1 | 0 | 0 | **75%** (3/4) | Yes | `combining.ts:8-21`, `existence.ts:55-71` |
| FHIRPath-exist (FP-EXI-*) | 10 | 6 | 2 | 2 | 0 | **60%** (6/10) | Yes | `existence.ts:28-81` |
| FHIRPath-bool (FP-LOG-*) | 5 | 5 | 0 | 0 | 0 | **100%** (5/5) | Yes | `operators.ts:24-63` |
| FHIRPath-eq (FP-EQ-*) | 5 | 1 | 0 | 2 | 2 | **20%** (1/5) | Yes (minimal) | `operators.ts:6-10,73-92` |
| FHIRPath-cmp (FP-CMP-*) | 3 | 0 | 1 | 2 | 0 | **0%** (0/3) | Yes (minimal) | `operators.ts:12-22,79-91` |
| FHIRPath-math (FP-MATH-*) | 7 | 0 | 0 | 0 | 7 | **0%** (0/7) | Yes (MISSING pin) | `ops.ts:75-85` (no binary ops) |
| FHIRPath-collection-ops (FP-COL-*) | 3 | 0 | 1 | 0 | 2 | **0%** (0/3) | Yes (MISSING pin) | `builder.ts:174-182` |
| FHIRPath-types (FP-TYP-*) | 4 | 0 | 3 | 1 | 0 | **0%** (0/4) | Yes | `operators.ts:65-126`, `filtering.ts:5-20` |
| FHIRPath-tree (FP-TREE-*) | 2 | 0 | 1 | 1 | 0 | **0%** (0/2) | Yes | `nav.ts:14-36` |
| FHIRPath-str (FP-STR-*) | 19 | 5 | 7 | 0 | 7 | **26%** (5/19) | Yes | `strings.ts:5-77` |
| FHIRPath-mathf (FP-MATHF-*) | 10 | 5 | 5 | 0 | 0 | **50%** (5/10) | Partial | `math.ts:5-36` |
| FHIRPath-conv (FP-CONV-*) | 17 | 0 | 6 | 11 | 0 | **0%** (0/17) | Partial | `conversion.ts:5-139`, `utility.ts:24-37` |
| FHIRPath-utility (FP-UTIL-*) | 2 | 0 | 2 | 0 | 0 | **0%** (0/2) | No | `utility.ts:6-22` |
| FHIRPath-agg (FP-AGG-*) | 5 | 0 | 0 | 0 | 5 | **0%** (0/5) | Yes (MISSING pin) | — |
| FHIRPath-env (FP-VAR-*) | 10 | 1 | 0 | 0 | 9 | **10%** (1/10) | Yes (MISSING pin) | `expression.ts:23-25` |
| FHIRPath-lit (FP-LIT-*) | 10 | 0 | 4 | 0 | 6 | **0%** (0/10) | No | `expression.ts:178-184` |
| FHIRPath-dt (FP-DT-*) | 4 | 0 | 0 | 0 | 4 | **0%** (0/4) | No | — |
| FHIRPath-fhir-ext (FP-FHIR-*) | 16 | 0 | 1 | 1 | 14 | **0%** (0/16) | Yes (MISSING pin) | — |
| FHIRPath-grammar (FP-GRAM-*) | 4 | 1 | 0 | 0 | 3 | **25%** (1/4) | No | `builder.ts` chain-only |
| **FHIRPath TOTAL** | **159** | **38** | **40** | **21** | **60** | **23.9%** (38/159) | Largely | — |

> **Disagrees with AUDIT.md:** README currently claims "~85% of the FHIRPath spec including 60+ functions" (`README.md:18`); AUDIT.md §1 counter-claims "~54% by function count" (`AUDIT.md:13,174`). This matrix computes **23.9%** by rule count — the divergence from both prior figures is because AUDIT counted *functions* as discrete units without splitting by category, while this matrix counts every atomic rule (including negative / edge-case rules). All three figures agree on direction (README is optimistic); they disagree on how to denominate the ratio. Recommend the docs adopt a categorical table (per row here) rather than a single blended percentage.

---

## FHIR R5 Search — `@fhir-dsl/core` search builder

**Source of truth:** `audit/spec/r5-search-rules.md`; impl status from `audit/impl/core-impl-map.md`.

| Feature area | Spec rules (total) | Implemented | Partial | Incorrect | Missing | Coverage % | Tested? | Impl citation |
|---|---:|---:|---:|---:|---:|---:|---|---|
| R5-search-types (SRCH-TYP-*) | 9 | 6 | 2 | 1 | 0 | **67%** (6/9) | Yes | `search-query-builder.ts:126-322` |
| R5-search-prefixes (SRCH-PFX-*) | 11 | 10 | 0 | 0 | 1 | **91%** (10/11) | Yes | `_internal/op-classifier.ts:2-25` |
| R5-search-modifiers (SRCH-MOD-*) | 16 | 12 | 2 | 1 | 1 | **75%** (12/16) | Yes | `op-classifier.ts:4-18`, `search-query-builder.ts:186-198,371-424` |
| R5-search-combine/escape (SRCH-COMB-*) | 5 | 3 | 0 | 1 | 1 | **60%** (3/5) | Yes (gap pins) | `search-query-builder.ts:146,304`, `condition-tree.ts:25-31` |
| R5-search-chain/has (SRCH-CHAIN-*, SRCH-HAS-*) | 5 | 3 | 0 | 1 | 1 | **60%** (3/5) | Yes | `search-query-builder.ts:371-456` |
| R5-search-composite (SRCH-COMP-*) | 3 | 0 | 1 | 1 | 1 | **0%** (0/3) | Yes | `search-query-builder.ts:300-322` |
| R5-search-result-params (SRCH-RES-*) | 8 | 7 | 0 | 0 | 0 | **88%** (7/8)¹ | Yes | `search-query-builder.ts:256-514,644-675` |
| R5-search-paging (SRCH-PAGE-*) | 3 | 3 | 0 | 0 | 0 | **100%** (3/3) | No | `search-query-builder.ts:729,769-774` |
| R5-search-include (SRCH-INC-*) | 5 | 3 | 0 | 0 | 2 | **60%** (3/5)² | Yes | `search-query-builder.ts:324-369` |
| R5-search-meta (SRCH-META-*) | 9 | 9 | 0 | 0 | 0 | **100%** (9/9) | Yes | `search-query-builder.ts:200-254,597-625` |
| R5-search-filter (SRCH-FILT-*) | 3 | 1 | 1 | 1 | 0 | **33%** (1/3) | Yes | `condition-tree.ts:41-99`, `search-query-builder.ts:542-544` |
| R5-search-query (SRCH-QRY-*) | 2 | 1 | 1 | 0 | 0 | **50%** (1/2) | Yes | `search-query-builder.ts:546-561` |
| R5-search-post (SRCH-POST-*) | 3 | 2 | 0 | 0 | 1 | **67%** (2/3) | Yes | `search-query-builder.ts:680-687`, `fhir-client.ts:38-43` |
| R5-search-url-structure (SRCH-URL-*) | 4 | 2 | 0 | 0 | 2 | **50%** (2/4) | Yes (partial) | `search-query-builder.ts:690-694`, `fhir-client.ts:38-43` |
| **R5-search TOTAL** | **86** | **62** | **7** | **5** | **12** | **72.1%** (62/86) | Largely | — |

¹ SRCH-RES-008 `_score` is response-side; excluded from denominator. Counted as 7/8 of the actionable rules. (Listed as 8 for transparency.)
² SRCH-INC-005 is server-side depth bounding; client has no knob. Counted conservatively as MISSING.

> **Disagrees with AUDIT.md:** AUDIT.md §2 / coverage summary states "R5 search ~80%". This matrix computes **72%**. Delta is driven by (a) the escape-family bugs that degraded SRCH-COMB, SRCH-COMP, and SRCH-CHAIN from "implemented" to "incorrect", (b) SRCH-FILT-001's `:not`→`ne` mismapping, and (c) missing `:type` modifier and system-level / history-level URL forms. AUDIT's 80% pre-dated the adversarial pass.

---

## FHIR R5 REST + Operations — `@fhir-dsl/core` + `@fhir-dsl/runtime`

**Source of truth:** `audit/spec/r5-rest-rules.md`; impl status from `audit/impl/runtime-impl-map.md`.

| Feature area | Spec rules (total) | Implemented | Partial | Incorrect | Missing | Coverage % | Tested? | Impl citation |
|---|---:|---:|---:|---:|---:|---:|---|---|
| R5-rest-read (REST-READ-*) | 4 | 1 | 2 | 0 | 1 | **25%** (1/4) | No | `read-query-builder.ts:42-48`, `fhir-client.ts:55-60` |
| R5-rest-vread (REST-VREAD-*) | 3 | 0 | 0 | 0 | 3 | **0%** (0/3) | No | — |
| R5-rest-update (REST-UPDATE-*) | 6 | 1 | 3 | 0 | 2 | **17%** (1/6) | No | `transaction-builder.ts:81-97` |
| R5-rest-conditional (REST-COND-UPDATE-*, REST-COND-PATCH-*, REST-COND-DELETE-*, REST-COND-CREATE-*) | 9 | 0 | 0 | 0 | 9 | **0%** (0/9) | No | — |
| R5-rest-patch (REST-PATCH-*) | 4 | 0 | 0 | 0 | 4 | **0%** (0/4) | No | `compiled-query.ts:1` (type only) |
| R5-rest-delete (REST-DELETE-*) | 4 | 0 | 2 | 1 | 1 | **0%** (0/4) | No | `transaction-builder.ts:99-109`, `fhir-client.ts:60` |
| R5-rest-create (REST-CREATE-*) | 3 | 0 | 2 | 1 | 0 | **0%** (0/3) | No | `transaction-builder.ts:68-79`, `fhir-client.ts:60` |
| R5-rest-history (REST-HIST-*) | 5 | 0 | 0 | 0 | 5 | **0%** (0/5) | No | — |
| R5-rest-capabilities (REST-CAP-*) | 4 | 0 | 0 | 0 | 4 | **0%** (0/4) | No | — |
| R5-bundles (REST-BUND-*) | 9 | 3 | 3 | 0 | 3 | **33%** (3/9) | No | `transaction-builder.ts:119-200` |
| R5-rest-headers (REST-HDR-*) | 10 | 0 | 0 | 0 | 10 | **0%** (0/10) | No | — |
| R5-rest-mime (REST-MIME-*) | 3 | 1 | 0 | 0 | 2 | **33%** (1/3) | No | `fhir-client.ts:39-40`, `executor.ts:25-26` |
| R5-rest-head/options (REST-HEAD-*, REST-SEARCH-*) | 3 | 1 | 1 | 0 | 1 | **33%** (1/3) | No | `search-query-builder.ts:680-687` |
| R5-rest-async (REST-ASYNC-*) | 6 | 0 | 0 | 0 | 6 | **0%** (0/6) | No | — |
| R5-rest-errors (REST-ERR-*) | 3 | 1 | 2 | 0 | 0 | **33%** (1/3) | No | `errors.ts:6-32`, `fhir-client.ts:56-57` |
| R5-rest-operations (OP-INV-*, OP-PARM-*) | 12 | 0 | 0 | 0 | 12 | **0%** (0/12) | No | — |
| R5-rest-operations-catalogue (OP-*-001 entries) | 23 | 0 | 0 | 0 | 23 | **0%** (0/23) | No | — |
| R5-rest-operations-details (OP-VAL-*, OP-EXP-*, OP-LOOK-*, OP-TRAN-*, OP-EV-*, OP-DOC-*, OP-PAGE-*) | 13 | 0 | 0 | 0 | 13 | **0%** (0/13) | No | — |
| **R5-rest TOTAL** | **124** | **8** | **15** | **2** | **99** | **6.5%** (8/124) | No | — |

> **Disagrees with AUDIT.md:** AUDIT.md coverage summary states "REST operations ~50%". This matrix computes **6.5%** because (a) AUDIT counted only read/create/update/delete as "the REST surface" and ignored the ~50 operation-catalogue rules (which are genuinely zero%), (b) AUDIT counted the transaction-builder as the "update/create/delete" path without flagging that these are transaction-scoped and there is no direct `client.update/create/delete` method. If OP-* rows are excluded (as AUDIT implicitly did), the runtime-only figure is **23/76 = 30%** (implemented+partial, transaction-qualified). Both figures fall below AUDIT's 50%.

---

## SMART App Launch v2 — `@fhir-dsl/smart`

No spec-reader rule file was produced for SMART in this audit (scope deferred). AUDIT.md §7 reports coverage at ~90% based on feature-presence (PKCE S256, v2 scope grammar, backend-services JWT with token caching, in-flight-refresh coalescing, `aud`/`state`/`launch` wiring). No debate-level disputes were raised against this section.

| Feature area | Status | Rule source |
|---|---|---|
| SMART-v2 | **Not re-audited this pass** — AUDIT.md §7 figure of ~90% stands. Only open gap noted: OIDC `nonce` threading and consumer-side JWKS / ID-token verification (both low severity, documented boundary). | `AUDIT.md:156-166` |

> **Disagrees with AUDIT.md:** Not applicable — this matrix defers to AUDIT.md on SMART because no atomic SMART rules were produced.

---

## Runtime-transport (cross-cutting, not a spec section)

These aren't rules from a published spec page but are the transport concerns enumerated in `audit/impl/runtime-impl-map.md` §"Runtime-level cross-cutting concerns" and AUDIT.md §3.

| Concern | Status | Impl citation |
|---|---|---|
| AbortSignal (in-flight fetch) | **PARTIAL** (between-pages only) | `http.ts:35`, `search-query-builder.ts:756` |
| Retry / 429 / 503 / Retry-After / backoff | **MISSING** | — |
| Pagination cycle detection | **MISSING** | `search-query-builder.ts:769-774`, `pagination.ts:18-22` |
| Prefer header (return=*, handling=*, respond-async) | **MISSING** | — |
| If-Match / If-None-Exist / If-None-Match / If-Modified-Since | **MISSING** | — |
| Response headers read-back (ETag / Location / Last-Modified) | **MISSING** | `executor.ts:46`, `fhir-client.ts:60` |
| 204 No Content on success | **INCORRECT** (unconditional `response.json()`) | `fhir-client.ts:60`, `executor.ts:46` |
| Non-JSON error body fallback | **INCORRECT** (silent discard to null) | `fhir-client.ts:56-57`, `executor.ts:42-43` |
| 401 `onUnauthorized` retry | **IMPLEMENTED** | `http.ts:42-47` |
| Form-urlencoded Content-Type on POST _search | **IMPLEMENTED** | `search-query-builder.ts:685`, `fhir-client.ts:42` |

**Runtime-transport rolled up:** 2 implemented / 8 incorrect-or-missing = **20%** functional coverage of the transport concerns that were enumerated.

> **Disagrees with AUDIT.md:** AUDIT.md §3 reports "Runtime ~60%" based on paging + typed errors + 401 retry being IMPLEMENTED. This matrix reports **20%** because it adds 204-bug, headers-dropped, non-JSON-error-swallowed, and pagination-cycle to the denominator, where AUDIT only tracked AbortSignal+retry as missing.

---

## Grand totals (rolled up)

| Section | Total rules | Implemented | % | Notes |
|---|---:|---:|---:|---|
| FHIRPath N1 | 159 | 38 | **23.9%** | Wide spread across categories; boolean logic 100%, arithmetic 0% |
| R5 Search | 86 | 62 | **72.1%** | Best-covered section; defects clustered in escape family + chain |
| R5 REST + Operations | 124 | 8 | **6.5%** | Dominated by zero-implemented operations framework (~48 rules) |
| Runtime transport | 10 | 2 | **20.0%** | Two bug-driven drops (204, non-JSON errors) |

**Weighted overall (by rule count):** 110 / 379 = **29.0%**. This number is presented for completeness but is not meaningful on its own — the *shape* of coverage (what's implemented vs. what's gapped) is far more useful than a single blended figure. Maintainers should consult the per-section rows above.

---

## Method notes (for reproducibility)

- **Denominator = atomic rule IDs in `audit/spec/*.md`.** Negative / edge-case rules (e.g. `SRCH-PFX-011` "prefix on non-ordered type") are counted because the DSL's response to them is observable — validating that a client rejects an ill-formed modifier is as testable as validating a happy path.
- **Numerator = rows labelled `IMPLEMENTED` in `audit/impl/*.md`.** `PARTIAL` rows are excluded from the numerator (they fail at least one edge the spec covers); they are reported separately so maintainers can decide whether to count them toward functional parity.
- **Verdicts reconciled via `audit/debate/decisions.md`.** Where a row was disputed and the debate upgraded/downgraded it (FP.10 to BUG, SRCH.8 to PARTIAL-BUG, SRCH.9 split, etc.), the ratified verdict governs this matrix.
- **AUDIT.md disagreements** are surfaced per section rather than silently papered over, per task #14 rules.
- **Test column** reflects only on-disk Vitest coverage at audit time, not future CI state. Per-rule test citations are in the Test-Suite Index (task #17 output).
