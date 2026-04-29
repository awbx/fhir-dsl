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
2. **Borrow what's better elsewhere** — bounded swaps from the
   atomic-ehr ecosystem; net code reduction or pure additions.
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

### 1.1 Phase 8 streamable HTTP — finish the spec

Today's `httpTransport()` only handles POST → single JSON response.
Spec compliance for "Streamable HTTP" needs:

- [ ] GET `/mcp` opens an SSE stream for server-initiated notifications.
- [ ] `text/event-stream` response when the dispatcher emits multiple
      messages (currently it doesn't, but the framing should land
      before v1 ships so it's not a breaking change later).
- [ ] Batched JSON-RPC arrays accepted on POST.

**Cost.** S — ~150 LoC across `transports/http.ts`.
**Why now.** Adding SSE later means changing the response
`Content-Type` heuristic, which is observable. Better in pre-1.0.

### 1.2 Per-property invariants (Phase 6 deeper)

Phase 6 follow-up (v0.49.0) wires invariants on root + backbone
elements. Per-property invariants (e.g. `Identifier.value` constraints)
flow into the same `s.refine()` machinery but the parser only walks the
top two levels today.

- [ ] Extend `parseStructureDefinition` to thread invariants down the
      property tree.
- [ ] Schema emitter wraps individual property schemas (not just the
      object) when their `ElementDefinition.constraint[*]` is present.
- [ ] Skip if it costs >10% on validator generation time.

**Cost.** M — ~200 LoC, mostly tree-walking + tests.

---

## Theme 2 — Borrow from atomic-ehr

Three takeaways surfaced by the cross-org compare. Two are clear wins;
the third is a deliberate non-adoption.

### 2.1 UCUM integration — `@atomic-ehr/ucum`

**Gap.** FHIR `Quantity` arithmetic and the `code-value-quantity`
composite-search-param normalizer treat `5 'kg'` and `5000 'g'` as
unequal. Silent correctness bug.

- [ ] Add `@atomic-ehr/ucum` as an optional peer dep on
      `@fhir-dsl/fhirpath`.
- [ ] Wire into FHIRPath quantity comparison (`=`, `~`, `<`, `>`).
- [ ] Wire into FHIRPath quantity arithmetic (`+`, `-`).
- [ ] Wire into core's composite-search normalizer.
- [ ] Test fixture: `5 kg = 5000 g`, `1 'L' = 1000 'mL'`.

**Cost.** S — half a day. Highest value/lowest risk swap in this plan.

### 2.2 `@atomic-ehr/fhir-canonical-manager` — replace downloader

**Gap.** `packages/generator/src/downloader.ts` rolls its own tgz
fetch, registry resolution, and canonical lookup. ~200 LoC of code we
don't need to maintain when their `fcm` package handles the same
problem with disk caching and registry redirects already.

- [ ] Add `@atomic-ehr/fhir-canonical-manager` as runtime dep on
      `@fhir-dsl/generator`.
- [ ] Verify license compatibility (likely MIT — confirm before
      adopting).
- [ ] Adapt `DownloadedSpec` shape from `fcm`'s output via a thin
      shim.
- [ ] Delete `downloader.ts` (modulo the `--src` local-dir path,
      which stays).
- [ ] Smoke test: `pnpm --filter @fhir-dsl/example generate` still
      produces an identical tree.

**Cost.** S/M — half a day plus the shape-mismatch surprise tax.

### 2.3 FHIRPath evaluator — DON'T swap (decision)

Their `@atomic-ehr/fhirpath` is async and broader-spec; ours is sync
and narrower. Adopting their evaluator would force a public API break
across `@fhir-dsl/fhirpath` (every `evaluate()` becomes async). Our
differentiator is the typed builder, not the evaluator internals.

- [ ] Document the decision in the package README so it's not
      revisited every quarter.

---

## Theme 3 — Open issue triage

Repo state: 3 open issues at v1 plan time.

### 3.1 #50 — FHIRPath setValue / patch via builder

User-driven feature. The builder already encodes a typed path; setting
a value through that path (creating intermediate nodes per `where()`
restrictions) is genuinely useful and has no equivalent in atomic-ehr's
fhirpath.

- [ ] Design `PathEvaluator<R, V>` interface from the issue body:
      `getValue()`, `setValue()`, `createPatch()`.
- [ ] Implement `setValue` for the simple navigation subset (`a.b.c`).
- [ ] Implement `setValue` through `where()` predicates — create
      missing intermediate objects matching the predicate constraints.
- [ ] Emit FHIR JSON Patch via `createPatch()` (Phase 7-style
      surface).
- [ ] Test fixture matches the issue's example.

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

- **The atomic-ehr swaps add upstream risk.** Their packages are still
  pre-1.0; we'd be pinning to versions whose APIs may shift. Mitigate
  by exact-version pinning in `package.json` until they cut their own
  1.0.
- **#50 setValue is the largest scope in this plan.** If it slips,
  ship v1 without it (move to v1.1) rather than holding the freeze.

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
| v0.51.0 | 2.1 | UCUM integration |
| v0.52.0 | 2.2 | `fhir-canonical-manager` swap |
| v0.53.0 | 1.1 | Streamable HTTP — SSE + batched JSON-RPC |
| v0.54.0 | 3.1 | FHIRPath setValue / patch (#50) |
| v0.55.0 | 1.2 | Per-property invariants |
| v0.56.0 | 4.1 + 4.3 | Deprecation pass + docs parity |
| v0.57.0 | 4.2 + 4.4 | Perf baseline + hand-written changelog |
| v1.0.0  |  | API freeze. Tag `surface-v1.0.0` from the locked snapshot. |

Each version is independently mergeable. Order is suggested, not
required — anything can slip without blocking the rest.
