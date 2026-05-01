---
id: roadmap
title: Roadmap
sidebar_label: Roadmap
---

# Roadmap

**v1.0.0 shipped on 2026-05-01.** The public surface across all 10 packages is locked at the [`surface-v1.0.0`](https://github.com/awbx/fhir-dsl/releases/tag/surface-v1.0.0) tag — minor releases add to it, patch releases fix bugs in it, and breaking changes wait for v2.

The full v1 plan is preserved in [`V1_PLAN.md`](https://github.com/awbx/fhir-dsl/blob/main/V1_PLAN.md) for the historical record. The narrative summary lives in [`audit/v1-changelog.md`](https://github.com/awbx/fhir-dsl/blob/main/audit/v1-changelog.md).

## Shipped on the v1.x line

- **v1.0.0 — API freeze.** Surface contract locked. 1666 tests passing, lint/typecheck clean across all 10 packages, performance baseline captured in `audit/perf-baseline.md`.
- **v1.0.1 — Issue cleanup.**
  - Boolean-choice token search params (e.g. `Patient.deceased`) narrow to `TokenParam<"true" | "false">` ([#45](https://github.com/awbx/fhir-dsl/issues/45)).
  - Profile slices that point at a generated typed extension (e.g. `extension_race`) emit the typed shape (`USCoreRaceExtension`) instead of bare `Extension` ([#46](https://github.com/awbx/fhir-dsl/issues/46)).
- **v1.1.0 — UCUM + FHIRPath terminology hooks.**
  - Native UCUM core ([#51](https://github.com/awbx/fhir-dsl/issues/51)). Same-dimension `Quantity` equality, ordering, and conversion are now spec-correct: `5 'mg' = 0.005 'g'` returns `true`. SI base units + prefixes, common healthcare units (mmHg, mmol/L, mg/dL, IU…), single-`/` compounds, and the bracketed `mm[Hg]` form. Offset / log units throw `UcumError` instead of producing silent wrong answers.
  - `EvalOptions.resolveReference` ([#52](https://github.com/awbx/fhir-dsl/issues/52)) — non-Bundle `resolve()` now consults a synchronous resolver hook.
  - `EvalOptions.terminology` ([#52](https://github.com/awbx/fhir-dsl/issues/52)) — `conformsTo` / `memberOf` / `subsumes` / `subsumedBy` compile to spec-correct FHIRPath strings and call the supplied resolver at evaluate time. Missing methods throw `FhirPathEvaluationError` with a clear message naming the option field to populate.
- **v1.2.0 — Unified error handling.** `FhirDslError` abstract base in `@fhir-dsl/utils` with a `kind` discriminator, structured `context`, ES2022 `cause` chain, and `toJSON()` for transport-safe serialisation. All 14 domain error classes across core / runtime / fhirpath / smart now extend it — bit-perfect back-compat on existing fields. Plus a `Result<T, E>` + `tryAsync` / `trySync` / `mapErr` / `match` toolkit for callers who want Effect-style typed handling without `try`/`catch`. See the [error-handling guide](./guides/error-handling.md).

## What's stable

Every public export listed in `.surface-snapshot.json` is governed by semver. The CI gate (`pnpm audit:export-surface:check`) blocks accidental drift on every PR.

```
@fhir-dsl/types         R4 + R4B + R5 + R6 generated types, search params,
                        ConceptMap-aware Reference<T> narrowing
@fhir-dsl/core          query builder, batch/transaction, conditional
                        ops, retries, AbortSignal, JSON-Patch +
                        xml-patch + fhirpath-patch, Bundle reference
                        resolution, _include / _revinclude
@fhir-dsl/fhirpath      ~85% of FHIRPath N1 spec, native UCUM,
                        terminology hooks, setValue / createPatch
@fhir-dsl/runtime       executor with retries, async-polling, layered
                        Foundation / Base / Clinical / Financial /
                        Specialized access
@fhir-dsl/smart         SMART on FHIR v2 — PKCE-S256, backend services,
                        scope DSL, refresh-token rotation
@fhir-dsl/terminology   $expand, $validate-code, $lookup, $translate
@fhir-dsl/mcp           MCP server with stdio + Streamable HTTP
                        transports, batched JSON-RPC, audit sinks,
                        write gating
@fhir-dsl/generator     StructureDefinition → TS, native + zod
                        validators, per-property invariants, slicing
@fhir-dsl/cli           fhir-gen generate / mcp commands
@fhir-dsl/utils         FhirDslError + Result toolkit, naming helpers,
                        leveled logger, search-param type mapping
```

## Out of scope for v1, in scope for v2

Documented up front so they don't bleed scope:

- **React adapter** (`@fhir-dsl/react`). The query-builder API freeze is the prerequisite, and v1 is that freeze.
- **Server adapter packages** for HAPI, Azure Health Data Services, Google Cloud Healthcare API. Same reason.
- **Generator watch / incremental modes**. Convenient, not a stability blocker.
- **Middleware / interceptor pipeline** on the runtime executor. Real feature, but adding it changes the request flow — better as a v2 design pass than a pre-freeze rush.
- **Multi-`/` UCUM compound expressions** like `mol/(L.s)`. The single-`/` parser covers every healthcare case we've seen; multi-factor compounds are tracked when a real expression hits the floor.
- **Offset / log units** in UCUM (Celsius, Fahrenheit, pH, decibel). These throw `UcumError` today; a future release may add explicit conversion helpers if there's demand.

## How priorities get set

Issues with reproductions move first. Issues with workarounds trail. Issues that name "ergonomics" without a concrete failing case need a maintainer to upgrade them with one before they move at all.

The export-surface CI gate blocks any breaking change to a `1.x` minor; if you find yourself wanting one, open an issue tagged `v2-breaking` with the proposed signature so it's queued for a future major.

## Community

Bug reports and feature requests welcome. The fastest path is a failing test in a fork plus a one-paragraph "what I expected, what I got" — issues with reproductions usually move within the same week.
