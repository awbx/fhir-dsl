# Missing Features — Prioritized

**Scope:** Every row in `audit/debate/decisions.md` with verdict `SPEC-GAP-BY-DESIGN` (plus the strict-mode evaluator flag remediation that falls out of FP.1a, and the REST.15 docs-disambiguation callout).

**Ranking rule:** impact / cost. Priority 1 is what the team-lead nominated in the handoff: **AbortSignal (REST.5) + retry/backoff (REST.6) + FHIRPath arithmetic (FP.12 subset) + strict-mode evaluator flag (FP.1a remediation) + operations framework (REST.15)**. Below that, rank falls to user-impact class × cost.

**Columns:**
- **Impact class**: `blocks-workflow` (user can't ship a real app without it), `dx-annoyance` (user works around but quality-of-life suffers), `correctness-only` (edge-case wrong behavior, not reachable in common flows).
- **Cost**: S ≤ 1 day, M ≤ 1 week, L ≥ 1 week.
- **Precedence**: IDs this item should land after.
- **Acceptance test**: Vitest file + describe/it prefix. Pending means test-engineer #8/#9 still needed.

**Disagreements with AUDIT.md Priority Ordering (AUDIT.md:184-195):** AUDIT ranks: (1) AbortSignal + retry, (2) comma-escape fix, (3) arithmetic + `&`, (4) env vars, (5) slicing, (6) PATCH + conditionals, (7) `extension()` + `resolve()`. **The team's ranking (below) agrees on Priority 1 but diverges after** — specifically, comma-escape is a **bug** (BUG-003) not a missing feature, so it's tracked in the Bug Report, not here. Slicing (GEN.1) was out of debate scope. The strict-mode flag (new, from FP.1a) and operations framework (REST.15) are added above `extension()`/`resolve()` because they unblock larger surface area.

---

## Priority 1 — team-lead nominated

| Rank | Feature | Decision row | Impact | Cost | Precedence | Acceptance test | Sketch |
|---:|---|---|---|---|---|---|---|
| 1 | **AbortSignal threaded through `fetch()`** | REST.5 | blocks-workflow | S | — | `packages/runtime/test/runtime-spec-compliance.test.ts` — `it("REST-transport: AbortSignal cancels in-flight fetch")` (**pending, task #9**) | `http.ts:35` `fetchFn(req.url, {method,headers,signal,...body})`. Add `signal` to `FhirRequest`, thread through `performRequest`, search `.stream({signal})`, and `.execute({signal})` on every builder. |
| 2 | **Retry policy (429/503 + Retry-After + capped exp-backoff)** | REST.6 | blocks-workflow | M | 1 | `packages/runtime/test/runtime-spec-compliance.test.ts` — `it("REST-transport: retries 429 honoring Retry-After")` (**pending, task #9**) | New `retry.ts` in `packages/runtime/src`. Plug into `http.ts:performRequest` after the auth-retry hook. Respect `Retry-After` (delta-seconds + HTTP-date); jitter on 5xx. Cap at 3 attempts by default. |
| 3 | **FHIRPath arithmetic: `+`, `-`, `*`, `/`, `div`, `mod`, `&`** | FP.12 (subset) | blocks-workflow | M | — | `packages/fhirpath/test/spec-compliance.test.ts` — `describe("Math operators (FP-MATH-*)")` (**currently all MISSING pins**, task #7 done) | Add `MathOp` union entries in `ops.ts:75-85`; eval functions in `eval/math.ts` mirror the existing `abs`/`ceiling` pattern. Surface on predicate proxy in `expression.ts` (`.add/.sub/.mul/.div/.divTrunc/.mod/.concat`). Division-by-zero returns `[]` per §6.6. |
| 4 | **Strict-mode evaluator flag (`evaluate(expr, { strict: true })`)** | FP.1a (remediation) | dx-annoyance | S | — | `packages/fhirpath/test/spec-compliance.test.ts` — `it("FP-NAV-005: singleton-eval raises in strict mode")` (**pending test-engineer follow-up**) | `evaluator.ts:18` add second param `{ strict?: boolean }`. Thread `strict` into `toSingletonBoolean(collection, mode)` in `operators.ts:98-103`; in `"strict"` mode throw `FhirPathEvaluationError` on multi-element singletons. Matches HAPI/fhirpath.js/Firely lenient default (debate ruling). |
| 5 | **Operations framework (`$validate`, `$everything`, `$expand`, `$lookup`, `$translate`, …)** | REST.15 | blocks-workflow | L | 1, 2 | `packages/runtime/test/runtime-spec-compliance.test.ts` — `describe("Operations (OP-INV-*)")` (**pending, task #9**) | New `operation-builder.ts` in `packages/core/src`. `client.$validate(resource, {mode, profile})`, `client.$everything(id, {…})`, generic `client.operation(name, {scope, params})`. GET route when `affectsState=false` + all params primitive; otherwise POST with `Parameters` body. See OP-INV-001..005, OP-PARM-001..007. **Does not rename `.validate()`** — see item 6 for the docs callout. |
| 5a | **REST.15 docs-only disambiguation** (separate item) | REST.15 | dx-annoyance | S (docs-only) | — | No test — docs change only | Add callout to `apps/docs/docs/guides/validation.md`: "`.validate()` runs client-side Ajv schema validation; for server-side FHIR `$validate`, use `client.$validate(...)` (pending)." Mirror in README. See task #18. |

---

## Priority 2 — strong user impact, moderate cost

| Rank | Feature | Decision row | Impact | Cost | Precedence | Acceptance test | Sketch |
|---:|---|---|---|---|---|---|---|
| 6 | **`If-Match` / `If-None-Exist` / `If-None-Match` / `If-Modified-Since` headers** | REST.10 | blocks-workflow | M | 2 (response-header read-back needed) | `packages/runtime/test/runtime-spec-compliance.test.ts` — `describe("Conditional headers")` (**pending, task #9**) | Wider `FhirRequest` type with typed header fields. Thread through `executor.ts` + `http.ts`. Pair with response-header read-back (BUG-RUNTIME-002/005) so caller can get an ETag to send back. |
| 7 | **Direct `client.create/update/delete/patch` methods** | REST.13 | blocks-workflow | M | 6, 8 | `packages/runtime/test/runtime-spec-compliance.test.ts` — `describe("FhirClient direct mutations")` (**pending, task #9**) | Add to `fhir-client.ts`. Reuse `transaction-builder.ts` entry construction for shape consistency. Expose `.execute()` semantics. Significant DX gap — today every mutation requires a transaction/batch wrapper. |
| 8 | **PATCH verb (JSON Patch / FHIRPath Patch)** | REST.12 | blocks-workflow | M | 7 | `packages/runtime/test/runtime-spec-compliance.test.ts` — `it("REST-PATCH-001: patch with application/json-patch+json")` (**pending, task #9**) | `client.patch(rt, id, patchBody, {contentType, ifMatch?})`. Three content types per REST-PATCH-001. Transaction entry form already has the type union; no existing emitter. |
| 9 | **`Prefer` header plumbing (`return=minimal/representation/OperationOutcome`, `handling=strict/lenient`, `respond-async`)** | REST.9 | dx-annoyance | S | 1 | `packages/runtime/test/runtime-spec-compliance.test.ts` — `describe("REST-HDR-001..006: Prefer header")` (**pending, task #9**) | Typed options bag on each builder's `.execute()`; merged into headers before dispatch. |
| 10 | **FHIRPath env variables (`%context`, `%resource`, `%rootResource`, `%ucum`, `%vs-*`, `%ext-*`) + `$index` / `$total`** | FP.12 (subset) | blocks-workflow (for running real profile constraints) | M | 4 | `packages/fhirpath/test/spec-compliance.test.ts` — `describe("Environment variables (FP-VAR-*)")` (**currently all MISSING pins**) | Extend `evaluate(expr, resource, env?)` signature at `evaluator.ts:18`. `env` is a bag keyed by variable name; undefined `%foo` MUST signal an error per FP-VAR-010. `$index` wired through `filtering.ts:35` per-item. |
| 11 | **FHIRPath `extension(url)`, `resolve()`, `hasValue()`, `getValue()`, `htmlChecks()`** | FP.12 (subset, from AUDIT §1) | dx-annoyance | M | 10 | `packages/fhirpath/test/spec-compliance.test.ts` — `describe("FHIR-specific additions (FP-FHIR-*)")` (**currently all MISSING pins**) | Requires env variables (item 10) for `resolve()` to find the containing bundle via `%rootResource`. `extension(url)` is sugar for `.extension.where(url = url)` — implementable now but valuable mostly after env vars. |

---

## Priority 3 — narrower impact or low cost / quality-of-life

| Rank | Feature | Decision row | Impact | Cost | Precedence | Acceptance test | Sketch |
|---:|---|---|---|---|---|---|---|
| 12 | **Unicode NFC normalization helper at string-op boundaries** | FP.10 (remediation; bug itself is in Bug Report) | correctness-only | S | — | `packages/fhirpath/test/spec-compliance.test.ts` — `it("FP-STR-006: NFD input normalizes to NFC before comparison")` (**pending test-engineer follow-up**) | Call `.normalize("NFC")` on string inputs to `=`, `contains`, `startsWith`, `endsWith`, `indexOf`, `replace`, `matches` before comparison. Matches §2.1.20 MUST-language. |
| 13 | **`history()` — instance/type/system** | REST.14 | dx-annoyance | M | — | `packages/runtime/test/runtime-spec-compliance.test.ts` — `describe("REST-HIST-*: history")` (**pending, task #9**) | `client.history()` / `client.history(rt)` / `client.history(rt, id)` with `_since`, `_at`, `_count`, `_list`, `_sort`. |
| 14 | **`vread()` (versioned read)** | REST.14 | dx-annoyance | S | 13 | `it("REST-VREAD-001")` (**pending**) | `client.vread(rt, id, vid)`; emits `/type/id/_history/vid`. |
| 15 | **`capabilities()` / `GET /metadata`** | REST.14 | dx-annoyance | S | — | `it("REST-CAP-001")` (**pending**) | Returns typed CapabilityStatement. Pairs with item 9 (`Prefer: handling=lenient` needs cap-statement feature detection to fall back cleanly). |
| 16 | **Async pattern (`Prefer: respond-async` + 202 + `Content-Location` polling)** | REST.16 | blocks-workflow (bulk data users) | L | 1, 2 | `describe("REST-ASYNC-*")` (**pending**) | Only applies to bulk data and long-running ops. Gate on actual user demand; ship after retry/cancel framework is solid. |
| 17 | **`:type` modifier on reference params** | SRCH.6 | dx-annoyance | S | — | `packages/core/test/search-spec-compliance.test.ts` — `describe("Modifiers (SRCH-MOD-*)")` would gain `it("SRCH-MOD-013 :type")` (**add via task #8**) | Add `"type"` to `MODIFIER_OPS` in `_internal/op-classifier.ts`. |
| 18 | **System-level search, system-level history, POST _search with URL params** | SRCH.12 | dx-annoyance | S | — | `describe("SRCH-URL-001: URL forms")` **pending task #8** | `search-query-builder.ts:690-694` currently only emits `<rt>`. Add system-level (`""`) and history-level (`/_history`) forms. For POST hybrid, preserve URL-level `_format` when switching to POST. |
| 19 | **Choice types in search (`Patient.deceased[x]`) — non-boolean variants** | SRCH.13 | correctness-only | M | — | Would need `describe("SRCH-TYP-010: choice types")` — not currently planned | Typed API is boolean-only today; choice variants currently work by coincidence. See edge-case f.1. Low value; defer. |
| 20 | **FHIRPath slicing → builder types (GEN.1 ripple)** | GEN.1 | blocks-workflow (for IG users) | L | — | N/A — generator, not runtime | Out of debate scope; tracked in AUDIT §4 for the generator team. |
| 21 | **FHIR primitive `_field` extension siblings (FP.9 / GEN.3)** | FP.9, GEN.3 | correctness-only | L | — | N/A | Cross-cutting; parser + emitter + runtime nav all touched. Low user demand. |
| 22 | **FHIRPath `aggregate()` + STU aggregates (`sum`, `min`, `max`, `avg`)** | FP.12 (subset) | correctness-only | M | 3, 10 | `describe("Aggregate (FP-AGG-*)")` **pending** | STU status in spec; ship after arithmetic + env vars. |
| 23 | **Auto-POST measurement: swap UTF-16 `.length` for `TextEncoder.encode(body).length` (defensive hardening)** | SRCH.9b (downgraded to AMBIGUITY-DOCUMENTED per post-test amendment in decisions.md) | correctness-only | S | — | `packages/core/test/search-spec-compliance.test.ts:682` — `test.fails("SRCH-POST / decisions.md SRCH.9b: auto-POST measurement must be \`TextEncoder.encode(body).length\`, not \`body.length\` (defensive against encoder changes)", ...)` | `search-query-builder.ts:678` — replace `.length` with `new TextEncoder().encode(body).length`. Test-engineer's static analysis confirmed `URLSearchParams` percent-encodes non-ASCII *before* the `.length` measurement, so the UTF-16-vs-bytes divergence is not reachable in the current code path. This is defensive hardening against future encoder changes, not a live defect. |

---

## Cross-reference: items explicitly NOT missing-features

These show up in AUDIT.md or decisions.md but are classified as **bugs**, not gaps. They live in `bugs.md`, not here.

| Row | Why it's a bug not a gap |
|---|---|
| SRCH.1 / SRCH.2 / SRCH.3 / SRCH.5 (escape family) | Existing behavior is incorrect per §3.2.1.5.7 — the bug is silent. |
| SRCH.4 (`:not` → `ne` mismapping) | Mapping exists; it's wrong. |
| SRCH.7 (no modifier-applicability validation) | Emitter happily produces ill-formed output; that's a defect, not a missing feature. |
| SRCH.8 (whereChain unconditional `:Type`) | PARTIAL-BUG per debate. |
| SRCH.9a (auto-POST measures wrong branch) | BUG per debate. (SRCH.9b was downgraded to AMBIGUITY-DOCUMENTED post-test — now rank 23 above.) |
| SRCH.10 (dead `autoPostThreshold` field) | Shipping dead code is a bug. |
| REST.1 (204 No Content crash) | Blocker bug. |
| REST.2 (201 Location dropped) | Bug. |
| REST.3 (ETag not extracted) | Bug. |
| REST.4 (non-JSON errors swallowed) | Bug. |
| REST.7 (pagination cycle detection) | Bug. |
| REST.8 (Auth cross-host leak) | Security bug. |
| REST.11 (transaction `fullUrl` missing) | Bug. |
| FP.1b, FP.2, FP.3, FP.4, FP.5, FP.6, FP.7, FP.8, FP.10 | All BUG per debate. |
| GEN.2 (`Reference<T>` `_T` unused) | Cosmetic bug. |

---

## Status

Task #15 complete. Feeds task #17 (AUDIT update — the priority ordering in AUDIT.md:184-195 needs updating to match rank 1..22 above) and task #18 (roadmap reconciliation). Blocked-on-tests flags in the "Acceptance test" column will resolve once tasks #8 and #9 land.
