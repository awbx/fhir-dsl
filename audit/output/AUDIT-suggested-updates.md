# AUDIT.md — Suggested Updates (Proposal, Not Applied)

**Status:** PROPOSAL for maintainer review. **Do not** apply mechanically — read each rationale first.

**Why this exists.** The audit team's debate (`audit/debate/decisions.md`) identified several false-positive rows in AUDIT.md v0.19.0 plus a number of priority-ordering and coverage-figure disagreements. Per task #17 rules, docs-engineer does NOT edit `AUDIT.md` directly.

**Layout.** Each proposed change is a `BEFORE` / `AFTER` pair with a citation back to `decisions.md`. Line numbers reference AUDIT.md as of commit `4f91589`.

---

## 1. Header / coverage-figure reconciliation

### Change 1.1 — FHIRPath coverage figure

**AUDIT.md:13** currently reads:

> README claims "~85% of the official FHIRPath spec including 60+ functions." By function-count against the normative spec, realistic coverage is closer to **~54%**.

**Proposal.** Reconcile against the rule-count computation in `audit/output/spec-coverage-matrix.md`:

> README claims "~85% of the official FHIRPath spec including 60+ functions." By **rule count** against the normative spec (159 atomic rules in `audit/spec/fhirpath-n1-rules.md`), realistic coverage is **23.9% implemented (38/159)**, with 40 rules PARTIAL, 21 INCORRECT, and 60 MISSING. Function-count coverage — an earlier estimate at ~54% — inflates the figure because it counts any present function as covered regardless of edge-case correctness. The categorical breakdown in §1 shows wide variance (boolean logic 100%, arithmetic 0%).

**Rationale.** Debate row FP.10, FP.1a, FP.6 upgraded several rows that had been IMPLEMENTED→PARTIAL/INCORRECT, pulling the aggregate down. Rule-count denominator is more honest than function-count. Cross-reference: `spec-coverage-matrix.md` FHIRPath table.

---

### Change 1.2 — Coverage summary table (AUDIT.md:170-181)

**BEFORE:**
```
| FHIRPath N1                 | ~54% by function count | missing arithmetic, env vars, FHIR extensions |
| R5 search                   | ~80%                   | operators, modifiers, chain, _has, composite, :iterate all present; edge gaps in comma escaping |
| REST operations             | ~50%                   | read/create/update/delete only; no PATCH, conditionals, $operations, vread, history, metadata |
| StructureDefinition parsing | ~75%                   | choice types, backbones, bindings, contentReference, extensions; missing slicing |
| Validator emission          | ~70%                   | cardinality, patterns, required bindings; missing `_field` siblings, invariants |
| SMART App Launch v2         | ~90%                   | PKCE, v2 scopes, backend services all correct |
| Runtime                     | ~60%                   | paging + typed errors; no retry, no abort |
```

**AFTER:**
```
| FHIRPath N1                 | 23.9% by rule count (38/159) | WIDE variance: boolean logic 100%, arithmetic 0%; see spec-coverage-matrix.md |
| R5 search                   | 72.1% (62/86)                 | Escape family broken (BUG-003), `:not`→`ne` mismapped, `:type` missing |
| REST + operations           | 6.5% (8/124)                  | Operations framework entirely absent; transaction-only mutations; many response headers dropped |
| Runtime transport           | 20% functional (2/10 concerns) | 204 DELETE crashes; Auth leak on paginated cross-host; no retry; no AbortSignal in fetch |
| StructureDefinition parsing | ~75% (unchanged — not re-audited) | — |
| Validator emission          | ~70% (unchanged)              | — |
| SMART App Launch v2         | ~90% (unchanged — not re-audited) | — |
```

**Rationale.** See coverage-matrix disagreement callouts. StructureDefinition/Validator/SMART were not re-scoped in this audit and retain their previous figures. Runtime number updated from 60% to 20% because the denominator now includes 204-bug, non-JSON-error-swallowing, Auth-leak, and pagination-cycle (all confirmed bugs, not pre-counted).

---

## 2. False positives to remove

### Change 2.1 — Remove AUDIT.md:44 false "positive"

**BEFORE:**
```
- Three-valued boolean logic (`and`/`or`/`xor`/`implies`) in `packages/fhirpath/src/eval/operators.ts` correctly propagates empty per spec §3.2.2.
```

**PROPOSAL.** **Keep this line** — the debate upheld it as true (FP-LOG-001..005 all IMPLEMENTED per impl-map). The only caveat is that boolean logic depends on `toSingletonBoolean` which is buggy (FP.1b), but the truth-table cells themselves are correct. No change.

### Change 2.2 — Rewrite AUDIT.md:46 false "positive"

**BEFORE:**
```
- Empty-propagation on comparison operators is spec-compliant.
```

**AFTER:**
```
- Empty-propagation on comparison operators is **not** spec-compliant. Per debate FP.2 (BUG-001), three defects: (a) `operators.ts:80` has an identical-branch ternary that silently reduces multi-element left operands to their first element, (b) partial-precision dates compare via JS `<`/`>` instead of yielding empty per §6.2, and (c) Quantity/compound operands compare by reference. Captured in bugs.md as BUG-001.
```

**Rationale.** `decisions.md` row FP.2. Direct falsification by `audit/impl/fhirpath-impl-map.md` §9 (FP-CMP-001..003 all INCORRECT or PARTIAL).

### Change 2.3 — Rewrite AUDIT.md:47 false "positive"

**BEFORE:**
```
- `children()` / `descendants()` include cycle detection in `packages/fhirpath/src/eval/nav.ts`.
```

**AFTER:**
```
- `children()` / `descendants()` have **no** cycle detection — `nav.ts:14-36` uses an iterative stack with no seen-set. Cyclic input unbounds memory. The AUDIT author appears to have confused these with `repeat()` (which does have cycle detection in `filtering.ts`). Captured in bugs.md as BUG-006.
```

**Rationale.** `decisions.md` row FP.3. `fhirpath-impl-map.md` FP-TREE-002 cites `nav.ts:22-36` with "NO visited set".

### Change 2.4 — Rewrite AUDIT.md:80 / 83 / 84 (search "positives")

**BEFORE (lines 80-84):**
```
- Compile-time operator narrowing per param type is real (see `SearchPrefixFor<P>` in `packages/core/src/types.ts`).
- `include()`/`revinclude()` constrain to typed paths via `IncludeFor<S, RT>`.
- Auto POST switch above ~1900 URL chars, correctly routes to `Patient/_search`.
- Pagination correctly walks `Bundle.link[rel=next]` via `.stream()`.
- Composite params correctly join with `$` per spec.
```

**AFTER:**
```
- Compile-time operator narrowing per param type is real (see `SearchPrefixFor<P>` in `packages/core/src/types.ts`) — but there is no RUNTIME enforcement (BUG-025).
- `include()`/`revinclude()` constrain to typed paths via `IncludeFor<S, RT>`.
- Auto-POST switch is present at ~1900 URL units, correctly routes to `Patient/_search` — **caveat**: threshold is measured in UTF-16 code units on the form-body encoding (not the GET wire URL), so both the denomination and the reference encoding are wrong (BUG-017, BUG-018).
- Pagination correctly walks `Bundle.link[rel=next]` via `.stream()` — **but has no cycle detection** (BUG-019) and forwards `Authorization` to arbitrary next-link hosts (**BUG-005, security**).
- Composite params join with `$` per spec — **but do not escape literal `$` in component values** (BUG-003 escape family).
```

**Rationale.** Debate rows SRCH.9a, SRCH.9b, REST.7, REST.8, SRCH.1/2/3. Each is a confirmed bug overturning the AUDIT v0.19.0 "positive" claim.

---

## 3. Reorder / correct priority list

### Change 3.1 — Replace AUDIT.md:184-195 priority ordering

**BEFORE:**
```
1. Runtime: `AbortSignal` threading and retry policy — ...
2. Core: comma escaping in OR values — ...
3. FHIRPath: arithmetic + `&` — ...
4. FHIRPath: environment variables — ...
5. Generator: slicing — ...
6. Core: PATCH + conditional operations — ...
7. FHIRPath: `extension()` + `resolve()` — ...
```

**AFTER (aligned with `audit/output/missing-features.md`):**
```
Priority 1 (team-nominated):
1. Runtime: thread `AbortSignal` into `fetch()` (REST.5).
2. Runtime: retry policy for 429/503 with Retry-After + capped exponential backoff (REST.6).
3. FHIRPath: arithmetic operators `+`, `-`, `*`, `/`, `div`, `mod`, `&` (FP.12 subset).
4. FHIRPath: strict-mode evaluator flag `evaluate(expr, { strict: true })` (FP.1a remediation).
5. Core: operations framework — `client.$validate`, `client.$everything`, generic `client.operation(...)` (REST.15). Pairs with the REST.15 docs-side disambiguation callout for `.validate()`.

Priority 2 (strong user impact):
6. Conditional headers: If-Match / If-None-Exist / If-None-Match / If-Modified-Since (REST.10).
7. Direct `client.create/update/delete/patch` on `FhirClient` (REST.13).
8. PATCH verb with JSON Patch / FHIRPath Patch content types (REST.12).
9. `Prefer` header plumbing — return=*, handling=*, respond-async (REST.9).
10. FHIRPath environment variables (`%context`, `%resource`, `%rootResource`, `%ucum`, `%vs-*`, `%ext-*`, `$index`, `$total`) (FP.12 subset).
11. FHIRPath `extension()`, `resolve()`, `hasValue()`, `getValue()`, `htmlChecks()` (FP.12 subset).

Priority 3 (narrower impact or low cost):
12. Unicode NFC normalization helper at string-op boundaries (FP.10 remediation).
13. `history()`, `vread()`, `capabilities()` (REST.14).
14. Async pattern (Prefer: respond-async + 202 polling) (REST.16).
15. `:type` modifier on reference params (SRCH.6).
16. System-level and history-level search URL forms (SRCH.12).
17. Choice types in search typed API beyond boolean-only (SRCH.13).
18. Slicing in the generator (GEN.1 — out of debate scope, but AUDIT-tracked).
19. `_field` primitive-extension siblings (FP.9 / GEN.3).
20. FHIRPath `aggregate()` and STU aggregates `sum`/`min`/`max`/`avg` (FP.12 subset).

Bugs are not priorities on this list — they live in `audit/output/bugs.md`. The highest-impact bugs (blocker tier) should be addressed before any Priority-2 feature ships.
```

**Rationale.** Comma-escape (was AUDIT P2) is now a BUG (BUG-003), not a missing feature; moved to bugs.md. Slicing was out of debate scope and kept at Priority 3. Strict-mode flag (new) and operations framework (promoted) rise above `extension()`/`resolve()` because they unblock larger surface area. Full discussion in `missing-features.md` Priority 1 section.

---

## 4. Additions (net-new rows not in AUDIT.md v0.19.0)

Add to AUDIT.md §3 (Runtime), in the "High severity" table:

```
| **204 No Content on DELETE crashes `response.json()`** | `fhir-client.ts:60`, `executor.ts:46` — unconditional `.json()` throws on empty body | Any spec-compliant server returning 204 on DELETE poisons caller. **BUG-004 (blocker).** |
| **201 Created `Location` header silently dropped** | `fhir-client.ts:60`, `executor.ts:46` — response headers never surfaced | Caller cannot retrieve assigned id when `Prefer: return=minimal` is honored. **BUG-020.** |
| **`Authorization` forwarded to arbitrary next-link hosts** | `pagination.ts:20` — bearer token leaks on cross-origin next URLs | Security defect. **BUG-005 (blocker).** |
| **Transaction entries missing `fullUrl`** | `transaction-builder.ts:119-131` — cross-entry `urn:uuid:` references impossible | Common transactional patterns unbuildable today. **BUG-011.** |
| **Non-JSON error body silently discarded** | `fhir-client.ts:56-57`, `executor.ts:42-43` — HTML 502s, plain-text gateway errors lose diagnostic context | Real-world debuggability. **BUG-022.** |
```

Add to AUDIT.md §2 (Core / search), in the "High severity" table:

```
| **Escape family broken for `,`, `$`, `\|`, `\\`** | `search-query-builder.ts:146,304`, `condition-tree.ts:26`, `_filter` emitter | Single-value queries parse as multi-value OR; composites reshape. **BUG-003 (blocker).** |
| **`:not` modifier degrades to `_filter ne`** | `condition-tree.ts:52` — silent semantic drift (`:not` includes null values per §3.2.1.5.5.10; `ne` does not) | **BUG-015.** |
| **Multi-hop chain unconditionally appends `:Type` to terminal hop** | `search-query-builder.ts:412` | PARTIAL-BUG per debate SRCH.8. **BUG-016.** |
| **Auto-POST threshold measures wrong encoding** | `search-query-builder.ts:677-680` — form-body encoding vs GET wire URL | **BUG-017.** |
| **Auto-POST threshold uses UTF-16 `.length`, not byte-length** | `search-query-builder.ts:678` | Multi-byte content can exceed server URL limits silently. **BUG-018.** |
```

Add to AUDIT.md §1 (FHIRPath), in the "High severity" table:

```
| **`=` on multi-element left operand silently uses first element** | `operators.ts:80` — dead identical-branch ternary | Violates §4.5 singleton evaluation. **BUG-001 (blocker).** |
| **`Observation.value` returns `[]` (no `value[x]` dispatch at compile/planner layer)** | `builder.ts` polymorphic expansion absent; `nav.ts:8` correctly fails to find literal `value` | Violates R5 §2.1.9.1.1. **BUG-002 (blocker).** |
| **`iif()` evaluates criterion against `collection[0]` only and broadcasts result** | `utility.ts:24-37` | Violates §5.5.1 short-circuit semantics. **BUG-007.** |
| **`.eq(value)` broken for every compound FHIR value type** | `expression.ts:49-52`, `operators.ts:73-92` — JS `===` on Quantity/Coding/CodeableConcept/HumanName/Reference | **BUG-008.** |
| **`ofType(Identifier)` duck-matches `Coding` via non-disjoint `TYPE_CHECKS`** | `filtering.ts:5-20` | Structural soundness. **BUG-009.** |
| **Unicode NFC normalization missing** | Cross-cutting — string ops in `strings.ts` + search in `search-query-builder.ts` | Violates §2.1.20 MUST-language. **BUG-010.** |
```

---

## 5. Housekeeping

### Change 5.1 — Append to AUDIT.md:204 (footer)

**BEFORE:**
```
*This audit was produced by reading the source at commit `4f91589` on branch `main`. When the audit is rerun, check the item list against this document and remove anything that has landed.*
```

**AFTER:**
```
*This audit was produced by reading the source at commit `4f91589` on branch `main`. When the audit is rerun, check the item list against this document and remove anything that has landed.*

*Superseded figures.* The v0.19.0 audit's FHIRPath coverage figure (~54% by function count), R5 search (~80%), and Runtime (~60%) were updated in v0.20.0+ after the adversarial/debate pass produced `audit/output/spec-coverage-matrix.md`. See that file for rule-count denominators and per-category breakdowns. See `audit/output/bugs.md` for the full bug ledger with reproductions, and `audit/output/missing-features.md` for the ranked roadmap.
```

---

## 6. Not changed (deliberately)

The following AUDIT.md rows were considered and kept as-is:

- **§5 (`@fhir-dsl/types`)** — out of debate scope; no new findings.
- **§6 (`@fhir-dsl/terminology`)** — out of debate scope.
- **§7 (`@fhir-dsl/smart`)** — no adversarial review performed; original figures stand.
- **§4 Generator** — GEN.1 and GEN.3 remain SPEC-GAP-BY-DESIGN; GEN.2 upgraded to BUG but cosmetic (Reference<T> unused). No §4 rewrite needed — just add GEN.2 to a BUG section if maintainer wants full parity with bugs.md.
- **Non-priorities (AUDIT.md:196-201)** — full UCUM, IG-specific constraint compilation, full OIDC ID-token verification. All still valid non-priorities per team consensus.

---

## Apply notes

If the maintainer accepts these diffs:
1. Apply the text changes in sections 1 → 2 → 3 → 4 → 5 in that order.
2. Bump the AUDIT version line (not numbered in the file today; consider adding `**Audit version:** v0.20.0` at line 3).
3. Cross-check that new BUG IDs cited here (BUG-001..027) match final IDs in `audit/output/bugs.md` before publishing — if test-engineer's task #9 produces additional bugs, numbering may shift.
