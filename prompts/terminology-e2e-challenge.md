# Task: Design and implement a complex end-to-end test pipeline for a type-safe FHIR code generator

You are working on `fhir-dsl`, a TypeScript monorepo (Kysely-inspired) that makes
FHIR (the healthcare interoperability standard) type-safe at compile time. You
MUST NOT read the existing test or product code. Everything you need to design
the suite is in this prompt; your job is to produce the test architecture, the
fixtures, and the assertions from first principles.

================================================================================
THIS IS A BENCHMARK — TAG YOUR WORK
================================================================================

This is a head-to-head benchmark across different AI models. You are expected
to design your OWN e2e test architecture — do not mimic a prescribed shape,
come up with what you think is best and defend it with the results.

**Namespace every artifact you produce by your AI name/version.** Replace
`<agent-id>` below with something like `claude-opus-4-6`, `gpt-5`, `gemini-2.5-pro`
— lowercase, hyphen-separated, no spaces.

Put ALL new test files, fixtures, golden bundles, helper scripts, and config
additions under:

    packages/generator/test/e2e-agents/<agent-id>/

This includes:
- your fixture JSON bundle
- your generated "golden" bundle(s), if your design needs them
- your runtime test files (`*.test.ts`)
- your type-level test files (`*.test-d.ts`)
- any helper scripts you need (ESM `.mjs`)
- a top-level `README.md` for your agent-id directory describing: your
  architecture, why you chose it, how to run it in isolation, and your
  self-reported coverage against the success criteria

If you need to change shared config (vitest.config.ts, tsconfig, biome
excludes, CI workflow), do so minimally and keep the change scoped so multiple
agents' suites can coexist in the repo without interfering.

### Work in an isolated git worktree on a branch named after your agent-id

Do not commit on `main`. Before you start, create a worktree + branch named
exactly after your `<agent-id>`, and do all work there:

```bash
# from the repo root
git worktree add ../fhir-dsl-<agent-id> -b <agent-id>
cd ../fhir-dsl-<agent-id>
```

Examples: branch `codex` worktree `../fhir-dsl-codex`, branch `claude-opus-4-6`
worktree `../fhir-dsl-claude-opus-4-6`. This isolates parallel agent runs and
makes the final benchmark a clean diff per branch.

When you're done, leave your branch unmerged — the human reviewer will
checkout each agent's branch in turn to score them. Don't open a PR, don't
merge, don't rebase onto main. Just commit on your branch and stop.

**Coverage target: 100% of the binding-strength matrix below, end-to-end.**
Every binding row, every typed narrowing path (resource field, search param,
query-builder `.where()`), and every success-criteria regression must be
covered by at least one test you wrote. Report coverage by listing each matrix
row × each layer you implemented and the test(s) that cover it.

================================================================================
PROJECT SHAPE
================================================================================

Monorepo packages (pnpm workspace):

- packages/types        — FHIR primitives and datatypes (FhirCode, Coding,
                          CodeableConcept, Reference, etc.). These are generic:
                          `FhirCode<T = string>`, `Coding<T = string>`,
                          `CodeableConcept<T = string>`.
- packages/core         — Query builder + search-param type registry. Exposes
                          `createFhirClient<Schema>()` where Schema is
                          `{ resources, searchParams, includes, revIncludes,
                          profiles }`. Exposes `SearchParamFor<Schema, R>`.
                          Search-param value types: `TokenParam<T = string>`,
                          `StringParam`, `ReferenceParam`, `DateParam`, etc.
- packages/runtime      — Fetch-based client impl.
- packages/generator    — Reads FHIR StructureDefinitions/ValueSets/CodeSystems
                          and emits typed resource files, a registry, and a
                          search-params module.
- packages/terminology  — ValueSet/CodeSystem resolver used by the generator.
- packages/cli          — Thin wrapper over generator.

The generator exports `generate({ version, outDir, localSpecDir,
expandValueSets, resolveCodeSystems })`. `localSpecDir` points at a FLAT
directory of FHIR JSON artifacts (no recursion). Output is written to `outDir`
and includes:

    <outDir>/r4/
      client.ts                       — exports createClient + GeneratedSchema
      registry.ts                     — FhirResourceMap, SearchParamRegistry,
                                        IncludeRegistry, RevIncludeRegistry
      search-params.ts                — per-resource search-param interfaces
      search-param-types.ts           — re-exports of TokenParam etc.
      resources/<resource>.ts         — one file per resource
      terminology/valuesets.ts        — one union type per ValueSet (only when
                                        expandValueSets: true)
      terminology/codesystems.ts      — const namespace objects (only when on)
      datatypes.ts, primitives.ts, index.ts

================================================================================
THE FEATURE UNDER TEST — THE TERMINOLOGY ENGINE
================================================================================

FHIR resources have "coded" fields (like Patient.gender or Observation.category)
that reference ValueSets. Each reference has a BINDING STRENGTH. The terminology
engine's job is to translate each binding into the correct TypeScript shape so
that invalid codes are caught at compile time.

The binding-strength matrix is the ENTIRE test surface. Memorize it:

| Binding      | Emitted TypeScript shape                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| required     | Closed union. `FhirCode<"a" \| "b">` or `CodeableConcept<"a" \| "b">`. `"c"` is a type error.                                                                |
| extensible   | Known-or-string. `T \| (string & {})`. Preserves autocomplete for known codes but still accepts arbitrary strings. At the type level collapses to `string`. |
| preferred    | No constraint. Plain `CodeableConcept`. Any string accepted.                                                                                                 |
| example      | No constraint. Plain `CodeableConcept`.                                                                                                                      |
| unresolvable | Fallback to unparameterized. E.g. a binding to a SNOMED filter can't be resolved offline, so the generator must emit plain `FhirCode` / `CodeableConcept` — users are not locked out. |

The typed narrowing must flow all the way through:

1.  Resource fields:

    ```ts
    Patient.gender?:              FhirCode<AdministrativeGender>
    Observation.category?:        CodeableConcept<ObservationCategoryCodes>[]
    Condition.clinicalStatus?:    CodeableConcept<Extensible<ClinicalCodes>>
    ```

2.  Search params:

    ```ts
    PatientSearchParams.gender:      TokenParam<AdministrativeGender>
    ObservationSearchParams.status:  TokenParam<ObservationStatus>
    ```

3.  Query builder (via `.where(param, op, value)`):

    ```ts
    client.search("Patient").where("gender", "eq", "male");   // OK
    client.search("Patient").where("gender", "eq", "banana"); // TYPE ERROR
    ```

The feature is behind a `--expand-valuesets` flag (default OFF). When off, the
generator MUST produce output byte-identical to the pre-feature version (plain
`FhirCode`, plain `TokenParam`, no `terminology/` directory). This backward-
compat invariant is critical.

================================================================================
THE TEST GAP YOU ARE CLOSING
================================================================================

The existing unit tests are string assertions on emitter output:

```ts
expect(output).toContain('export type AdministrativeGender = ...');
```

This proves the emitter wrote the right string. It does NOT prove:

- The generated types actually constrain consumer code
- `Patient.gender = "banana"` is a type error (the product promise)
- `.where("gender", "eq", "banana")` is a type error
- Extensible bindings accept arbitrary strings
- Preferred/example bindings are unconstrained
- Unresolvable bindings fall back gracefully

A generator that emits semantically broken types can pass every string test and
ship. Your job is to prove the generator's output is type-correct by making
TypeScript itself verify it.

================================================================================
YOUR DELIVERABLE: AN E2E PIPELINE YOU DESIGN YOURSELF
================================================================================

**You are expected to design your own architecture.** The sections below are
reference patterns a previous implementation used successfully — treat them as
a floor, not a ceiling. If you can think of a better way to prove the success
criteria, do that instead, and defend your choice in your `README.md`.

At minimum, whatever you build MUST:

- Run the REAL generator (not a mock) on REAL fixtures you created
- Prove the generated types actually constrain consumer code at compile time
  (not just that emitter strings look right)
- Cover every row of the binding matrix
- Cover the backward-compat invariant (flag-off output unchanged)
- Pass every one of the success-criteria regression probes at the end of this
  document

Vitest 4.x has a built-in `typecheck` mode that runs `.test-d.ts` files through
`tsc` with no runtime execution. A typical implementation combines that with
normal runtime tests, but you are free to pick any approach that proves the
invariants.

### LAYER 1 — Hand-crafted fixture bundle

Produce a FLAT directory of minimal FHIR JSON artifacts that exercises EVERY
row of the binding matrix:

- `StructureDefinition-Patient.json` — required (gender)
- `StructureDefinition-Observation.json` — required on FhirCode (status) AND on CodeableConcept (category)
- `StructureDefinition-Condition.json` — extensible (clinicalStatus)
- `StructureDefinition-Encounter.json` — preferred (priority)
- `StructureDefinition-Specimen.json` — example (type)
- `StructureDefinition-MedicationRequest.json` — unresolvable external VS (SNOMED filter on medicationCodeableConcept)
- `ValueSet-*.json` — one per bound VS; use `compose.include.concept` for explicit lists AND `compose.include.system` pointing at a CodeSystem for at least one, to exercise both resolution paths
- `CodeSystem-observation-status.json` — content: complete
- `SearchParameter-*.json` — gender, status, name, subject

These are NOT real FHIR spec excerpts — they are minimal, declarative inputs
that exercise the engine's branches. Each StructureDefinition needs
`kind: "resource"`, `abstract: false`, `baseDefinition: DomainResource`, and a
`snapshot.element[]` array with the bindings set per the matrix.

### LAYER 2 — Pipeline e2e test (runtime, filesystem assertions)

A Vitest `.test.ts` that:

1. In `beforeAll`, calls `generate()` with `expandValueSets: true, resolveCodeSystems: true` into a temp directory.
2. Reads each generated file and asserts the expected string shape for every row of the binding matrix — required, extensible, preferred, example, unresolvable. Target ~20 assertions across the matrix.
3. Asserts `search-params.ts` contains `TokenParam<AdministrativeGender>` for `Patient.gender` and `TokenParam<ObservationStatus>` for `Observation.status`.
4. **CAPSTONE**: writes a small consumer `.ts` file into the generated output directory that imports `createClient` and exercises every binding strength (valid codes only), then spawns `tsc --noEmit --strict` via `spawnSync` and asserts `status === 0`. This proves the entire bundle compiles.

> **CRITICAL GOTCHA**: the generated bundle imports `@fhir-dsl/core` and
> `@fhir-dsl/types`. pnpm workspace symlinks only resolve inside the monorepo.
> `os.tmpdir()` is on a different filesystem tree and will fail with
> `Cannot find module '@fhir-dsl/types'`. Put the pipeline's temp directory
> INSIDE the repo (e.g. `packages/generator/test/.tmp-output/`, gitignored).

### LAYER 3 — Type-level tests (`.test-d.ts`, typecheck mode)

A `.test-d.ts` file that imports resource types from a CHECKED-IN "golden"
bundle — generated output that you commit to the repo once, so these tests can
run without waiting for the pipeline and can be debugged in an IDE.

Use `expectTypeOf` from vitest. Cover:

- **Required on FhirCode**: `Patient.gender` equals the exact closed union. Positive and negative (`@ts-expect-error`) assertions per AdministrativeGender value.
- **Required on CodeableConcept**: drill into `NonNullable<NonNullable<Cat["coding"]>[number]["code"]>` and assert the union identity; reject invalid codes.
- **Extensible**: arbitrary strings MUST still be assignable (this is the critical difference from required).
- **Preferred / example**: plain CodeableConcept, any string works.
- **Unresolvable fallback**: plain CodeableConcept, any string works.
- **Search-param flow**: extract `SearchParamFor<Schema, "Patient">["gender"]`, peel off `.value`, assert it equals `AdministrativeGender`. Then use the client in real expressions: `client.search("Patient").where("gender","eq","male")` passes, `...where("gender","eq","banana")` is `@ts-expect-error`.
- **Regression guards**: assert each union has the expected exact member count and member set — breaks loudly if the resolver ever drops or adds one.

> **GOTCHAS:**
>
> - `toMatchTypeOf` is deprecated in vitest 4. Use `toExtend`, `toEqualTypeOf`, `toHaveProperty`.
> - `@ts-expect-error` applies to the IMMEDIATELY FOLLOWING line. In a multi-line object literal, place it inside the literal directly above the offending field, not above the `const x = {` declaration.
> - The `tsconfig.test.json` must include the golden bundle path so imports resolve.
> - Enable typecheck in `vitest.config.ts`:
>   ```ts
>   typecheck: {
>     enabled: true,
>     include: ["packages/*/test/**/*.test-d.ts"],
>     tsconfig: "./tsconfig.test.json"
>   }
>   ```

### LAYER 4 — Backward-compat byte-diff test

Separate runtime test that:

1. Generates with `expandValueSets: false` into a temp dir.
2. Asserts NO `terminology/` directory exists.
3. Walks the output tree and byte-for-byte diffs every file against a CHECKED-IN "legacy golden" bundle.
4. Provides an `UPDATE_GOLDEN=1` env var escape hatch to regenerate the legacy bundle after intentional changes.

> **GOTCHA**: If you use biome/prettier on the repo, EXCLUDE the golden bundles
> from formatting. Their purpose is to mirror generator output exactly; any
> reformatting breaks the byte-diff and makes the test meaningless.

================================================================================
DESIGN CONSTRAINTS
================================================================================

- The type tests must NOT import from the pipeline's temp output. They depend on a committed golden bundle, so they're stable, debuggable in an IDE, and run even if the pipeline is broken.
- The pipeline test produces a SEPARATE temp bundle; it is not allowed to mutate the golden.
- Provide a regen script (node ESM) that rebuilds both golden bundles from the fixtures, so regeneration after intentional changes is a one-liner.
- Wire the new test suite into CI.

================================================================================
SUCCESS CRITERIA
================================================================================

You have succeeded if ALL of these deliberate regressions produce a specific,
identifiable test failure in YOUR suite:

1. Break the emitter to emit `FhirCode` instead of `FhirCode<T>` on required bindings → multiple type tests fail with clear type-mismatch errors.
2. Tamper with one character in any legacy-golden file → your byte-diff (or equivalent) test fails and names the file.
3. Remove the `--expand-valuesets` flag's gate → backward-compat test fails.
4. Change a `@ts-expect-error` line to valid code → vitest reports the directive is unused.
5. Resolver drops a code from a ValueSet → union-identity test fails and shows the diff.

================================================================================
FINAL REPORT (put this in your `<agent-id>/README.md`)
================================================================================

1. **Your agent-id**: `<claude-opus-4-6 / gpt-5 / gemini-2.5-pro / …>`
2. **Architecture you chose**: 3–6 sentences. Why this shape?
3. **Test counts per layer** (or per category if you used a different taxonomy):
   layer name → number of tests → what invariant they prove
4. **Coverage matrix**: for each binding row (required × FhirCode, required ×
   CodeableConcept, extensible, preferred, example, unresolvable) and each
   typed-narrowing path (resource field, search param, `.where()`), list the
   test(s) in your suite that cover it. Any unchecked cell = incomplete.
5. **Regression-probe results**: show the output you got from running each of
   the 5 success-criteria regressions above (verbatim failure messages).
6. **What you chose to do differently** vs. the reference patterns, and why.
7. **Known gaps / limitations** in your suite.

You are benchmarked on: correctness, coverage, architectural judgment, and
the clarity of the failure messages your suite produces when something breaks.
