# README.md — Suggested Updates (Proposal, Not Applied)

**Status:** PROPOSAL for maintainer review. **Do not** apply mechanically.

**Why this exists.** The audit team's rule-count coverage matrix disagrees with a specific marketing claim in README.md, and the new bug ledger introduces disambiguations users need to know. Per task #17 rules, docs-engineer does NOT edit `README.md` directly.

**Scope.** Only changes that affect **accuracy** of claims users read to evaluate the library. Stylistic rewrites are out of scope.

---

## Change 1 — FHIRPath marketing claim

**README.md:18** currently reads:

> **FHIRPath expression builder** — Type-safe FHIRPath expressions with autocomplete, compilation to FHIRPath strings, and runtime evaluation. Covers the core of the FHIRPath N1 spec (60+ functions across navigation, filtering, subsetting, combining, conversions, strings, math, existence, boolean logic, type operators, tree navigation, and utility). See [AUDIT.md](./AUDIT.md) for the current spec-coverage breakdown and known gaps (arithmetic operators, environment variables, `extension()` / `resolve()`).

**Issues:**
1. "60+ functions" — the count includes functions present but incorrect (e.g. `toDateTime` uses `Date.parse` and is incorrect per §5.5.5; `ofType` duck-matches across non-disjoint types). Presenting these as "covered" misleads.
2. "Covers the core" — misleading given rule-count coverage is **23.9%** (38/159 atomic rules) per `audit/output/spec-coverage-matrix.md`. The spread is extreme: boolean logic 100%, arithmetic 0%.
3. "known gaps (arithmetic operators, environment variables, `extension()` / `resolve()`)" — incomplete. Also missing: string-equivalence operators `~`/`!~`, `aggregate()`, `$index`/`$total`, Quantity equality, full date/time arithmetic, most FHIR-specific functions.

**Proposal.** Replace with a factually tight version that points to the audit output:

> **FHIRPath expression builder** — Type-safe FHIRPath expressions with autocomplete, compilation to FHIRPath strings, and runtime evaluation. **Current coverage: ~24% of the FHIRPath N1 spec by rule count (38 of 159 atomic rules IMPLEMENTED)**, with strong coverage in navigation, subsetting, existence, and boolean logic, and active gaps in arithmetic, environment variables, equivalence, aggregates, and FHIR-specific functions (`extension()`, `resolve()`, `hasValue()`, `memberOf()`). See [AUDIT.md](./AUDIT.md) and [`audit/output/spec-coverage-matrix.md`](./audit/output/spec-coverage-matrix.md) for per-category breakdown and the [`audit/output/bugs.md`](./audit/output/bugs.md) ledger for known correctness defects (notably: `=` on multi-element operands silently picks the first, `Observation.value` returns empty without `value[x]` expansion, NFC-normalization not applied to string comparisons).

**Rationale.** Matches spec-coverage-matrix.md and bugs.md. Honest framing invites users to consume the library with correct expectations rather than discovering gaps at runtime. Alternative (shorter) wording if the maintainer wants to keep it tight:

> **FHIRPath expression builder** — Type-safe FHIRPath expressions with autocomplete and runtime evaluation. Coverage varies by category; see [AUDIT.md](./AUDIT.md) for the rule-count breakdown and known gaps.

---

## Change 2 — Disambiguate `.validate()` vs. FHIR `$validate`

**Context.** Per debate row REST.15, the DSL keeps `.validate()` for client-side Ajv schema validation. Server-side `$validate` will land on a separate surface (`client.$validate(...)`). Users coming from FHIR server contexts routinely conflate these; README currently offers no disambiguation.

**README.md:21** currently reads:

> **Runtime validation (optional)** — Opt in with `--validator native|zod` to emit [Standard Schema V1](https://standardschema.dev/) validators for every resource, datatype, binding, and profile. See [Validation](https://awbx.github.io/fhir-dsl/docs/guides/validation).

**Proposal.** Append a parenthetical that marks the scope of `.validate()` unambiguously:

> **Runtime validation (optional)** — Opt in with `--validator native|zod` to emit [Standard Schema V1](https://standardschema.dev/) validators for every resource, datatype, binding, and profile. **This is client-side schema validation only; it is not the FHIR `$validate` operation. Server-side `$validate` (which runs profile/constraint/terminology checks against a FHIR endpoint) is tracked in the roadmap as `client.$validate(...)`.** See [Validation](https://awbx.github.io/fhir-dsl/docs/guides/validation).

**Rationale.** Decisions.md REST.15 ruling (dsl-explorer verbatim): the docs callout disambiguates at lower cost than an API break. Mirrored in `apps/docs/docs/guides/validation.md` via task #18.

---

## Change 3 — Flag the known search-URL escape bug in the relevant section

**Context.** BUG-003 (escape family) breaks any query where a value contains `,`, `$`, `|`, or `\`. It's the single most likely way a README reader will get incorrect results on their first real workload. The current README showcases search extensively (lines 76-121) without any caveat.

**README.md:192** (the "Search Parameter Operators" section heading):

**Proposal.** Add a single caveat line at README.md:192, just after the section title:

> **Known gap:** Literal `,`, `$`, `|`, and `\` characters in parameter values are NOT escaped per FHIR §3.2.1.5.7 today — a value like `"O'Brien, Jr."` will be parsed by the server as an OR of three names. Tracked as BUG-003; fix planned alongside the search-escape helper. Safe workaround: substitute separator characters in values before passing them in.

**Rationale.** Surfacing known bugs near the code that would exercise them is table-stakes honest-docs practice. Shorter alternative: link to `audit/output/bugs.md#bug-003` without the workaround — depends on maintainer preference for inline vs. follow-link.

---

## Change 4 — Noted for future update (NO README change today)

The following bugs are confirmed blockers per debate but do not require README updates at this time because the README does not demonstrate the affected surface:

- **BUG-004 (204 DELETE crash)** — DELETE is not shown in README Quick Start. No inline caveat needed.
- **BUG-005 (Auth leak on pagination)** — `.stream()` is not shown in README. No inline caveat needed.
- **BUG-011 (transaction `fullUrl`)** — README shows transactions at lines 169-188 but doesn't demonstrate cross-entry references. Could add a callout once a user-facing workaround exists; defer.

These will be revisited when the fixes land and the Quick Start examples can safely demonstrate the previously-broken surfaces.

---

## Changes NOT recommended

- **Shift the "Why fhir-dsl?" pitch.** The value prop (type-safe FHIR queries) stands. Bugs don't invalidate it; they make the accuracy-of-claims fixes above necessary.
- **Change the "Features" list.** Apart from Change 1 (FHIRPath claim) and Change 2 (Validation disambiguation), the bullets are factually fine.
- **Change the "Supported FHIR Versions" table.** No new findings affect it.
- **Change any code sample.** All samples in the README compile and run correctly — they don't hit any of the confirmed bugs.

---

## Apply order

If the maintainer accepts these diffs:
1. Apply Change 1 (FHIRPath marketing claim) at README.md:18.
2. Apply Change 2 (Validation disambiguation) at README.md:21.
3. Apply Change 3 (Search escape caveat) at README.md:192.
4. Bump the README last-reviewed date if one exists (currently none).

Total change: 3 line-level edits, ~5 new lines of content net.
