---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

The 0.x line is feature-complete against the original FHIR-compliance plan — every Phase 0–8 row is shipped as of v0.50.0. The next milestone is **v1.0.0**, which is framed as a stability commitment (API freeze + semver discipline) rather than a feature ship.

The full plan lives in [`V1_PLAN.md`](https://github.com/awbx/fhir-dsl/blob/main/V1_PLAN.md). Highlights below.

## Towards v1.0.0

### Cleanups landing before the freeze

- **Streamable HTTP — finish the spec.** Today's `httpTransport()` only handles POST → single JSON response. SSE on GET (for server-initiated notifications), `text/event-stream` responses, and batched JSON-RPC arrays land before v1 so the framing isn't observable later.
- **Per-property invariants.** Phase 6 follow-up (v0.49.0) wires invariants on root + backbone elements; deeper-level constraints flow into the same `s.refine()` machinery.

### Known limitations to document loudly before the freeze

- **UCUM-aware quantity ops are deferred to post-v1.** `5 'kg' = 5000 'g'` returns `false` today, FHIRPath quantity arithmetic returns empty, and `<`/`>` cast through `NaN`. A correct in-house UCUM implementation is ~2-3KLoC and out of scope for the v1 freeze; we'll document the gap and ship a v2 that addresses it driven by real user-reported failures rather than speculation.
- **The FHIRPath evaluator covers a subset of N1.** The supported surface is the patterns FHIR invariants and common navigation actually use. The boundary will be documented in `packages/fhirpath/README.md` before the freeze so users know when to file a missing-feature ticket vs. choose a different evaluator.

### One open feature ask

- **FHIRPath `setValue()` / `createPatch()`** ([#50](https://github.com/awbx/fhir-dsl/issues/50)) — write through a typed FHIRPath builder back to a resource (or emit a JSON Patch), creating intermediate nodes per `where()` predicates.

### Stability scaffolding

- Deprecation pass with `@deprecated` tags + console warnings.
- Performance baseline (generator under 30s on R4 + US Core; 1k-resource Bundle under 100ms parse+validate; FHIRPath 10k iters under 500ms).
- Documentation parity between README, generated TSDoc, and this docs site.
- Hand-written v1.0.0 changelog entry.

## Out of scope for v1, in scope for v2

Documented up front so they don't bleed scope:

- **React adapter** (`@fhir-dsl/react`). Useful, but the query builder API must freeze first.
- **Server adapter packages** for HAPI, Azure Health Data Services, Google Cloud Healthcare API. Same reason.
- **Generator watch / incremental modes**. Convenient, not a stability blocker.
- **Middleware/interceptor pipeline** on the runtime executor. Real feature, but adding it changes the request flow — better as a v2 design pass than a pre-freeze rush.

## Community

Suggestions, feature requests, and bug reports are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.
