# Test Prompt: `@fhir-dsl/example`

**Role.** You are a senior TypeScript test engineer. Your job here is narrow:
write a **consumer smoke test** that proves the committed generated tree in
`packages/example/src/fhir/` still compiles and wires up against the current
`@fhir-dsl/core`. This package is a consumer of the generator's output — it
exists to catch breaking changes in core or the generator before they ship.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/example` is a
deliberately test-free demo showing what consumers get after running the CLI:
`src/fhir/` contains a committed snapshot of generated FHIR R4 + US Core
output, and `src/index.ts` exercises the public surface (search, read,
transactions, profiles).

Do **not** test FHIR or DSL behavior here — that belongs in `@fhir-dsl/core`
and `@fhir-dsl/generator`. Your tests guard the *integration contract*.

## Package brief

- `packages/example/src/index.ts` — example consumer code using the generated
  client. Has deliberate `@ts-expect-error` lines at the bottom.
- `packages/example/src/fhir/r4/` — committed generated tree
  (`client.ts`, `resources/`, `schemas/`, `profiles/`, …).

### Files to read first

1. `packages/example/src/index.ts`
2. `packages/example/src/fhir/r4/client.ts`
3. `packages/example/src/fhir/r4/index.ts` (or `resources/index.ts`)
4. `packages/core/src/fhir-client.ts` (the interface the generated client
   composes with)

## Existing coverage

None. This is the first test for the package.

## Coverage gaps to fill

Write tests in `packages/example/test/`. Keep them **small and focused**:

1. **Generated `createClient` exposes the expected methods.** Import
   `createClient` from `./src/fhir/r4/client.js`, call it with a baseUrl and
   a fake `fetch`, and assert the returned client has `search`, `read`,
   `transaction`, `batch` as functions.
2. **`fhir.search("Patient")` returns a builder that compiles.** Chain
   `.where(...).sort(...).count(1).compile()` and assert the resulting
   `CompiledQuery` has the right `method`, `path`, and a `params` array
   containing the expected entries.
3. **Profile-aware search narrows types.** In a `*.test-d.ts` file, assert
   that `fhir.search("Patient", "us-core-patient")` yields a builder whose
   `.execute()` promise resolves to `{ data: USCorePatientProfile[], ... }`
   (or whichever exact profile type name is generated — read it off the
   generated file).
4. **Schemas are wired into the client by default.** When generated with
   `--validator`, the generated `createClient` passes
   `schemas: SchemaRegistry` into core. Import the generated `SchemaRegistry`,
   spy/override nothing, and verify that calling `.validate()` on a search
   builder does **not** throw `ValidationUnavailableError`.
5. **Committed `@ts-expect-error` lines still fire.** In a `*.test-d.ts`
   file, re-state one of the negative type assertions from
   `packages/example/src/index.ts` (e.g. `fhir.search("Foo")` on an unknown
   resource) with `@ts-expect-error`, so if core regresses its inference the
   expect-error becomes a green line and the suite fails.

## Research directives

- Standard Schema V1: <https://standardschema.dev/> — the `~standard.validate`
  signature you'll see exposed by generated schemas.
- vitest typecheck integration:
  <https://vitest.dev/guide/testing-types> — how `*.test-d.ts` runs.
- Generated FHIR R4 resource list: check
  `packages/example/src/fhir/r4/resources/` for what's actually emitted.

## Conventions

- Keep this suite **small**: the goal is fast early-warning, not coverage.
  Five tests total is plenty.
- No network. Pass a `fetch` stub to `createClient`.
- Do not import anything from `packages/example/src/index.ts` directly if it
  runs top-level `fhir.search(...)` calls — import the generated modules
  instead so tests don't trigger the demo HTTP code.

## Workflow

1. Read the listed files.
2. Write `packages/example/test/smoke.test.ts` and
   `packages/example/test/types.test-d.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```
4. If a test fails because the generated tree lags behind core, stop and flag
   it — regenerating the example is a human decision, not a test fix.

## Success criteria

- Every scenario above has a corresponding test.
- All three gates green.
- No changes to `packages/example/src/**`.

## Out of scope

- Running the real generator. The committed tree is the fixture.
- Exercising every generated resource type. One representative (Patient) is
  enough for the smoke test.
- HTTP-layer testing — that belongs in `@fhir-dsl/runtime`.
