# codex Terminology E2E Suite

## Architecture

This suite proves terminology bindings at three complementary levels:

1. `pipeline.test.ts` runs the real generator against a flat fixture bundle, checks the emitted file shapes across every binding-strength row, and compiles a real consumer with `tsc`.
2. `types.test-d.ts` imports a checked-in golden bundle and lets TypeScript verify exact narrowing, open extensible behavior, unconstrained fallback behavior, and query-builder flow.
3. `backward-compat.test.ts` regenerates the same fixture set with `expandValueSets: false` and compares the result byte-for-byte against a checked-in legacy bundle.

I chose a split runtime/type/backward-compat design because each layer catches a different failure mode:

- runtime assertions catch emitter regressions and filesystem regressions quickly
- type-level assertions prove the product promise that invalid codes fail at compile time
- byte-for-byte legacy comparison protects the flag-off invariant from accidental drift

## How To Run

Run just this suite:

```bash
pnpm vitest run packages/generator/test/e2e-agents/codex/
```

Run only the type-level checks:

```bash
pnpm vitest run --typecheck packages/generator/test/e2e-agents/codex/types.test-d.ts
```

Regenerate the checked-in golden bundles:

```bash
node packages/generator/test/e2e-agents/codex/regen-golden.mjs
```

## Coverage Matrix

| Binding row | Resource field | Search param | Query builder | Tests |
| --- | --- | --- | --- | --- |
| required (`code`) | `Patient.gender`, `Observation.status` | `Patient.gender`, `Observation.status` | `where("gender", ...)`, `where("status", ...)` | `pipeline.test.ts`, `types.test-d.ts` |
| required (`CodeableConcept`) | `Observation.category` | n/a | n/a | `pipeline.test.ts`, `types.test-d.ts` |
| extensible | `Condition.clinicalStatus` | intentionally not narrowed in generator | n/a | `pipeline.test.ts`, `types.test-d.ts` |
| preferred | `Encounter.priority` | n/a | n/a | `pipeline.test.ts`, `types.test-d.ts` |
| example | `Specimen.type` | n/a | n/a | `pipeline.test.ts`, `types.test-d.ts` |
| unresolvable fallback | `MedicationRequest.medicationCodeableConcept` | n/a | n/a | `pipeline.test.ts`, `types.test-d.ts` |
| flag-off backward compat | plain resources, plain search params, no terminology dir | plain `TokenParam` output | unchanged consumer surface | `backward-compat.test.ts` |

## Notes

- The fixtures are copied into this namespace so the suite can run in isolation.
- The temporary output stays inside the repo under per-agent `.tmp-*` directories so workspace package resolution works during `tsc`.
- The “unresolvable” row is modeled as a normal binding to a ValueSet whose contents cannot be resolved offline; the parser does not have a separate `unresolvable` strength.
