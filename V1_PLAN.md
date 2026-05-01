# v1.0.0 Plan

The 0.x line is feature-complete against the FHIR-compliance plan
(see `FHIR_COMPLIANCE_PLAN.md` — every Phase 0–8 row in the shipped
table is `[x]` as of v0.50.0). v1.0.0 is a **stability commitment**,
not a feature ship: API freeze, semver discipline, and the small set
of cleanups that should land before the freeze takes effect.

## What v1 means

- **API freeze.** Every `export` from every public package is locked.
  `audit:export-surface` already protects against accidental drift;
  v1 makes that promise to consumers, not just to ourselves.
- **Semver discipline post-v1.** Breaking changes go through a deprecation
  cycle (one minor with `@deprecated` + a console warning), then land
  in the next major.
- **Documentation parity.** Every public symbol referenced in the
  spec-coverage table has either generated TSDoc or a docs page entry.

## Themes (and the order they should land)

1. **Cleanups before freeze** — gaps the audit caught that should not
   ship in v1 untouched.
2. **Self-built coverage gaps** — capabilities other libraries solve
   (UCUM, canonical resolution) that we'd previously considered
   borrowing; **dropping third-party deps as a hard rule**, so each
   either gets a bounded in-house implementation or ships post-v1.
3. **Open issues triage** — the 3 issues that survived the close-out
   sweep get a decision per item.
4. **Pre-v1 polish** — stability scaffolding (deprecations, perf
   smoke, docs sync).
5. **Out for v1, in for v2** — explicitly deferred.

---

## Theme 1 — Cleanups before freeze

These are the items the previous audit-pass already filed as issues but
flagged as defensive or low-priority. Re-evaluating them with v1 in
mind: a few should ship, a few stay deferred. None require new design.

### 1.1 Phase 8 streamable HTTP — finish the spec ✅ shipped v0.51.0

`httpTransport()` now matches the full Streamable HTTP shape from the
MCP spec:

- [x] GET `/mcp` opens an SSE stream for server-initiated notifications
      (keepalive-only today; framing in place for future producers).
- [x] `text/event-stream` response on POST when the client sends
      `Accept: text/event-stream`.
- [x] Batched JSON-RPC arrays accepted on POST; per-entry errors
      preserved with the right `id`.

### 1.2 Per-property invariants (Phase 6 deeper) ✅ shipped v0.52.0

- [x] Extended the parser to extract property-level
      `ElementDefinition.constraint[*]` (filtering trivially-inherited
      `ele-1` so generated output isn't bloated by universal Element
      constraints we already enforce structurally).
- [x] New `refine` schema-AST node wraps the property's computed schema
      so the predicate evaluates against the property *value* rather
      than the parent resource. Both zod and native adapters render it.
- [x] Per-property and resource-level invariants compose: a property
      with its own constraint sits inside the parent's `s.refine` call.

---

## Theme 2 — Self-built coverage gaps

**Decision (2026-04-29):** we will not adopt third-party packages
from atomic-ehr (or any other org) as runtime deps. Their projects
are pre-1.0, scope overlap is partial, and the typed-FHIR-client niche
is small enough that pinning to an upstream's release cadence costs
more than it saves. Every gap below ships in-house or is deferred.

### 2.1 UCUM-aware FHIRPath quantity ops

**Gap.** FHIR `Quantity` equality, ordering, and arithmetic are
spec-defined to be UCUM-aware. Today `5 'kg' = 5000 'g'` returns
`false` (property equality), `<`/`>` cast to `NaN`, and `+`/`-`
return empty. Silent correctness bug in invariants and FHIRPath
evaluation.

**Decision: deferred to post-v1.** A correct UCUM implementation —
parser for `mol/(L.s).cm-1` style expressions, dimension algebra,
prefix normalization, special-unit (Celsius, decibel, pH) handling —
is ~2-3KLoC of careful code. Out of scope for the v1 freeze. Track
as a known limitation:

- [ ] Document the gap in `packages/fhirpath/README.md` so callers
      know not to rely on UCUM-aware quantity semantics.
- [ ] Add an explicit `it.skip` test pinning current behaviour so a
      future implementation breaks loudly.
- [ ] Open a v2 issue: "Native UCUM expression evaluator".

### 2.2 Canonical / package resolution

**Gap.** `packages/generator/src/downloader.ts` does its own tgz
fetch and registry resolution. It works, but registry edge cases
(redirects, mirror failover, signed packages) are not covered.

**Decision: keep our own.** It's working today. Hardening goes in v2
once we have specific user-reported failures to drive the design.

### 2.3 FHIRPath evaluator scope

We own a sync, type-safe FHIRPath evaluator that covers the subset
FHIR invariants and the common navigation patterns actually use.
Broadening to the full FHIRPath N1 spec is post-v1 work, driven by
real user expressions that fail.

- [ ] Document the supported subset and the boundary in
      `packages/fhirpath/README.md` so users know when to file a
      "missing feature" vs. when to choose a different evaluator.

---

## Theme 3 — Open issue triage

Repo state: 3 open issues at v1 plan time.

### 3.1 #50 — FHIRPath setValue / patch via builder ✅ shipped v0.53.0

User-driven feature. The builder already encodes a typed path; setting
a value through that path (creating intermediate nodes per `where()`
restrictions) is genuinely useful and has no equivalent in atomic-ehr's
fhirpath.

- [x] Wire `setValue(resource, value)` and `createPatch(resource, value)`
      onto every typed builder leaf via the proxy.
- [x] Implement `setValue` for the simple navigation subset (`a.b.c`).
- [x] Implement `setValue` through `where()` predicates — create
      missing intermediate objects matching the predicate constraints.
      Conjunctions of `eq` checks supported; `or`/`not` rejected.
- [x] Emit RFC 6902 JSON Patch via `createPatch()` with proper JSON
      Pointer escaping (`~` → `~0`, `/` → `~1`).
- [x] Test fixture matches the issue's example. Throws
      `FhirPathSetterError` on filter ops or non-invertible predicates.

**Cost.** L — 1.5 days. Real new feature surface; warrants a minor.

### 3.2 #46 — FHIRPath slicing → builder types

Generator-side. Marked P3 by the audit author. **Deferred for v1.**
The slicing parser already exists (Phase 2.1, v0.38.0); only the
FHIRPath builder narrowing is missing. Re-evaluate if a user files a
duplicate.

### 3.3 #45 — Choice types in search (non-boolean variants)

Marked P3 + "low value; defer". Affects `Patient.deceased[x]` and
similar. **Deferred for v1.** Workaround exists (cast through `as`).

---

## Theme 4 — Pre-v1 polish

### 4.1 Deprecation pass

- [ ] Run `audit:export-surface` snapshot diff against v0.30.0 (the
      "Phase 5 shipped" baseline). Anything renamed or removed without
      a deprecation alias gets one re-added with `@deprecated`.
- [ ] Add a `console.warn` shim on each `@deprecated` entry that fires
      once per process per symbol.

### 4.2 Performance smoke

- [ ] Benchmark the generator end-to-end on full R4 + US Core: target
      <30s on a clean cache.
- [ ] Benchmark a 1k-resource Bundle through `runtime.execute()`:
      target <100ms parse+validate.
- [ ] Benchmark FHIRPath evaluation on `Patient.contact[*]`: 10k
      iterations under 500ms.
- [ ] Numbers go in `audit/perf-baseline.md` so v1.x can guard against
      regression.

### 4.3 Documentation parity

- [ ] Roadmap doc (`apps/docs/docs/roadmap.md`) is stale — most
      bullets shipped. Rewrite to reflect this v1 plan.
- [ ] README spec-coverage table line 229 + line 295 still mark Phase
      6 follow-up as not-done. Already flagged earlier; folded in here.
- [ ] Generated docs page for `httpTransport()` (currently zero docs
      coverage outside source).
- [ ] Generated docs page for `validateInvariants` integration.

### 4.4 CHANGELOG curation

- [ ] The auto-generated changelog lists every commit. v1.0.0 entry
      should be hand-written: a "what's stable, what's new since the
      last minor anyone cared about" summary.

---

## Theme 5 — Out for v1, in for v2

Documented here so they don't bleed scope:

- **React adapter (`@fhir-dsl/react`).** Useful, but the API of the
  query builder must freeze first.
- **Server adapter packages** (HAPI, Azure, Google Cloud Healthcare).
  Same reason — stabilize the client surface before pinning per-server
  quirks.
- **Watch mode for the generator.** Convenient, but not a stability
  blocker.
- **Incremental generation.** Same.
- **Middleware / interceptor pipeline on the runtime.** Real feature,
  but adding it to the executor changes the request flow — better as
  v2 with a clean design pass.

---

## Risks

- **#50 setValue is the largest scope in this plan.** If it slips,
  ship v1 without it (move to v1.1) rather than holding the freeze.
- **Documenting the UCUM gap is not the same as closing it.** Users
  with quantity-heavy invariants (vital signs, lab ranges, dose
  arithmetic) will hit it. Document loudly; revisit in v2 driven by
  actual user reports rather than a speculative implementation.

## Exit criteria

- All Theme 1, 2, 3.1, and 4 checkboxes ticked.
- `audit:export-surface` snapshot has been frozen and tagged
  `surface-v1.0.0`.
- `pnpm test` / `pnpm lint` / `pnpm -r typecheck` clean on `main`
  for at least 3 consecutive commits.
- Roadmap doc rewritten; v1.0.0 hand-written changelog entry merged.

## Tentative version walk

| Version | Theme | Notes |
|---|---|---|
| v0.51.0 | 1.1 | ✅ Streamable HTTP — GET/SSE + batched JSON-RPC |
| v0.52.0 | 1.2 | ✅ Per-property invariants |
| v0.53.0 | 3.1 | ✅ FHIRPath setValue / patch (#50) |
| v0.54.0 | 2.1 + 2.3 | Document UCUM + FHIRPath-subset gaps |
| v0.55.0 | 4.1 + 4.3 | Deprecation pass + docs parity |
| v0.56.0 | 4.2 + 4.4 | Perf baseline + hand-written changelog |
| v1.0.0  |  | API freeze. Tag `surface-v1.0.0` from the locked snapshot. |

Each version is independently mergeable. Order is suggested, not
required — anything can slip without blocking the rest.
