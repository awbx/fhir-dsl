# apps/docs Docusaurus Site — Suggested Updates (Proposal, Not Applied)

**Status:** PROPOSAL for maintainer review. **Do not** apply to `apps/docs/docs/**` directly — per task #18 rules, all edits live in this file as proposed diffs.

**⚠️ PRE-v0.20.0 — NEEDS RECONCILIATION BEFORE SHIPPING.** This proposal was written against the v0.19.0 bug state. Since then, v0.20.0 has landed fixes for 4 blocker-tier bugs (BUG-001 FHIRPath dead-ternary, BUG-003 search-value escape family for `,`/`$`/`\`, BUG-004 204 No Content, BUG-005 cross-origin auth leak). Any section below that describes those four defects as "currently broken" is stale. Before this proposal is applied, reconcile against `AUDIT.md` "Fixes landed" and `audit/output/bugs.md` current status. BUG-002 (`Observation.value` polymorphic expansion) remains open.

**Scope.** Reconcile each docs-site page with `audit/output/bugs.md`, `audit/output/missing-features.md`, `audit/output/spec-coverage-matrix.md`, and the ratified `audit/debate/decisions.md`. Every proposed change cites a bug ID, finding ID, or coverage-matrix row.

**Voice.** Match the existing site voice — terse, factual, sparing with cautionary tone. No marketing. No emoji. Callouts use Docusaurus admonitions (`:::note`, `:::caution`, `:::tip`).

---

## Target 1 — `apps/docs/docs/fhirpath/overview.md`

**Bug/finding basis:** Coverage-matrix FHIRPath table (23.9% by rule count), debate rows FP.1a, FP.2, FP.3, FP.4, FP.5, FP.6, FP.7, FP.8, FP.10, FP.12.

### Proposed diff 1.1 — Rewrite the "FHIRPath Spec Coverage" section (lines 209-227)

**BEFORE:**
```markdown
## FHIRPath Spec Coverage

The package implements approximately 85% of the [official FHIRPath specification](https://hl7.org/fhirpath/):

| Category | Functions | Status |
|---|---|---|
| Navigation | Property access, children, descendants | Implemented |
| Filtering | where, select, repeat, ofType | Implemented |
| Existence | exists, all, allTrue/anyTrue/allFalse/anyFalse, count, empty, distinct, isDistinct | Implemented |
| Subsetting | first, last, single, tail, skip, take, intersect, exclude | Implemented |
| Combining | union, combine | Implemented |
| String | indexOf, substring, startsWith, endsWith, contains, upper, lower, replace, matches, replaceMatches, length, toChars | Implemented |
| Math | abs, ceiling, exp, floor, ln, log, power, round, sqrt, truncate | Implemented |
| Conversion | toBoolean, toInteger, toDecimal, toString, toDate, toDateTime, toTime, toQuantity, convertsTo* | Implemented |
| Operators | `=`, `!=`, `<`, `>`, `<=`, `>=`, and, or, xor, not, implies, is, as | Implemented |
| Utility | trace, now, today, timeOfDay, iif | Implemented |
| Aggregate | aggregate() | Not yet |
| Equality | ~ (equivalent), !~ (not equivalent) | Not yet |
| Arithmetic | +, -, *, /, mod, div (standalone operators) | Not yet |
```

**AFTER:**
```markdown
## FHIRPath Spec Coverage

Coverage against the [official FHIRPath N1 specification](https://hl7.org/fhirpath/) is **~24% by rule count (38 of 159 atomic rules implemented)**, with wide variance by category. See the [spec-coverage matrix](https://github.com/awbx/fhir-dsl/blob/main/audit/output/spec-coverage-matrix.md) for the per-rule breakdown.

| Category | Coverage | Notes |
|---|---|---|
| Navigation (FP-NAV-*) | 60% | Core `Patient.name.given` flattening works; singleton evaluation is lenient-by-default (see below). |
| Indexer (FP-IDX-*) | 50% | Array index works by accident; no proper `[n]` surface. |
| Filtering / projection | 50% | `where`, `select`, `repeat` work. `ofType` uses a hardcoded duck-type map (see gaps). |
| Subsetting | 62% | `first`, `last`, `tail`, `take`, `skip` work on the happy path. Negative `num` in `skip`/`take` diverges from spec. |
| Combining | 75% | `union`, `combine`, `distinct`, `isDistinct` work; `\|` pipe-operator as a literal is not exposed. |
| Existence | 60% | `exists`, `empty`, `count`, `all` work. `allTrue`/`allFalse` on empty return `false` (spec: `true`). |
| Boolean logic | **100%** | `and`/`or`/`xor`/`implies`/`not` — all nine truth-table cells verified. |
| Equality | 20% | `=`/`!=` work for primitives; `~`/`!~` missing; Quantity/Coding/CodeableConcept/Reference equality broken. |
| Comparison | 0% implemented (2 partial / 1 missing) | Multi-element operand silently picks the first element; partial-precision dates compared lexicographically. |
| Arithmetic | **0%** | `+`, `-`, `*`, `/`, `div`, `mod`, `&` all missing. |
| Collection operators | 0% | `in`, list-form `contains`, `\|` missing. |
| Type operators | 0% implemented (3 partial / 1 incorrect) | `is`/`as`/`ofType` use disjoint resolvers that disagree on type matching. |
| Tree navigation | 0% implemented | `children()`/`descendants()` lack cycle detection. |
| String manipulation | 26% | 13 core functions present; `split`/`join`/`trim`/`encode`/`decode`/`escape`/`unescape` missing; `matches` does substring (not full-match) regex. |
| Math functions | 50% | `abs`/`ceiling`/`floor`/`exp`/`round`/`truncate` correct; `ln`/`log`/`power`/`sqrt` leak `NaN`/`Infinity` on domain errors. |
| Conversion | 0% implemented (6 partial / 11 incorrect) | `toBoolean` case-sensitive only; `toInteger`/`toDecimal` accept non-numeric suffixes; `toDateTime` uses `Date.parse`. |
| Utility | 0% implemented (both partial) | `trace` missing projection arg; `now()`/`today()`/`timeOfDay()` not deterministic within a single expression. |
| Aggregate | 0% | Entirely missing. |
| Environment variables | 10% | Only `$this` wired. No `%context`/`%resource`/`%ucum`/`%vs-*`/`%ext-*`, no `$index`/`$total`. |
| Literals | 0% implemented (4 partial / 6 missing) | Boolean/string/integer/decimal work inline; Date/Time/DateTime/Quantity literals missing. |
| Date/time arithmetic | 0% | Missing entirely. |
| FHIR-specific (`extension()`, `resolve()`, `hasValue()`, etc.) | 0% | Missing entirely. |

### Known spec gaps (verified)

The following are known defects against the FHIRPath N1 spec. See [`audit/output/bugs.md`](https://github.com/awbx/fhir-dsl/blob/main/audit/output/bugs.md) for reproductions.

- **Arithmetic operators** (`+`, `-`, `*`, `/`, `div`, `mod`, `&`) — missing (§6.6).
- **Environment variables** (`%context`, `%resource`, `%rootResource`, `%ucum`, `%vs-*`, `%ext-*`, `$index`, `$total`) — missing (§9). Required by real-world profile constraint evaluation.
- **FHIR-specific functions** (`extension(url)`, `resolve()`, `hasValue()`, `getValue()`, `htmlChecks()`, `memberOf()`, `conformsTo()`) — missing (R5 §2.1.9.1.5).
- **Multi-element singleton evaluation** — per §4.5 the evaluator should error when `=`, `is`, boolean-context operators see a cardinality > 1 collection. Today the DSL silently reduces to the first element; opt in to strict checks via the upcoming `evaluate(expr, { strict: true })` flag (see Strict Mode below).
- **Quantity equality** — per §6.1 / R5 §2.1.9.1.6, Quantity values compare by value+UCUM unit; today uses JS `===` reference equality.
- **Partial-precision date comparison** — per §6.2, comparing operands at different precisions yields empty; today uses JS lexicographic `<` on the string form.
- **Unicode NFC normalization** — per §2.1.20 (MUST-language), strings MUST be normalized to NFC before comparison; today NFD input silently mismatches spec-correct NFC server values.

:::caution Lenient by default
This DSL follows the permissive behavior of HAPI / fhirpath.js / Firely — multi-element singletons silently reduce rather than raise. This matches real-world ergonomics but diverges from §4.5. For CI / conformance testing, opt into strict mode:

```ts
expr.evaluate(resource, { strict: true }); // throws FhirPathEvaluationError on §4.5 violations
```
(Strict-mode flag is on the near-term roadmap; see [`audit/output/missing-features.md`](https://github.com/awbx/fhir-dsl/blob/main/audit/output/missing-features.md) Priority 1 item 4.)
:::

:::note Polymorphic `value[x]`
`fhirpath<Observation>("Observation").value` currently returns `[]` — the proxy emits `nav("value")` but Observation has no literal `value` field (it has `valueQuantity`, `valueString`, etc.). Workaround today: reach directly for the variant (`.valueQuantity`). Proper `value[x]` expansion is tracked as BUG-002.
:::
```

**Rationale.** Matches `audit/output/spec-coverage-matrix.md` FHIRPath table verbatim. The "Known spec gaps" subsection is a task #18 hard requirement (explicit callout list per debate).

---

## Target 2 — `apps/docs/docs/core-concepts/dsl-syntax.md`

**Bug/finding basis:** BUG-003 (escape family), BUG-015 (`:not` → `ne` mismap), BUG-016 (chain terminal `:Type`), BUG-017/018 (auto-POST threshold).

### Proposed diff 2.1 — Correct the false claim at line 75

**BEFORE:**
```markdown
### Multi-value (OR via comma)

Pass an array to `where(..., "eq", [...])` to express an OR across values. FHIR encodes this as a comma-separated list (`gender=male,female`), and the builder URL-encodes embedded commas in each value.
```

**AFTER:**
```markdown
### Multi-value (OR via comma)

Pass an array to `where(..., "eq", [...])` to express an OR across values. FHIR encodes this as a comma-separated list (`gender=male,female`).

:::caution Escape-family bug (BUG-003)
Literal `,`, `$`, `|`, and `\` characters inside parameter values are **not** escaped per [FHIR §3.2.1.5.7](https://hl7.org/fhir/R5/search.html#escaping) today. A value like `"O'Brien, Jr."` is parsed by the server as an OR of three names (`O'Brien`, ` Jr.`), not as a single literal. Tracked as BUG-003 ([bugs.md](https://github.com/awbx/fhir-dsl/blob/main/audit/output/bugs.md#bug-003)).

Affected surfaces:
- `.where(param, "eq", [array])` comma-joining
- `.whereComposite(name, components)` dollar-joining (BUG-003 / SRCH-COMP-001)
- `.where(cb => cb.or([...]))` cross-param OR emission
- `_filter` string values (single-quote escaped; backslash and dollar are not)

Workaround until the fix lands: substitute separator characters in values before passing them in.
:::
```

**Rationale.** The current sentence "the builder URL-encodes embedded commas in each value" is **factually wrong** and sends users down a rabbit hole when they hit the bug. Cite: `core-impl-map.md` SRCH-COMB-003 ("INCORRECT — `.join(",")` / `.join("$")` never prepend `\`").

### Proposed diff 2.2 — Add `:not` callout near the modifier section

(The `:not` modifier is shown in the operator tables at line 37 of dsl-syntax.md; callers using `.where(cb => cb.or([["x",":not","a"],["x",":not","b"]]))` today get a silent semantic downgrade per BUG-015.)

**Insert immediately after the `:note Prefixes vs. modifiers` block (around line 71):**

```markdown
:::caution `:not` modifier in OR groups (BUG-015)
When `:not` is placed in a multi-value OR group that falls through to `_filter`, the DSL emits `_filter=... ne ...` — but per [§3.2.1.5.5.10](https://hl7.org/fhir/R5/search.html#modifiers), `:not` INCLUDES resources with no value for the parameter, whereas `_filter ne` does NOT. Using `:not` in a single-value `.where()` call is safe; using it inside `.or([...])` silently drops the null-inclusion semantics. Tracked as BUG-015.
:::
```

### Proposed diff 2.3 — Add caveat to the auto-POST threshold wording

If the page documents the ~1900-char auto-POST switch (search README.md:228 for the phrasing; check dsl-syntax.md for a parallel mention), add:

```markdown
:::note Auto-POST threshold (BUG-017, BUG-018)
The ~1900 threshold that triggers auto-POST is measured in **UTF-16 code units** of the **form-body encoding** — not in bytes of the actual GET wire URL. Multi-byte content (emoji, non-BMP CJK) can exceed many servers' 8 KB URL limits before the threshold fires. Force POST explicitly via `.usePost()` when your query includes non-ASCII parameter values. Tracked as BUG-017 (encoding mismatch) and BUG-018 (UTF-16 vs byte length).
:::
```

If no such mention exists, no change needed here — the auto-POST caveat lives only on the README (see README-suggested-updates).

### Proposed diff 2.4 — Add `whereChain` caveat

If `dsl-syntax.md` documents `whereChain`, add:

```markdown
:::note Multi-hop chain `:Type` suffix (BUG-016)
`whereChain` unconditionally appends `:Type` to every hop, including the hop immediately before the terminal parameter. When the reference is already monomorphic, the emitted URL is spec-legal but carries a redundant `:Type` anchor. Tracked as BUG-016 (PARTIAL-BUG per debate). A future release will omit `:Type` when the DSL's generated types have pinned the reference.
:::
```

**Rationale.** Cite: debate SRCH.8 upheld as PARTIAL-BUG; there exists a spec-legal emission the caller cannot produce today.

---

## Target 3 — `apps/docs/docs/guides/validation.md`

**Bug/finding basis:** Debate REST.15 (keep `.validate()` name; docs-side disambiguation required).

### Proposed diff 3.1 — Add the `.validate()` vs `$validate` disambiguation at the top

**Insert immediately after the existing intro paragraph (line 11, after the Standard Schema V1 mention):**

```markdown
:::caution `.validate()` is client-side, NOT server-side `$validate`
Every `*Schema` in this guide runs client-side, synchronously, inside your process. It validates JSON shape, primitives, ValueSet bindings, cardinality, and profile tighten-ups — none of which require a FHIR server.

**This is not** the [FHIR `$validate` operation](https://hl7.org/fhir/R5/resource-operation-validate.html), which invokes a FHIR server endpoint and can check invariants, terminology against the server's TX, `create`/`update` acceptability, and more. Server-side `$validate` is tracked in the roadmap as `client.$validate(...)` — it will live on a distinct surface so there is no namespace collision with the existing `.validate()`.

Picking the right one:

| Need | Use |
|---|---|
| Shape, primitives, ValueSets, cardinality, profile narrowing — without hitting the network | `Schema["~standard"].validate(value)` (this guide) |
| Invariants (`constraint` expressions), server terminology lookups, `create`/`update` acceptability | Server-side `$validate` via `client.$validate(...)` (pending; see [roadmap](../roadmap.md)) |
:::
```

**Rationale.** Debate REST.15 ruling, verbatim-summarized: *"Docs callout disambiguates at lower cost than an API break. `client.$validate(...)` lives on a different code path — no collision."* docs-engineer must add this callout per the debate ruling.

---

## Target 4 — `apps/docs/docs/roadmap.md`

**Bug/finding basis:** Full `audit/output/missing-features.md` (Priority 1–3). The current roadmap diverges materially from the team-ranked priority list.

### Proposed diff 4.1 — Replace the entire roadmap content

**BEFORE (full file, lines 1-39):**
```markdown
## FHIR Operations

- **`$everything`** — Patient/Encounter everything operations
- **`$validate`** — Resource validation against profiles
- **Custom operations** — Type-safe builder for arbitrary FHIR operations

## Developer Experience

- **Middleware/interceptors** — Hook into request/response pipeline for logging, retries, metrics
- **History** — Resource and type-level history queries
- **Capabilities** — Typed access to CapabilityStatement for feature detection

## Code Generation

- **Watch mode** — Re-generate types when StructureDefinitions change
- **Custom profiles** — Generate types from your own StructureDefinitions
- **Incremental generation** — Only regenerate changed resources
- **Extension support** — First-class typed extensions

## Ecosystem

- **React hooks** — `useFhirSearch`, `useFhirRead` for React applications
- **Adapter packages** — Pre-built adapters for popular FHIR servers (HAPI, Azure Health Data Services, Google Cloud Healthcare API)

## Community

Suggestions, feature requests, and contributions are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.
```

**AFTER:**
```markdown
## Overview

This roadmap is derived from the [audit output](https://github.com/awbx/fhir-dsl/tree/main/audit/output) — specifically [`missing-features.md`](https://github.com/awbx/fhir-dsl/blob/main/audit/output/missing-features.md), which ranks each gap by user impact / implementation cost. Items land in approximate priority order; nothing here is guaranteed until it ships. Bugs are tracked separately in [`bugs.md`](https://github.com/awbx/fhir-dsl/blob/main/audit/output/bugs.md).

## Priority 1 — immediate

1. **`AbortSignal` threaded into `fetch()`** — today `.stream()` checks the signal between pages only; in-flight requests are uncancellable. (REST.5)
2. **Retry policy** — 429/503 with `Retry-After`, capped exponential backoff, jitter on 5xx. (REST.6)
3. **FHIRPath arithmetic operators** — `+`, `-`, `*`, `/`, `div`, `mod`, `&`. Unblocks FHIRPath-in-constraints use cases. (FP.12)
4. **Strict-mode FHIRPath evaluator** — `evaluate(expr, { strict: true })` raises on §4.5 singleton-evaluation violations. Default remains lenient (matches HAPI/fhirpath.js/Firely). (FP.1a)
5. **Operations framework** — `client.$validate`, `client.$everything`, `client.$expand`, `client.$lookup`, `client.$translate`, plus a generic `client.operation(name, scope, params?)` escape hatch. (REST.15)
   - *Docs-side follow-up:* disambiguate `.validate()` (client-side Ajv) from `$validate` (server-side) in README and [validation guide](./guides/validation.md).

## Priority 2 — strong user impact

6. **Conditional headers** — `If-Match`, `If-None-Exist`, `If-None-Match`, `If-Modified-Since`. Depends on response-header read-back landing first (BUG-021). (REST.10)
7. **Direct `client.create/update/delete/patch`** — remove the forced wrapping in `transaction()` for single-resource mutations. (REST.13)
8. **PATCH verb** — JSON Patch, XML Patch, FHIRPath Patch content types. (REST.12)
9. **`Prefer` header plumbing** — `return=minimal/representation/OperationOutcome`, `handling=strict/lenient`, `respond-async`. (REST.9)
10. **FHIRPath environment variables** — `%context`, `%resource`, `%rootResource`, `%ucum`, `%vs-*`, `%ext-*`, `$index`, `$total`. Required for real-world profile constraint evaluation. (FP.12)
11. **FHIRPath FHIR-specific functions** — `extension(url)`, `resolve()`, `hasValue()`, `getValue()`, `htmlChecks()`. Depends on env vars. (FP.12)

## Priority 3 — narrower or low-cost

12. **Unicode NFC normalization** at string-op boundaries. (FP.10)
13. **`history()` / `vread()` / `capabilities()`**. (REST.14)
14. **Async pattern** — `Prefer: respond-async`, 202 Accepted polling, `Content-Location`. Applies to bulk data and long-running operations. (REST.16)
15. **`:type` modifier** on reference params. (SRCH.6)
16. **System-level / history-level search URLs**. (SRCH.12)
17. **Choice types in search** beyond boolean-only. (SRCH.13)
18. **Slicing in the generator** (US Core `identifier:MRN`, etc.). (GEN.1 — out of debate scope, tracked in AUDIT.md §4)
19. **`_field` primitive-extension siblings**. (FP.9 / GEN.3)
20. **`aggregate()` and STU aggregates** (`sum`, `min`, `max`, `avg`). (FP.12)

## Ecosystem and tooling (no priority rank — bandwidth-dependent)

- **Middleware / interceptors** — Hook into request/response pipeline for logging, metrics, custom retry policies.
- **Watch mode** — Re-generate types when StructureDefinitions change.
- **Custom profiles** — Generate types from your own StructureDefinitions.
- **Incremental generation** — Only regenerate changed resources.
- **React hooks** — `useFhirSearch`, `useFhirRead`.
- **Adapter packages** — HAPI, Azure Health Data Services, Google Cloud Healthcare API.

## Community

Suggestions, feature requests, and contributions are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.

---

## Roadmap reconciliation (how this differs from earlier drafts)

The previous roadmap listed `$everything` and `$validate` as separate items; they're now rolled into the single Priority-1 **operations framework** item, which also covers `$expand`, `$lookup`, `$translate`, and future operations via a generic builder. Priority 1 additionally surfaces `AbortSignal` and retry policy, which were not previously called out despite being the highest impact-to-cost items per the [missing-features ranking](https://github.com/awbx/fhir-dsl/blob/main/audit/output/missing-features.md). Middleware is demoted from Developer Experience into the ecosystem bucket since the retry policy (Priority 1) subsumes its most commonly-requested use case. "Extension support" (from the old Code Generation section) is tracked as **slicing** (GEN.1) and **`_field` primitive extensions** (GEN.3) in Priority 3 — the old item was vague.
```

**Rationale.** Per task #18 description, "reconcile against the team's prioritized Missing-Features list. If the team-ranked priority differs from the current roadmap, say so." The current roadmap's top-billing (`$everything`) is Priority-1-bundle-item-5, not the #1 slot. The team-ranked #1 (AbortSignal) is absent from the current roadmap entirely.

---

## Target 5 — `apps/docs/docs/cli/usage.md`

**Bug/finding basis:** None. `--strict-extensible`, `--validator native|zod`, `--resources`, `--src`, `--cache`, `--version` — no audit findings impact CLI docs. Generator findings (slicing, `_field` siblings) are roadmap items but do not change CLI surface behavior.

**Proposal.** **No change.** The CLI usage page correctly documents the flags that exist. When slicing (GEN.1) lands it will likely add flags, at which point this page needs an update — but not today.

---

## Target 6 — `apps/docs/docs/intro.md`

**Bug/finding basis:** None beyond the already-proposed README changes; intro.md mirrors the README pitch.

**Proposal.** **No change today.** The intro page's Key Benefits list is factually accurate (type safety, profile narrowing, code gen, immutable builders, zero deps, dual ESM/CJS) and doesn't repeat the specific FHIRPath-coverage claim that README currently overstates. If the maintainer applies the README Change 1 (FHIRPath coverage wording), consider mirroring it here IF this page acquires a FHIRPath section; for now, no claim to reconcile.

---

## Summary of what's proposed

| Page | Change count | Highest-impact change |
|---|---:|---|
| `fhirpath/overview.md` | 1 (rewrite §Coverage) | Replace "~85% of the spec" with rule-count table + "Known spec gaps" subsection |
| `core-concepts/dsl-syntax.md` | 4 (2 caveats, 1 correction, 1 optional caveat) | Correct the false claim "the builder URL-encodes embedded commas" (BUG-003) |
| `guides/validation.md` | 1 (callout) | Disambiguate `.validate()` (client-side) from FHIR `$validate` (server-side) per REST.15 |
| `roadmap.md` | 1 (full rewrite) | Align with `missing-features.md` Priority 1/2/3 structure |
| `cli/usage.md` | 0 | No change needed |
| `intro.md` | 0 | No change needed |

Total: **7 distinct edits across 4 pages** (no additions to 2 pages).

---

## Apply order

If the maintainer accepts these diffs, the lowest-risk application order is:

1. `guides/validation.md` (Change 3.1) — standalone callout, no dependencies.
2. `core-concepts/dsl-syntax.md` (Changes 2.1 → 2.4) — corrections + callouts.
3. `fhirpath/overview.md` (Change 1.1) — large coverage-section rewrite.
4. `roadmap.md` (Change 4.1) — full file rewrite.

Each change in isolation is rollback-safe (docs-only).
