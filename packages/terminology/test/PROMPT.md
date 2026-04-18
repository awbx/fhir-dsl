# Test Prompt: `@fhir-dsl/terminology`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/terminology` — the FHIR ValueSet / CodeSystem resolver — to
production-grade coverage using **vitest**. No source changes. No new
runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/terminology` parses
FHIR CodeSystem, ValueSet, and (where available) ValueSet `$expand`
outputs; resolves `ValueSet.compose` (include/exclude) against loaded
CodeSystems; and exposes a `TerminologyRegistry` used by the generator
to emit typed unions for required bindings.

## Package brief

Public surface (`packages/terminology/src/index.ts`):

- `parseCodeSystem` (`codesystem-parser.ts`).
- `parseExpansion`, `parseExpansionsBundle` (`expansion-parser.ts`).
- `TerminologyRegistry` (`registry.ts`) — load, index, look up.
- `resolveValueSet` (`resolver.ts`).
- `resolveCompose` (`valueset-parser.ts`).
- Types: `CodeSystemModel`, `ResolvedCode`, `ResolvedValueSet` (`model.ts`).

### Files to read first

1. `packages/terminology/src/index.ts`
2. `packages/terminology/src/codesystem-parser.ts`
3. `packages/terminology/src/valueset-parser.ts`
4. `packages/terminology/src/expansion-parser.ts`
5. `packages/terminology/src/registry.ts`
6. `packages/terminology/src/resolver.ts`
7. `packages/terminology/src/model.ts`
8. Colocated `*.test.ts` files

## Existing coverage (do not duplicate)

- `codesystem-parser.test.ts` — CodeSystem → model.
- `valueset-parser.test.ts` — compose logic.
- `expansion-parser.test.ts` — pre-expanded ValueSet.
- `registry.test.ts` — registration + lookup.

## Coverage gaps to fill

Write tests in `packages/terminology/test/`.

### CodeSystem parser

1. **Hierarchy**: a CodeSystem with `hierarchyMeaning: is-a` and nested
   `concept[].concept[]` is flattened into `ResolvedCode[]` with
   `parent` + `isA` relations populated.
2. **Properties**: CodeSystem concepts with named properties (e.g.
   `status`, `notSelectable`) expose those via `ResolvedCode.properties`.
3. **Deduplication**: a CodeSystem listing the same code twice is either
   rejected or deduped — match the implementation and assert.

### ValueSet compose

4. **`include` without `concept`**: including a whole CodeSystem by URL
   pulls every concept from the registered CodeSystem.
5. **`include.concept[]`**: only the listed codes are included.
6. **`include.filter`**: `op: is-a`, `op: descendent-of`, `op: =`,
   `op: in` each select the expected subset against a hierarchical
   CodeSystem fixture.
7. **`exclude`**: codes in `exclude` are removed from the union.
8. **Cross-system**: a compose with two `include[]` entries from
   different CodeSystems yields `ResolvedCode[]` where `system` is
   preserved per entry.
9. **Missing CodeSystem**: composing against an un-registered system
   throws an error naming the canonical URL.

### Expansion parser

10. **Pre-expanded ValueSet**: `ValueSet.expansion.contains[]` is parsed
    to `ResolvedValueSet.codes` even when `compose` is absent.
11. **Nested `contains[].contains[]`**: flattened depth-first; order is
    preserved.
12. **`inactive: true` codes**: either excluded or marked inactive —
    match the implementation and assert.
13. **Expansion bundle**: `parseExpansionsBundle` handles a Bundle of
    ValueSets; ignores unrelated resources; reports which URL was parsed.

### Registry

14. **Multi-version**: registering the same CodeSystem URL at versions
    `4.0.1` and `5.0.0` does not collide; lookup by `(url, version)`
    picks the right entry; lookup by bare URL returns the default
    (document which: latest or first).
15. **Resolution order** when a ValueSet has multiple `include[]` from
    the same CodeSystem — document and test.
16. **Case-sensitivity** of CodeSystem codes: respect
    `CodeSystem.caseSensitive`; a case-sensitive system rejects a
    lookup for the wrong case, an insensitive system accepts.

### Resolver integration

17. `resolveValueSet` against a registry containing both a compose and
    a pre-expanded version prefers one (which? document + test).
18. `resolveValueSet` returns a stable, ordered `ResolvedValueSet`: the
    same inputs produce the same output on every call.

## Research directives

- FHIR Terminology module overview:
  <https://www.hl7.org/fhir/R4/terminologies.html>.
- ValueSet resource:
  <https://www.hl7.org/fhir/R4/valueset.html> — especially
  `compose.include`, `compose.exclude`, `expansion.contains`.
- CodeSystem resource:
  <https://www.hl7.org/fhir/R4/codesystem.html> — `hierarchyMeaning`,
  `caseSensitive`, `property`, `filter`.
- `$expand` operation:
  <https://www.hl7.org/fhir/R4/valueset-operation-expand.html>.
- Filter operations:
  <https://www.hl7.org/fhir/R4/valueset-definitions.html#ValueSet.compose.include.filter.op>
  — `is-a`, `descendent-of`, `=`, `in`, `not-in`, `exists`.

## Conventions

- vitest `globals: true`.
- Use hand-authored, minimal fixtures (5–10 concepts per CodeSystem,
  2–3 per ValueSet). No full FHIR terminology dumps committed.
- Table-driven tests (`it.each`) for filter operators and scope
  parsers are a good fit.

## Workflow

1. Read source + existing tests.
2. Organize new tests by area: `codesystem-hierarchy.test.ts`,
   `valueset-compose-filter.test.ts`, `expansion.test.ts`,
   `registry-multi-version.test.ts`, `resolver.test.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 test.
- All three gates green.
- No source changes.

## Out of scope

- Implementing new filter operators.
- Hitting real terminology servers (TX.FHIR.ORG).
- Full SNOMED / LOINC fixtures.
