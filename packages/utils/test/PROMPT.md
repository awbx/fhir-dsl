# Test Prompt: `@fhir-dsl/utils`

**Role.** You are a senior TypeScript test engineer. Your goal is to take
`@fhir-dsl/utils` from **zero tests** to production-grade coverage using
**vitest**. No source changes. No new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/utils` is an internal
package (not published for end-user consumption) that holds shared helpers
used by `@fhir-dsl/generator`, `@fhir-dsl/cli`, and friends: string-casing
helpers, FHIR-type → TypeScript mapping tables, and a tiny logger.

## Package brief

Public surface (`packages/utils/src/index.ts`):

- `naming.ts` — `toPascalCase`, `toCamelCase`, `toKebabCase`,
  `fhirTypeToFileName`, `fhirPathToPropertyName`, `capitalizeFirst`.
- `type-mapping.ts` — `FHIR_PRIMITIVE_TO_TS`, `FHIR_COMPLEX_TO_TS`,
  `FHIR_SEARCH_PARAM_TYPE_TO_TS` maps; `fhirPrimitiveToTs`,
  `fhirComplexToTs`, `fhirTypeToTs`, `isPrimitive`, `isComplexType`,
  `searchParamTypeToTs`.
- `logger.ts` — `Logger` class, `LogLevel` type, `LOG_LEVELS` map.

### Files to read first

1. `packages/utils/src/index.ts`
2. `packages/utils/src/naming.ts`
3. `packages/utils/src/type-mapping.ts`
4. `packages/utils/src/logger.ts`

## Existing coverage

None. Every test you write is additive.

## Coverage gaps to fill

Write tests in `packages/utils/test/`.

### Naming

1. **`toPascalCase`** on:
   - empty string → `""`.
   - single char lowercase → uppercase.
   - `"patient-contact"` → `"PatientContact"`.
   - `"medication_request"` → `"MedicationRequest"`.
   - `"URLParser"` (consecutive caps) → `"UrlParser"` **or** `"URLParser"`
     — match the implementation and document the rule.
   - `"patient123name"` (digits in middle) → expected form per impl.
   - Unicode input (`"niño-perro"`) — ensure no throw; document result.
2. **`toCamelCase`** mirrors `toPascalCase` but lowercases the first char.
3. **`toKebabCase`** on:
   - `"MedicationRequest"` → `"medication-request"`.
   - `"HTTPServer"` → `"http-server"` or `"httpserver"` — assert per impl.
   - `"alreadyKebab"` → `"already-kebab"`.
   - `""` → `""`.
4. **`fhirTypeToFileName`** round-trip: `fhirTypeToFileName("Patient") === "patient"`;
   `"MedicationRequest" → "medication-request"`.
5. **`fhirPathToPropertyName`**: `"Patient.name"` → `"name"`;
   `"Patient.contact.telecom"` → the correct property chain key
   per the source.
6. **`capitalizeFirst`**: `""` → `""`; `"a"` → `"A"`; `"Abc"` → `"Abc"`.

### Type mapping

7. **Every entry** in `FHIR_PRIMITIVE_TO_TS` is mapped via
   `fhirPrimitiveToTs`. Iterate over the map keys in a single
   `it.each([...])` and assert the round-trip lookup.
8. **Every entry** in `FHIR_COMPLEX_TO_TS` is recognized by
   `isComplexType` and mapped via `fhirComplexToTs`.
9. **`fhirTypeToTs`** dispatches correctly: a primitive key resolves
   via primitive map, a complex key via complex map, an unknown key
   throws or returns a documented default (match impl).
10. **`isPrimitive` / `isComplexType`** are mutually exclusive for
    every known key.
11. **`FHIR_SEARCH_PARAM_TYPE_TO_TS`** covers all 9 FHIR search-param
    types (`number`, `date`, `string`, `token`, `reference`,
    `composite`, `quantity`, `uri`, `special`) and maps each to a
    reasonable TS type. `searchParamTypeToTs("bogus")` throws or
    defaults — assert per impl.

### Logger

12. `new Logger("info")` admits `info`, `warn`, `error` but swallows
    `debug`.
13. `new Logger("debug")` admits every level.
14. `new Logger("silent")` swallows every level (if that level exists
    in `LOG_LEVELS`).
15. Logger output goes to the expected sink (`console.log` /
    `console.error`) — spy with `vi.spyOn(console, "log")`.
16. Logger methods are bind-safe — calling
    `const log = new Logger("info").info; log("x")` does not crash.

## Research directives

- FHIR primitive / complex type list:
  <https://www.hl7.org/fhir/R4/datatypes.html>.
- FHIR search param types:
  <https://www.hl7.org/fhir/R4/search.html#ptypes>.
- Kebab-case edge rules (camelHump vs acronym) — no single
  authoritative source; assert the **implementation's** behavior and
  capture the rule in the test description.

## Conventions

- vitest `globals: true`.
- Table-driven tests (`it.each([...])`) for the type maps — one row
  per key.
- `vi.spyOn(console, "log")` + `.mockImplementation(() => {})` for the
  logger tests; restore after each test.
- No `fs`, no `fetch`, no timers.

## Workflow

1. Read the source.
2. Write tests in `packages/utils/test/`:
   - `naming.test.ts`
   - `type-mapping.test.ts`
   - `logger.test.ts`
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 test (type-map tests can be parameterized).
- All three gates green.
- No source changes.

## Out of scope

- Adding new casing helpers or log levels.
- Internationalization of casing functions (the impl is ASCII-leaning;
  document what it does, don't fix it here).
