# Test Prompt: `@fhir-dsl/fhirpath`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/fhirpath` to production-grade coverage against the HL7 FHIRPath
spec, using **vitest**. No source changes. No new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/fhirpath` is a
type-safe FHIRPath expression builder + runtime evaluator. Users build
expressions with a fluent API (`fhirpath(Patient).name.given.first()`), the
builder produces both a FHIRPath string and a compiled predicate, and the
evaluator runs the compiled predicate against a resource.

The package aims to cover ~85% of the FHIRPath spec: 60+ functions, predicate
expressions, operators, type conversions, date/time arithmetic, string ops.

## Package brief

Public surface (`packages/fhirpath/src/index.ts`):

- `fhirpath(resource)` — builder factory.
- `evaluate(expr, input)` — runtime evaluator.
- `createPredicateProxy`, `extractPredicate`, `PREDICATE_SYMBOL` — internal
  predicate machinery exposed for extension points.
- Op types: `NavOp`, `FilterOp`, `MathOp`, `StringOp`, `OperatorOp`,
  `ConversionOp`, `LiteralOp`, `PathOp`, `SubsetOp`, `CombineOp`, `UtilityOp`.
- Type helpers: `FhirPathExpr`, `FhirPathOps`, `FhirPathPredicate`,
  `FhirTypeMap`, `NavKeys`, `Unwrap`, `PredicateOps`.

### Files to read first

1. `packages/fhirpath/src/index.ts`
2. `packages/fhirpath/src/builder.ts`
3. `packages/fhirpath/src/evaluator.ts` + `packages/fhirpath/src/eval/`
4. `packages/fhirpath/src/expression.ts`
5. `packages/fhirpath/src/ops.ts`
6. All existing `*.test.ts` files in `packages/fhirpath/src/`

## Existing coverage

- `builder.test.ts` — fluent API shape, produced FHIRPath strings.
- `evaluator.test.ts` — basic evaluation.
- `expression.test.ts` — predicate extraction.
- `conversion.test.ts` — type conversion.
- `math.test.ts` — arithmetic and boolean ops.
- `strings.test.ts` — string functions.
- `types.test.ts` — type-level helpers.

Read these first; **do not duplicate**. Fill gaps below.

## Coverage gaps to fill

Write tests in `packages/fhirpath/test/`.

### Builder / grammar

1. **Navigation chains** of length ≥ 3 render correctly
   (`Patient.contact.telecom.value`).
2. **Indexing and subsetting**: `.first()`, `.last()`, `.tail()`,
   `.skip(n)`, `.take(n)`, `.single()` — each emits the correct FHIRPath
   string and behaves as spec'd at runtime on empty, single-element, and
   multi-element collections.
3. **Filters**: `.where(pred)` and `.select(proj)` with predicate proxies;
   the emitted FHIRPath uses `$this` correctly.
4. **Type conversion**: `.toString()`, `.toInteger()`, `.toDecimal()`,
   `.toBoolean()`, `.toDate()`, `.toDateTime()`, `.toTime()`, `.toQuantity()`,
   `.is(T)`, `.as(T)`, `.ofType(T)` — emission and runtime behavior, including
   invalid conversions returning empty collections (spec: conversion failures
   yield `{}`, not errors).
5. **Combining**: `.union(other)`, `.combine(other)`, `.intersect(other)`,
   `.exclude(other)` — deduplication semantics match the spec (`union`
   dedupes, `combine` doesn't).

### Operators

6. **Arithmetic**: `+`, `-`, `*`, `/`, `div`, `mod` between integers,
   decimals, and quantities.
7. **Boolean**: `and`, `or`, `xor`, `implies` — three-valued logic (true,
   false, empty) where the spec requires it.
8. **Comparison + equality**: `=`, `!=`, `~`, `!~`, `<`, `<=`, `>`, `>=` —
   including collection equality (both-sides ordered, same length, element-wise).
9. **Membership**: `in`, `contains` — emits the correct form and
   dedupes-irrelevant results at runtime.

### Strings, dates, utilities

10. **String functions**: `length()`, `substring(a, b)`, `startsWith`,
    `endsWith`, `contains`, `replace`, `matches`, `indexOf`, `upper`,
    `lower`, `trim`, `toChars`, `split`.
11. **Date / time arithmetic**: adding `7 days`, `1 year`, comparing
    partial dates, precision mismatches (spec says comparing mixed
    precisions yields empty).
12. **Utility**: `exists()`, `empty()`, `all(pred)`, `allTrue`, `allFalse`,
    `anyTrue`, `anyFalse`, `count`, `distinct`, `isDistinct`.

### Error cases

13. Bad syntax at the builder level (e.g. calling `.take(-1)`) is rejected.
14. Evaluating an expression against a resource of the wrong type yields an
    empty collection, not a throw (match the spec's permissive model).
15. Missing input (`undefined`, `null`) is tolerated and yields `{}`.

## Research directives

Read before writing tests:

- HL7 FHIRPath R1 spec: <http://hl7.org/fhirpath/>. Key sections: §5
  (Functions), §6 (Operations), §7 (Lexical elements), §10 (Types).
- FHIR FHIRPath profile: <https://www.hl7.org/fhir/R4/fhirpath.html> —
  FHIR-specific extensions (`resolve()`, `extension("url")`).
- Three-valued boolean logic table — <http://hl7.org/fhirpath/#boolean-logic>.
- Collection equality rules — <http://hl7.org/fhirpath/#equal>.

These sources pin down edge cases that naive implementations get wrong
(mixed-precision date comparison → empty, `union` dedupes but `combine`
doesn't, conversion failure → `{}`, etc.). Assert on these behaviors
explicitly.

## Conventions

- vitest `globals: true` if matching existing style.
- Prefer expressing both "emitted string" and "runtime result" in paired
  tests — the same fluent call should emit the expected FHIRPath *and*
  evaluate correctly.
- No fixtures larger than they need to be. Small hand-built Patient /
  Observation objects are fine — don't copy full FHIR examples.
- Use `*.test-d.ts` for `NavKeys`, `Unwrap`, `PredicateOps` type-level
  assertions if gaps remain after `types.test.ts`.

## Workflow

1. Read source + existing tests.
2. Write new tests under `packages/fhirpath/test/`, grouped by spec section
   (`operators.test.ts`, `strings.test.ts`, `datetime.test.ts`,
   `subsetting.test.ts`, `conversion.test.ts`, `utility.test.ts`).
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 test.
- `pnpm test` green, `pnpm lint` green, `pnpm -r typecheck` green.
- Spec references are in test descriptions when the spec pinned the behavior
  (so future readers can trace back).
- No source changes.

## Out of scope

- Full FHIRPath conformance suite — aim for spec-accurate tests of what this
  package implements, not what it doesn't.
- Adding new functions to the builder.
- Performance benchmarks.
