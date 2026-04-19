# Team Debate — Decisions

**Facilitator:** team-lead
**Arbiters (per task #13 rules):** spec-reader (spec-interpretation), dsl-explorer (impl-reading), test-engineer (test-proves-claim)
**Party:** spec-challenger
**Status of this doc:** draft for team ratification. Each row below is seeded by facilitator from the 3 challenge docs + 3 impl maps + 3 spec rule docs. Teammates are expected to concur, dispute, or amend by DM to team-lead.

Verdict vocabulary:
- **BUG** — confirmed defect in current source. Has file:line + spec citation + (eventually) failing test.
- **SPEC-GAP-BY-DESIGN** — DSL doesn't implement the spec rule; acknowledged as not-yet-built; not a bug.
- **AMBIGUITY-DOCUMENTED** — spec permits multiple valid reads; DSL picks one; document the choice.
- **FALSE-ALARM** — initially challenged; verified OK.
- **OPEN** — team has not reached consensus; arbiter note attached.

---

## Section 1 — FHIRPath (`@fhir-dsl/fhirpath`)

| # | Finding | Citation | Verdict | Arbiter note | Action owner |
|---|---|---|---|---|---|
| FP.1a | AUDIT line 44: policy question — should singleton-eval of a multi-element collection raise or silently return empty? | `operators.ts:98-103`; §4.5 + §6.5.1–6.5.5 | **AMBIGUITY-DOCUMENTED** | spec-reader ruling: hybrid. Default remains lenient (spec-divergent per §4.5 but matches HAPI/fhirpath.js/Firely). Add opt-in `evaluate(expr, { strict: true })` that raises `FhirPathEvaluationError`. `toSingletonBoolean(collection, mode)` threaded through boolean-logic + comparison gates. | docs-engineer → docs callout + Missing-Features (strict-mode flag) |
| FP.1b | `toSingletonBoolean` conflates 3 distinct cases (empty input / should-be-error multi-element / convertible singleton) — caller cannot distinguish | `operators.ts:98-103` | **BUG** | dsl-explorer contest: independent of FP.1a policy, the impl returns `undefined` for all three failure modes; caller has no signal. Remediation: return a discriminated result (or raise in strict mode). | docs-engineer → Bug Report |
| FP.2 | AUDIT line 46 "empty-propagation on comparison operators spec-compliant" — false in 3 ways (partial-precision date, Quantity/compound, multi-element LHS) | `operators.ts:73-92`; §6.2 + §4.4.1 | **BUG** | `const left = collection.length === 1 ? collection[0] : collection[0]` — identical branches. Line 80. | docs-engineer → Bug Report (BUG-001) |
| FP.3 | AUDIT line 47 "children()/descendants() have cycle detection" — no seen-set, no depth cap | `nav.ts:13-36`; §5.2.2/.3 | **BUG** | AUDIT author confused these with `repeat()` (which does have cycle detection in filtering.ts). | docs-engineer → AUDIT correction in #17 |
| FP.4 | `iif()` evaluates criterion against `collection[0]` then broadcasts per-element — two bugs vs §5.5.1 short-circuit semantics | `utility.ts:24-37`; §5.5.1 | **BUG** | NEW (not in AUDIT v0.19.0). | docs-engineer → Bug Report |
| FP.5 | `.eq(value: unknown)` untyped — compound-type equality (Quantity, CodeableConcept, Coding, HumanName, Reference) broken by JS `===` | `expression.ts:49-52` + `operators.ts:73-92` | **BUG** | Broader than AUDIT; every compound FHIR value type affected. | docs-engineer → Bug Report |
| FP.6 | `.value` on Observation returns `[]` because no `value[x]` dispatch; the bug is at the compile/planning layer, not nav lookup | `builder.ts` (polymorphic expansion absent) + `nav.ts:8`; edge-case c.1 | **BUG** — HIGH | dsl-explorer contest: broadened citation. `nav.ts` is correctly looking up `value`; Observation has no `value`. Fix belongs in the builder/planner that emits the `nav(prop="value")` op — it must expand to `valueQuantity|valueString|…`. | docs-engineer → Bug Report (BUG-002 blocker) |
| FP.7 | `ofType(Identifier)` duck-matches `Coding` — TYPE_CHECKS non-disjoint (`system`+`value`) | `filtering.ts`; edge-case c.2 | **BUG** | Structural soundness issue. | docs-engineer → Bug Report |
| FP.8 | Nulls inside collections silently dropped by `nav.ts:9` — breaks `exists()` on `{null}` | `nav.ts:9`; edge-case a.3 | **BUG** | NEW. Medium. | docs-engineer → Bug Report |
| FP.9 | `_fieldName` primitive-extension siblings ignored everywhere | `nav.ts`, `filtering.ts`; edge-case b.3 | **SPEC-GAP-BY-DESIGN** | Large cross-cutting feature; gate behind roadmap. | docs-engineer → Missing-Features |
| FP.10 | Unicode/NFC normalization missing across fhirpath + core; UTF-16 `.length` used for "chars" | edge-case g.1; §2.1.20 | **BUG** — MEDIUM | spec-challenger contest upheld: §2.1.20 uses MUST-language. DSL silently mismatches NFD input against NFC server values. Missing-Features tracks the remediation (NFC helper at string-op boundaries). | docs-engineer → Bug Report + Missing-Features (helper) |
| FP.11 | `repeat()` cycle detection uses reference equality, not `deepEqual` | AUDIT already noted | **AMBIGUITY-DOCUMENTED** | Low. Spec doesn't mandate equality strategy. | docs-engineer → note in fhirpath overview |
| FP.12 | Arithmetic ops (`+ - * / div mod`), string `&`, env vars (`%context` etc.), `extension()`/`resolve()` | AUDIT §1 High-severity | **SPEC-GAP-BY-DESIGN** | Roadmap items. | docs-engineer → Missing-Features |

---

## Section 2 — Search builder (`@fhir-dsl/core` search)

| # | Finding | Citation | Verdict | Arbiter note | Action owner |
|---|---|---|---|---|---|
| SRCH.1 | Comma escaping missing in OR values | `search-query-builder.ts:146` | **BUG** | AUDIT already acknowledged; spec-challenger + dsl-explorer confirmed. Part of the "escape family". | docs-engineer → Bug Report (BUG-003) |
| SRCH.2 | Composite `$` separator: no escape for literal `$` in component values | `search-query-builder.ts:304`; §3.1.1.7 | **BUG** | Part of escape family. | docs-engineer → Bug Report |
| SRCH.3 | Pipe `\|` and backslash `\\` in token values not escaped either | dsl-explorer core-impl-map | **BUG** | Same root cause (missing `escapeSearchValue()` helper). | docs-engineer → Bug Report. **High-leverage fix:** one helper fixes SRCH.1/.2/.3/.4/.5. |
| SRCH.4 | `condition-tree.ts:52` maps `:not` → `_filter ne` — silent semantic drift (`:not` includes null-valued per §3.2.1.5.5.10; `ne` does not) | `condition-tree.ts:52` | **BUG** | dsl-explorer finding. | docs-engineer → Bug Report |
| SRCH.5 | `_filter` emitter escapes single-quotes but not backslashes | spec-challenger rest-challenge D5 | **BUG** | Same escape-family root cause. | docs-engineer → Bug Report |
| SRCH.6 | `:type` modifier missing from `MODIFIER_OPS` | dsl-explorer core-impl-map | **SPEC-GAP-BY-DESIGN** | Add to roadmap. | docs-engineer → Missing-Features |
| SRCH.7 | No validation that a modifier is applicable to its param's type (e.g. `date:exact` would be emitted) | dsl-explorer core-impl-map | **BUG** | DX/safety issue. | docs-engineer → Bug Report (low-severity) |
| SRCH.8 | `whereChain` unconditionally appends `:Type` — no escape hatch to emit cleaner spec form when reference target is already monomorphic | `search-query-builder.ts:382,412` | **PARTIAL-BUG** — LOW | dsl-explorer contest upheld (over spec-challenger "AMBIGUITY+note"): there exists spec-legal behavior the caller cannot currently produce. Remediation: omit `:Type` when the DSL's generated types have already pinned the reference to a single target. Test-engineer to regression-test both forms. | docs-engineer → Bug Report (low) + test both forms |
| SRCH.9a | POST _search auto-switch measures form-body encoding (`paramsToFormBody(params).length`) *even on GET path*; GET uses `URL.searchParams.append()` at `fhir-client.ts:35` which percent-encodes differently | `search-query-builder.ts:677-680`; §3.1.1.1 | **BUG** | spec-challenger split-contest upheld: measurement is not representative of wire URL bytes. | docs-engineer → Bug Report |
| SRCH.9b | Threshold uses UTF-16 `.length` (code units); measurement should be byte-denominated per RFC 7230 §3.1.1 | `search-query-builder.ts:678` | **AMBIGUITY-DOCUMENTED** | **Post-test amendment (2026-04-19):** test-engineer implementation-phase discovery — `paramsToFormBody()` routes through `URLSearchParams`, which percent-encodes non-ASCII to ASCII before the `.length` measurement. On the current form-body code path the UTF-16-vs-UTF-8 divergence is NOT reachable (emoji `🚀`: 2 UTF-16 units → `%F0%9F%9A%80` = 12 ASCII chars, so `.length` coincidentally measures bytes). Pinned as `it.todo` defensive contract: future refactors that bypass URLSearchParams would re-introduce the bug. Fix is still cheap (`new TextEncoder().encode(body).length`) and preempts regression. | docs-engineer → Missing-Features (defensive hardening) |
| SRCH.10 | Dead `autoPostThreshold` state field — can never be set from any public method | `search-query-builder.ts:55` | **BUG** | Low severity. Shipping dead code. | docs-engineer → Bug Report |
| SRCH.11 | POST _search Content-Type | `search-query-builder.ts:685` | **FALSE-ALARM** | Initially flagged by dsl-explorer; verified correct (`application/x-www-form-urlencoded`). Spread order at `fhir-client.ts:42` puts query.headers last. | none |
| SRCH.12 | System-level search, history search, POST _search with URL params dropped | dsl-explorer core-impl-map SRCH-URL-001/002 | **SPEC-GAP-BY-DESIGN** | Add to roadmap. | docs-engineer → Missing-Features |
| SRCH.13 | Choice types in search (`Patient.deceased[x]`) typed API is boolean-only | edge-case f.1 | **SPEC-GAP-BY-DESIGN** | Server-side dispatch works by accident. | docs-engineer → Missing-Features |

---

## Section 3 — Runtime / REST (`@fhir-dsl/runtime` + `@fhir-dsl/core` REST)

| # | Finding | Citation | Verdict | Arbiter note | Action owner |
|---|---|---|---|---|---|
| REST.1 | 204 No Content on DELETE throws `SyntaxError` because `response.json()` is unconditional | `fhir-client.ts:60`, `executor.ts:46` | **BUG** — HIGH | NEW (not in AUDIT). Users cannot delete cleanly today. | docs-engineer → Bug Report (BUG-004 blocker) |
| REST.2 | 201 Created `Location` header dropped — caller cannot retrieve assigned id | `fhir-client.ts:60` | **BUG** | NEW. Violates §3.1.0.9. | docs-engineer → Bug Report |
| REST.3 | `ETag` response header not extracted | `fhir-client.ts`; spec-challenger rest-challenge | **BUG** | NEW. Blocks `If-Match` workflow. | docs-engineer → Bug Report |
| REST.4 | Non-JSON error body silently discarded; `FhirError.operationOutcome === null` | `fhir-client.ts:56` | **BUG** | NEW. HTML 502, plain-text gateway errors swallowed. | docs-engineer → Bug Report |
| REST.5 | `AbortSignal` not threaded into `fetch()`; only checked between pagination pages | runtime-impl-map, AUDIT already noted | **SPEC-GAP-BY-DESIGN** | Priority 1 per AUDIT. | docs-engineer → Missing-Features (rank 1) |
| REST.6 | No retry logic — 429/503, Retry-After, backoff, jitter all absent | runtime-impl-map, AUDIT already noted | **SPEC-GAP-BY-DESIGN** | Priority 1 per AUDIT. Pairs with REST.5. | docs-engineer → Missing-Features |
| REST.7 | Pagination has no cycle detection — infinite loop if server returns self-referential next | `pagination.ts:18`, `search-query-builder.ts:769` | **BUG** | Robustness bug. | docs-engineer → Bug Report |
| REST.8 | Pagination forwards `Authorization` header to arbitrary next-link hosts — credential leak | `pagination.ts:20` | **BUG** — HIGH (security) | NEW. Spec permits cross-host next but DSL should NOT forward bearer tokens without consent. | docs-engineer → Bug Report (BUG-005 security) |
| REST.9 | `Prefer` header not plumbed (`return=minimal/representation/OperationOutcome`, `handling=strict/lenient`, `respond-async`) | runtime-impl-map | **SPEC-GAP-BY-DESIGN** | Add to roadmap. | docs-engineer → Missing-Features |
| REST.10 | `If-Match` / `If-None-Exist` / `If-None-Match` / `If-Modified-Since` headers never threaded | `transaction-builder.ts:7`, `fhir-client.ts` | **SPEC-GAP-BY-DESIGN** | AUDIT already noted. | docs-engineer → Missing-Features |
| REST.11 | `TransactionEntry` missing `fullUrl` → cross-entry `urn:uuid:` references impossible | `transaction-builder.ts:119-131` | **BUG** | NEW. Transactions that reference between entries cannot be built today. | docs-engineer → Bug Report |
| REST.12 | PATCH verb absent despite `HttpMethod` type including it | `transaction-builder.ts` | **SPEC-GAP-BY-DESIGN** | AUDIT already noted. | docs-engineer → Missing-Features |
| REST.13 | `FhirClient` missing direct `create`/`update`/`delete` methods (only via `transaction`) | `fhir-client.ts` | **SPEC-GAP-BY-DESIGN** | Significant DX gap. | docs-engineer → Missing-Features |
| REST.14 | `vread`, `_history`, `/metadata`, HEAD all absent | `fhir-client.ts`; AUDIT already noted | **SPEC-GAP-BY-DESIGN** | — | docs-engineer → Missing-Features |
| REST.15 | Operations framework (`$validate`, `$everything`, `$expand`, `$lookup`, `$translate`) absent; `.validate()` is Ajv client-side only, NOT `$validate` | `fhir-client.ts`, `validation.ts` | **SPEC-GAP-BY-DESIGN** | dsl-explorer ruling: **keep `.validate()` name**, fix via docs disambiguation. Future `$validate` lives on a distinct surface (`client.$validate(...)` or `client.operation("$validate", ...)`). Rename is a public-API break not justified by current conflation risk. docs callout must state "`.validate()` runs client-side schema checks; for server-side FHIR `$validate`, use `client.$validate(...)` (pending REST.15 implementation)." | docs-engineer → Missing-Features (operations framework) + README/dsl-syntax disambiguation callout |
| REST.16 | Async pattern (202 + Content-Location polling, bulk data) absent | runtime-impl-map | **SPEC-GAP-BY-DESIGN** | — | docs-engineer → Missing-Features |

---

## Section 4 — Generator / Types (out of debate scope unless touched by adversarial)

| # | Finding | Verdict |
|---|---|---|
| GEN.1 | Slicing not parsed | **SPEC-GAP-BY-DESIGN** (AUDIT already noted, high priority) |
| GEN.2 | `Reference<T>` `_T` unused | **BUG** (cosmetic but misleading) |
| GEN.3 | `_field` primitive-extension siblings absent | **SPEC-GAP-BY-DESIGN** |

---

## Open items requiring arbitration

All initial OPEN items resolved during ratification (see log below). The remaining follow-ups are execution-level, not debate-level:

1. **Test-proof requirement for all BUG rows** — test-engineer: once #7/#8/#9 land, verify each BUG has a failing test on disk. Docs-engineer's Bug Report (task #16) needs that grounding.
2. **Strict-mode evaluator flag** (from FP.1a) — implementation tracked under Missing-Features; not a debate item.

---

## Consensus status by section (post-ratification)

- **FHIRPath (13 rows after FP.1 split):** all consensus. FP.1a AMBIGUITY-DOCUMENTED, FP.1b BUG, FP.10 upgraded to BUG.
- **Search (14 rows after SRCH.9 split):** all consensus. SRCH.8 PARTIAL-BUG, SRCH.9a+9b BUG, SRCH.11 FALSE-ALARM.
- **REST (16 rows):** all consensus. REST.15 = keep `.validate()` name, fix via docs.
- **Generator (3 rows):** consensus.

---

## Ratification log (2026-04-19)

**Arbiter responses received from spec-reader, dsl-explorer, spec-challenger. No further disputes.**

Amendments applied:

| Row | Arbiter | Change | Reason |
|---|---|---|---|
| FP.1 | spec-reader + dsl-explorer | Split into FP.1a (policy → AMBIGUITY-DOCUMENTED, hybrid: lenient default + opt-in `{strict: true}`) and FP.1b (impl conflates 3 cases → BUG) | spec-reader ruled hybrid policy; dsl-explorer observed the impl bug is independent of policy. |
| FP.1 | spec-reader | Citation §5.5+§6.5 → §4.5+§6.5.1–6.5.5 | §4.5 is "Singleton Evaluation of Collections" where the actual rule lives. §5.5 is Conversion. |
| FP.2 | spec-reader | Citation §6.3.1 → §6.2 + §4.4.1 | §6.3.1 is union operator; comparison+empty-propagation lives at §6.2 and §4.4.1. |
| FP.4 | spec-reader | Citation §6.5.2 → §5.5.1 | §5.5.1 is where short-circuit iif semantics are defined. |
| FP.6 | dsl-explorer | Citation broadened: `builder.ts` (polymorphic expansion absent) + `nav.ts:8` | The bug lives at the compile/planner layer; `nav.ts` correctly looks up `value` — there is no `value` field on Observation. Patching nav would break the fix. |
| FP.10 | spec-challenger | SPEC-GAP-BY-DESIGN → **BUG** (Medium) | §2.1.20 uses MUST-language. DSL silently mismatches spec-correct NFD input against NFC server values. Must appear in Bug Report. |
| SRCH.8 | dsl-explorer | AMBIGUITY-DOCUMENTED → **PARTIAL-BUG** (Low) | There is a spec-legal emission the caller cannot produce (omitting `:Type` on monomorphic references). Behavioral gap, not taste. |
| SRCH.9 | spec-challenger | AMBIGUITY-DOCUMENTED → split into **SRCH.9a** (measures wrong encoding — BUG) + **SRCH.9b** (UTF-16 `.length` vs octets — BUG) | Two independent falsifiable defects conflated in one row. Both produce wrong behavior at boundaries. |
| REST.15 | dsl-explorer | Remove rename recommendation; keep `.validate()`, add docs-side disambiguation | Rename is a public-API break; future `$validate` lives on a distinct surface so no namespace collision. docs-engineer must add the callout. |

**FP.1 policy ruling (spec-reader, verbatim-summarized):** *"Hybrid — lenient by default, strict available via opt-in evaluator flag. Matches HAPI/fhirpath.js/Firely permissive default AND preserves spec text as strict mode. `toSingletonBoolean(collection, mode)` threaded through comparison and boolean-logic gates."*

**REST.15 naming ruling (dsl-explorer, verbatim-summarized):** *"Keep `.validate()`. The ambiguity only exists in users coming from backgrounds conflating client-side schema checks with server-side `$validate`. When the operations framework lands, `$validate` lives on a different code path (`client.$validate(...)` or `client.operation(...)`) — no collision. Docs callout disambiguates at lower cost than an API break."*

**Status: DECISIONS STAND.** Docs-engineer is unblocked on tasks #14, #15, #16, #17, #18.

---

## Post-test amendments (2026-04-19)

Amendments surfaced during implementation of tasks #7/#8/#9 — these are findings test-engineer could not make without writing the test:

| Row | Change | Reason |
|---|---|---|
| SRCH.9b | **BUG → AMBIGUITY-DOCUMENTED** | `paramsToFormBody()` routes through `URLSearchParams` which percent-encodes non-ASCII to ASCII **before** the `.length` measurement. The UTF-16-vs-UTF-8 divergence claimed at debate time is not reachable through the current code path (emoji `🚀`: 2 UTF-16 units → `%F0%9F%9A%80` = 12 ASCII chars, so `.length` coincidentally measures bytes). Framed as `it.todo` defensive contract. Fix (`TextEncoder.encode(body).length`) is still cheap and preempts regression; moved to Missing-Features rather than Bug Report. |

SRCH.9a remains **BUG** (the wrong-encoding-measured claim is independent and still reachable). REST.7 test pattern kept as hard-break-with-page-count (equivalent falsifiability to the 3-visit counter but avoids timeout flake risk).

---

## Fixes landed in v0.20.0 (2026-04-19)

Tight first-pass remediation for blocker-tier + escape family:

| Row | Verdict → Status | Fix |
|---|---|---|
| FP.2 (BUG-001) | BUG → **RESOLVED (lenient default)** | `operators.ts:79-81` — dead ternary replaced; multi-element comparison returns `[]` per §4.5 lenient path. Strict-mode flag (FP.1a opt-in) remains a Missing-Features roadmap item. |
| SRCH.1 + SRCH.2 + SRCH.3 (BUG-003, escape family) | BUG → **RESOLVED (partial)** | New `_internal/escape-search-value.ts` escapes `,`, `$`, `\` (not `|` — see note below). Wired at 3 join sites: array OR, `whereComposite` `$`-join, `condition-tree.ts` OR-tuple join. |
| REST.9 (BUG-004) | BUG → **RESOLVED** | `readJsonBody` helper added to both `fhir-client.ts` and `executor.ts`: short-circuits to `undefined` on status 204 or `Content-Length: 0`. |
| REST.8 (BUG-005, security) | BUG → **RESOLVED** | `executor.ts#executeUrl` compares origins (`new URL().origin`) and passes `{...config, auth: undefined}` to `performRequest` for cross-origin next links; also strips any pre-baked `Authorization` header. |

**Note on `|` escape.** `escapeSearchValue` deliberately does NOT escape `|` because the DSL cannot distinguish a literal `|` inside a string value from the `system|code` / `value|system|code` separator that users pass as a single raw string. Full remediation requires a typed token/quantity API, tracked in Missing-Features.

**Test flips (8 total).** `REST-DELETE-003`, REST.8 cross-host auth, `SRCH-TYP-008` composite `$` (×2), `SRCH-COMB-003` comma (×2 across compliance and url-encoding suites), + `search-url-edge-cases` commas GAP test rewritten. Remaining 55 `test.fails(...)` unchanged and still pin open bugs.

---

<a id="fp1-arbiter"></a>
## FP.1-ARBITER — Policy brief cross-reference (2026-04-19)

**Source of truth:** [`audit/debate/policy-brief.md`](./policy-brief.md) (authored by spec-challenger, reviewed by dsl-explorer).

The brief documents three FHIRPath semantic policies where strict §-compliance diverges from DSL ergonomics. Task #13 is `completed`; the brief does NOT reopen debate. It is an arbiter note attached to FP.1 and the cross-reference for docs-engineer on tasks #14/#15/#16.

| Row | Spec rule | Current | Default (recommended) | Escape hatch |
|---|---|---|---|---|
| 1. Singleton evaluation | §4.5 "signal an error" on multi-element | mixed silent-first (`operators.ts:80`) + silent-empty (`operators.ts:98`) | **strict error** (matches FP.1a spec-reader hybrid ruling: default lenient today, opt-in strict now, invert when impl stabilizes) | `singletonMode: "strict" \| "permissive-first" \| "permissive-empty"` |
| 2. Equality types | §6.1/§6.3.1 type-aware | JS `===` everywhere (`operators.ts:7`) | **type-aware**: Date precision + structural Quantity land now; UCUM + NFC stage | `ucum: "strict" \| "ignore" \| "lenient"` for Quantity only |
| 3. Empty-propagation in arithmetic/math | §4.4.1 empty everywhere | `NaN`/`Infinity` leak from math functions; arithmetic ops not yet built | **empty everywhere** | `mathDomainMode: "strict-empty" \| "throw"` — `strict-empty` is spec + default; `throw` is opt-in for dev/test visibility (dsl-explorer amendment to spec-challenger's original "no escape hatch" framing) |

**Consistency invariant (dsl-explorer carry-through to FP.1b):** whichever singleton mode is active MUST apply uniformly across boolean, comparison, and `is`-context gates. The current B-for-comparisons + C-for-booleans mixture is an impl bug regardless of policy choice.

**Dependencies surfaced by the brief:**
- `.trace(label)` (FP-UTIL-003) is MISSING — docs-engineer task #15 should rank it alongside the singleton-mode flag as a prerequisite for Row 3's debug-UX answer. Without `.trace`, the `mathDomainMode: "throw"` opt-in is the only fail-fast signal available.
- NFC normalization (Row 2 string equality) pairs with search row FP.10; single library-wide helper fixes both input boundaries.

**Impact on downstream tasks:**
- **#14 Coverage Matrix** — cite FP.1-ARBITER as the canonical policy anchor for §4.5, §6.1, §6.3.1, §4.4.1 rows.
- **#15 Missing-Features** — rank (HIGH) the `singletonMode` flag, Date-precision equality, structural Quantity equality, `.trace()`, and NFC helper.
- **#16 Bug Report** — quote `policy-brief.md` §"Current behavior" verbatim for FP.1b, FP.2, FP.5, and the math-function rows (FP-MATHF-005/007/009).

**Status:** arbiter note only — no row verdicts change. All three recommendations are defaults-with-opt-ins, consistent with the team's "strict-by-default, spec-conformant escape hatches" pattern.
