# v1.0.0 — what's stable

This is the hand-curated v1.0.0 summary. The auto-generated commit log
lives in `CHANGELOG.md`; this file is the narrative version.

## What v1 is

v1.0.0 is a **stability commitment**, not a feature ship. Every public
export listed in `.surface-snapshot.json` is now governed by semantic
versioning: minor releases add to this surface, patch releases fix
bugs in it, major releases (v2+) are the only place breaking changes
land. The export-surface CI gate makes accidental breakage detectable
in PRs before they merge.

The 0.x line shipped 56 minors over 8 weeks; the goal of v1 is to draw
a line under that velocity and trade some of it for predictability.

## Surface highlights at v1.0.0

```
@fhir-dsl/types         R4 + R4B + R5 + R6 generated types, search params,
                        ConceptMap-aware Reference<T> narrowing
@fhir-dsl/core          query builder, batch/transaction, conditional
                        ops, retries, AbortSignal, JSON-Patch + xml-patch
                        + fhirpath-patch, capability guard, Bundle
                        reference resolution, _include/_revinclude
@fhir-dsl/fhirpath      ~85% of FHIRPath N1 spec (60+ functions),
                        compiled invariants → OperationOutcome,
                        setValue / createPatch (RFC 6902)
@fhir-dsl/runtime       executor with retries, async-polling, layered
                        Foundation/Base/Clinical/Financial/Specialized
                        access patterns
@fhir-dsl/smart         SMART on FHIR v2 — PKCE-S256, backend services,
                        scope DSL, refresh-token rotation
@fhir-dsl/terminology   $expand, $validate-code, $lookup, $translate
                        with caching
@fhir-dsl/mcp           MCP server scaffold with stdio + Streamable HTTP
                        transports, batched JSON-RPC, audit sinks,
                        write gating, response-byte cap, all four
                        SMART auth strategies
@fhir-dsl/generator     StructureDefinition → TS, native + zod
                        validators, per-property invariants,
                        slicing-aware narrowing
@fhir-dsl/cli           fhir-gen generate / mcp commands
@fhir-dsl/utils         OperationOutcome helpers, retry helpers,
                        Standard Schema bridges
```

## Highlights by theme since v0.30.0 (the Phase 5 baseline)

### Streamable HTTP MCP transport
v0.51.0 finished the Streamable HTTP spec end-to-end: POST → JSON,
POST → SSE, GET → server-initiated SSE stream, batched JSON-RPC arrays.
The framing is now observable for clients; later releases can rely on
it.

### Per-property invariants
v0.52.0 wired `ElementDefinition.constraint[*]` at any nesting level
into `s.refine()` (native) / `.superRefine()` (zod) wrappers.
Previously only root + backbone constraints flowed; now deep nested
constraints do too. Generator filters out the trivial inherited `ele-1`
to avoid bloat.

### FHIRPath setValue / createPatch (#50)
v0.53.0 added typed write-back through any FHIRPath builder leaf.
`setValue` returns a deep-cloned resource with the path updated;
`createPatch` returns the equivalent RFC 6902 patch document. The
where()-shaped predicates are inverted into partial templates so the
setter can create missing intermediate objects (e.g. seeding
`name[]` with `{ use: "official" }` when the array is missing).

### Coverage gaps documented
v0.54.0 made the boundaries explicit: UCUM (issue #51) and the
unimplemented FHIRPath functions (issue #52) are scope-frozen for v1
with positive pin tests so they break loudly when implementations land.

### Surface freeze
v0.55.0 confirmed via export-surface diff against v0.30.0 that no
public exports were removed or renamed across the entire 0.5x line —
the surface has been additive-only. No `@deprecated` aliases needed.

### Performance baseline
v0.56.0 captured `audit/perf-baseline.md`: generator end-to-end at
221 ms, 1000-resource Bundle validation at 1.7 ms, FHIRPath 10k iters
at 5.8 ms — all 50× or more under the originally targeted budgets.

## Known limitations carried into v1

- **UCUM-aware quantity ops are not implemented.** Raw unit-string
  equality only. Normalise units upstream of FHIRPath, or use the
  pin in `packages/fhirpath/test/spec-gaps.test.ts` as a probe.
  Native UCUM is tracked as #51.
- **A few FHIRPath spec functions throw at evaluate time.**
  `resolve()`, `extension(url)` (full StructureDefinition form),
  `descendants()`, `repeat()`, and the terminology-bound functions
  (`conformsTo`, `memberOf`, `subsumes`, `subsumedBy`). They compile
  to a valid expression string and round-trip through external
  evaluators. Tracked as #52.

## Out for v1, in for v2

Documented up front so they don't bleed scope:

- React adapter (`@fhir-dsl/react`) — needs the query-builder API to
  be frozen first, which is what v1 is for.
- Server adapter packages (HAPI / Azure Health Data Services / Google
  Cloud Healthcare) — same reason.
- Generator watch mode and incremental generation — convenient, not
  a stability blocker.
- Middleware / interceptor pipeline on the runtime executor — adding
  it to the request flow is a v2 design pass.
- Native UCUM evaluator (#51).
- The remaining FHIRPath spec functions (#52).
