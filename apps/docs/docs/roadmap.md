---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

The 0.x line is feature-complete against the original FHIR-compliance plan — every Phase 0–8 row is shipped as of v0.50.0. The next milestone is **v1.0.0**, which is framed as a stability commitment (API freeze + semver discipline) rather than a feature ship.

The full plan lives in [`V1_PLAN.md`](https://github.com/awbx/fhir-dsl/blob/main/V1_PLAN.md). Highlights below.

## Towards v1.0.0

### Shipped on the v0.5x line

- **v0.51.0 — Streamable HTTP MCP transport.** `httpTransport()` now implements the spec end-to-end: POST → single JSON, POST → `text/event-stream`, GET → server-initiated SSE stream, batched JSON-RPC arrays. See the [MCP guide](./guides/mcp.md).
- **v0.52.0 — Per-property invariants.** `ElementDefinition.constraint[*]` at any nesting level (root, backbone, deep nested) now compiles into `s.refine()` wrappers around the property's own schema. See [validation](./guides/validation.md).
- **v0.53.0 — FHIRPath `setValue` / `createPatch`** ([#50](https://github.com/awbx/fhir-dsl/issues/50)). Every typed builder leaf now exposes write helpers that return a new resource (immutable) or an RFC 6902 JSON Patch document, creating intermediate nodes per `where()` predicates.
- **v0.54.0 — Coverage gaps documented.** UCUM ([#51](https://github.com/awbx/fhir-dsl/issues/51)) and the unimplemented FHIRPath functions ([#52](https://github.com/awbx/fhir-dsl/issues/52)) are scope-frozen for v1; the boundary is documented in `packages/fhirpath/README.md`.

### Known limitations carried into v1

- **UCUM-aware quantity ops are not implemented.** `5 'kg' = 5000 'g'` returns `false`. Normalise units upstream of FHIRPath. Native UCUM is tracked as [#51](https://github.com/awbx/fhir-dsl/issues/51).
- **A few FHIRPath functions compile but throw at evaluate time.** `resolve()`, `extension(url)` (full form), `descendants()`, `repeat()`, and the terminology-bound functions. Tracked as [#52](https://github.com/awbx/fhir-dsl/issues/52).

### Stability scaffolding remaining for v1

- **v0.55.0 — Deprecation pass.** Surface diff against v0.30.0 baseline shows zero removals or renames; nothing to deprecate. Doc parity sweep across README, TSDoc, and this site.
- **v0.56.0 — Performance baseline.** Generator under 30s on R4 + US Core; 1k-resource Bundle under 100ms parse+validate; FHIRPath 10k iters under 500ms. Numbers go in `audit/perf-baseline.md`.
- **v1.0.0 — API freeze.** Tag `surface-v1.0.0` from the locked snapshot.

## Out of scope for v1, in scope for v2

Documented up front so they don't bleed scope:

- **React adapter** (`@fhir-dsl/react`). Useful, but the query builder API must freeze first.
- **Server adapter packages** for HAPI, Azure Health Data Services, Google Cloud Healthcare API. Same reason.
- **Generator watch / incremental modes**. Convenient, not a stability blocker.
- **Middleware/interceptor pipeline** on the runtime executor. Real feature, but adding it changes the request flow — better as a v2 design pass than a pre-freeze rush.

## Community

Suggestions, feature requests, and bug reports are welcome. Open an issue on GitHub to propose new features or discuss architectural changes.
