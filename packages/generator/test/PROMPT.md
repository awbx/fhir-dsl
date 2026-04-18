# Test Prompt: `@fhir-dsl/generator`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/generator` — the FHIR-spec → TypeScript code generator — to
production-grade coverage using **vitest**. No source changes. No new
runtime dependencies beyond devtime helpers (e.g. `tmp`/`os.tmpdir`).

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/generator` is the
largest package: it downloads FHIR R4/R4B/R5/R6 definitions and published IG
packages, parses StructureDefinitions + SearchParameters into an internal
`ResourceModel`, and emits a TypeScript tree (resources, datatypes,
primitives, search params, registry, client, profiles, terminology,
schemas for runtime validation).

## Package brief

Public surface (`packages/generator/src/index.ts`):

- `generate(options: GeneratorOptions)` — the orchestrator.
- `downloadIG`, `downloadSpec`, `loadLocalSpec` — spec acquisition.
- `parseStructureDefinition`, `parseSearchParameters`, `parseProfile`.
- Model types: `ResourceModel`, `PropertyModel`, `BackboneElementModel`,
  `SearchParamModel`, `ProfileModel`, `ResourceSearchParams`.

Internal layout:

- `parser/` — `structure-definition.ts` (resource-model), `profile.ts`
  (differential overlay), `search-parameter.ts`, `type-resolver.ts`.
- `emitter/` — `resource-emitter.ts`, `terminology-emitter.ts`,
  `profile-emitter.ts`, `registry-emitter.ts`, `spec-emitter.ts`,
  `search-param-emitter.ts`, `index-emitter.ts`, and
  `emitter/schema/` for runtime-validator emission.
- `downloader.ts` — fetches + caches FHIR packages.
- `generator.ts` — wires parse → emit → write.

### Files to read first

1. `packages/generator/src/index.ts`
2. `packages/generator/src/generator.ts`
3. `packages/generator/src/parser/structure-definition.ts`
4. `packages/generator/src/parser/profile.ts`
5. `packages/generator/src/parser/type-resolver.ts`
6. `packages/generator/src/emitter/resource-emitter.ts`
7. `packages/generator/src/emitter/schema/schema-emitter.ts`
8. All existing `*.test.ts` in `packages/generator/src/`

## Existing coverage

Colocated tests cover most single-unit pieces:

- `parser/structure-definition.test.ts` — property parsing.
- `parser/profile.test.ts` — profile differential overlay.
- `parser/search-parameter.test.ts` — param parsing.
- `parser/type-resolver.test.ts` — canonical → TS mapping.
- `emitter/resource-emitter.test.ts` — resource TS emission.
- `emitter/terminology-emitter.test.ts` — ValueSet-bound enum emission.
- `emitter/profile-emitter.test.ts` — profile TS emission.
- `emitter/registry-emitter.test.ts` — resource / search / include registries.
- `emitter/spec-emitter.test.ts` — markdown spec emission.
- `emitter/search-param-emitter.test.ts` — typed search param map.
- `emitter/index-emitter.test.ts` — file / root / client index.
- `emitter/schema/schema-emitter.test.ts` — Standard Schema emission.

Read them first — **do not duplicate**.

## Coverage gaps to fill

Write tests in `packages/generator/test/`.

### Parser edge cases

1. **Backbone element nesting**: a resource with nested backbone elements
   (e.g. `Questionnaire.item.item`) parses to the right
   `BackboneElementModel` tree, with `path` values preserved.
2. **Choice types (`value[x]`)**: a property with multiple types produces
   exactly one `PropertyModel` where `isChoiceType: true` and `types[]`
   holds every type code. The name stored in the model is the base name
   (`value`), not `valueString`.
3. **`contentReference`**: a property pointing at another element by
   contentReference is parsed as an array of the referenced type
   (cross-check the existing test and extend with a second-level ref).
4. **Reference targets**: `Reference(Patient | Practitioner)` parses into a
   PropertyModel whose type carries both targets in the expected field.
5. **Required vs optional**: `min: 1` → `isRequired: true`; `max: "*"` →
   `isArray: true`; `max: "0"` → property is dropped.
6. **Profile differential overlay**: `parseProfile` applied to a US Core
   StructureDefinition narrows cardinality + bindings on the base resource
   (e.g. `identifier.minItems` becomes 1).

### Emitter completeness (per-emitter, not duplicating colocated tests)

7. **`emitResource`** produces a file that imports exactly the cross-type
   datatypes it uses (no unused imports, no missing ones). Verify by
   generating a Patient-like model, grepping the output for `import`
   lines, and asserting against the set of used types.
8. **`emitTerminology`** for a large ValueSet (100+ codes) emits a
   reasonable TypeScript union (no stack-overflow or runaway recursion).
9. **`emitProfileSchema`** handles a profile that narrows a `Coding`-bound
   field to a required binding — the emitted schema has the bound code set
   closed.
10. **Schema registry emission**: `emitSchemaRegistry` indexes every
    resource under `resources[Name]: NameSchema` and references
    `ProfileSchemaRegistry` when `hasProfiles` is true.

### Downloader

11. **Cache hit**: a pre-populated cache dir satisfies `downloadSpec`
    without network. Use `msw` or override `fetch` to assert no request
    was made.
12. **Cache miss**: when the cache is empty, `downloadSpec` hits the
    mocked URL, writes to cache, and returns the parsed spec.
13. **Network error**: a fetch that rejects surfaces a descriptive error
    (the version string and URL appear in the message).
14. **IG package parsing**: `downloadIG` accepts `hl7.fhir.us.core@6.1.0`
    and parses the name/version correctly; invalid inputs
    (`no-at-sign`, `@1.0.0`, `name@`) throw.

### End-to-end `generate()`

15. **Tmpdir smoke test**: call `generate()` with a minimal `localSpecDir`
    fixture (hand-authored: a couple of StructureDefinitions + one
    SearchParameter bundle) and assert:
    - the expected file tree is written (`resources/patient.ts`,
      `search-params.ts`, `registry.ts`, `client.ts`, `index.ts`);
    - passing `--validator native` additionally writes
      `schemas/__runtime.ts`, `schemas/resources/patient.schema.ts`,
      `schemas/schema-registry.ts`, and `schemas/index.ts`;
    - passing `ig` additionally writes `profiles/`;
    - the emitted TS actually typechecks. Spawn `tsc --noEmit` against
      the tmpdir root (or invoke the TS compiler API directly).

### Regression guards

16. **Resource order stability**: running `generate()` twice on the same
    fixture produces byte-identical output (ordering is deterministic
    across runs — no Map iteration leak).
17. **Idempotent writes**: re-running `generate()` to the same `outDir`
    does not leave stale files when a resource is removed from the input.

## Research directives

- FHIR R4 StructureDefinition spec:
  <https://www.hl7.org/fhir/R4/structuredefinition.html> — especially
  `snapshot.element`, `differential.element`, choice types, slicing,
  and `contentReference`.
- FHIR package layout:
  <https://registry.fhir.org/learn> and
  <https://confluence.hl7.org/display/FHIR/NPM+Package+Specification>.
- FHIR SearchParameter definitions:
  <https://www.hl7.org/fhir/R4/searchparameter.html>.
- Standard Schema V1 (for schema emitter assertions):
  <https://standardschema.dev/>.

Use these sources to justify edge-case assertions (profile differential
semantics, choice-type naming, cardinality rules).

## Conventions

- vitest `globals: true`.
- The end-to-end test must run in a `mkdtemp` directory and clean up after
  itself. Timeouts: vitest's default 60s is already set in
  `vitest.config.ts` — that's enough.
- Do **not** invoke the real network. Use `msw` or a `fetch` stub.
- For the end-to-end test, use a *tiny* hand-authored fixture (one
  Patient-like resource, one SearchParameter bundle, one ValueSet). Do
  not copy the full R4 spec into the repo.

## Workflow

1. Read the listed files + existing colocated tests.
2. Organize new tests by area: `parser-edge.test.ts`,
   `emitter-resource-imports.test.ts`, `downloader-cache.test.ts`,
   `end-to-end.test.ts`, `determinism.test.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```
4. If the end-to-end test is flaky on CI-like environments, document the
   reason and mark it with `.skipIf(process.env.CI)` rather than leaving
   it undeclared.

## Success criteria

- Every scenario has ≥1 test.
- End-to-end test produces a typechecking output tree.
- All three gates green.
- No changes to `packages/generator/src/**`.

## Out of scope

- Refactoring the generator or parser.
- Performance benchmarks.
- Testing every FHIR R4 resource — one representative + one profile is
  enough for end-to-end.
- Downloading real IG packages over the network.
