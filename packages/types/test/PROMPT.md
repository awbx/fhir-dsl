# Test Prompt: `@fhir-dsl/types`

**Role.** You are a senior TypeScript test engineer. `@fhir-dsl/types` ships
only **type definitions** — no runtime code — so your tests are
**compile-only** (`*.test-d.ts`) and run via vitest's typecheck integration.
No source changes. No new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/types` is the
foundation package: it defines FHIR primitives (`id`, `dateTime`, `code`,
`uri`, …), element/extension types, base Resource / Bundle / OperationOutcome
shapes, and the `SearchParam<Type, Value>` helpers consumed by the
generator's emitted code.

The package does **not** contain generated resource types — those are
emitted by `@fhir-dsl/generator` into the user's project.

## Package brief

Public surface (`packages/types/src/index.ts`):

- `primitives.ts` — primitive string aliases: `FhirString`, `FhirCode<T>`,
  `FhirDateTime`, `FhirInstant`, `FhirInteger`, `FhirDecimal`, `FhirPositiveInt`,
  `FhirId`, `FhirUri`, `FhirCanonical`, `FhirUuid`, etc.
- `datatypes.ts` — `Element`, `Extension`, `Reference<T>`, `Period`,
  `HumanName`, `Address`, `Coding`, `CodeableConcept`, `Quantity`,
  `Money`, `Ratio`, `Attachment`, `Identifier`, `Meta`, `Narrative`.
- `search-param-types.ts` — `SearchParam<Type, Value>`,
  `SearchPrefixes<Type>`, and the param-type enum.

### Files to read first

1. `packages/types/src/index.ts`
2. `packages/types/src/primitives.ts`
3. `packages/types/src/datatypes.ts`
4. `packages/types/src/search-param-types.ts`

## Existing coverage

None. This package has **zero tests** today.

## Coverage gaps to fill

Write **compile-only** tests in `packages/types/test/*.test-d.ts`. Use
`expectTypeOf` from vitest or `tsd`-style `@ts-expect-error` assertions.

### Primitives

1. `FhirId` is assignable from a string but not from a number.
2. `FhirCode<"male" | "female">` narrows — `"other"` is **not**
   assignable. Without a generic arg, `FhirCode` is plain string.
3. `FhirPositiveInt`, `FhirInteger`, `FhirDecimal` are each numeric
   brands. Assigning a non-number errors.
4. `FhirDateTime` accepts the ISO 8601 forms listed in the FHIR R4
   primitive spec (partial `YYYY`, `YYYY-MM`, full with timezone), and
   rejects garbage if branded.
5. Primitive aliases preserve assignment compatibility with their
   underlying TS type (a plain `string` can flow into `FhirUri`, for
   instance) — confirm so consumers don't need ceremony for literals.

### Datatypes

6. `Element.extension?: Extension[]` — the field is optional, array,
   and each extension carries a `url` + a value.
7. `Reference<T>` narrows when `T` is a specific resource type and
   widens to unknown when omitted.
8. `Coding.code` is a `FhirCode`; narrowing `Coding<"active" | "inactive">`
   (if the generic exists) restricts `code`.
9. `CodeableConcept.coding?: Coding[]` and
   `.text?: FhirString` match the FHIR R4 shape.
10. `HumanName`, `Address`, `Identifier`, `Period`, `Quantity`, `Money`,
    `Ratio`, `Attachment` — one positive + one `@ts-expect-error`
    negative case each (e.g. `Period.start` rejects a non-date value).
11. `Meta.profile?: FhirCanonical[]` and `Meta.tag?: Coding[]` match the spec.

### Search param types

12. `SearchParam<"string", string>` and `SearchParam<"token", string>`
    produce distinct types — a token param value with a system-pipe
    form is still a string, but the wrapper type tag differs.
13. `SearchPrefixes<"date">` includes `"eq" | "ne" | "gt" | "lt" | "ge" | "le" | "sa" | "eb" | "ap"`;
    `SearchPrefixes<"string">` is narrower (no numeric prefixes).
14. Unknown param types (`SearchParam<"bogus", any>`) fail to compile.

## Research directives

- FHIR R4 primitive types:
  <https://www.hl7.org/fhir/R4/datatypes.html#primitive> — exact regex
  and value-space rules for each primitive.
- FHIR R4 complex types:
  <https://www.hl7.org/fhir/R4/datatypes.html#complex>.
- FHIR search parameter types + prefixes:
  <https://www.hl7.org/fhir/R4/search.html#prefix>.
- vitest typecheck tests:
  <https://vitest.dev/guide/testing-types>.
- `expectTypeOf` API:
  <https://vitest.dev/api/expect-typeof.html>.

## Conventions

- Every test file ends in `.test-d.ts` so vitest's typecheck integration
  picks it up. Compile-only — no `expect(...)`, no runtime.
- Negative assertions use `@ts-expect-error` immediately above the
  failing expression. The expression on the next line **must actually
  fail** — otherwise vitest fails the typecheck test (the expect-error
  becomes unused).
- No `any`, no `as` casts in the assertions themselves. Use
  `expectTypeOf<T>().toEqualTypeOf<U>()`.

## Workflow

1. Read the source.
2. Write tests in `packages/types/test/`:
   - `primitives.test-d.ts`
   - `datatypes.test-d.ts`
   - `search-param-types.test-d.ts`
3. Gates:
   ```bash
   pnpm test          # runs typecheck tests too, per vitest.config.ts
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 type-level assertion.
- `pnpm test` passes vitest's typecheck integration for this package.
- `pnpm lint` and `pnpm -r typecheck` green.
- No source changes.

## Out of scope

- Adding new primitive brands.
- Runtime behavior — there is none.
- Generated resource types — they live in the generator's output, not here.
