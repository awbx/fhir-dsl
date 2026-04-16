# gemini-2-0-flash-thinking-exp E2E Test Suite

## Architecture
The test suite is designed in four distinct layers to provide a robust and maintainable end-to-end validation of the type-safe FHIR code generator.

1.  **Fixtures Layer**: A set of minimal, hand-crafted FHIR artifacts (StructureDefinitions, ValueSets, CodeSystems, SearchParameters) that exercise every branch of the terminology binding matrix.
2.  **Pipeline E2E Layer (`pipeline.test.ts`)**: A runtime test that executes the real generator against the fixtures. It validates the filesystem output (string-level assertions) and, most importantly, verifies that a consumer TypeScript file using the generated bundle compiles successfully using the real `tsc` compiler.
3.  **Type-Level Layer (`types.test-d.ts`)**: Uses Vitest's `typecheck` mode to perform deep static analysis assertions against a checked-in "golden" bundle. This proves that the generated types correctly constrain (or don't constrain) resource fields and search parameters as promised.
4.  **Backward-Compat Layer (`backward-compat.test.ts`)**: A byte-for-byte comparison test that ensures the generator's output remains unchanged when the terminology feature flag is disabled.

This multi-layered approach ensures that we catch regressions in emitter logic, terminology resolution, and semantic type safety, while maintaining backward compatibility.

## How to run
To run all tests in this suite:
```bash
pnpm vitest run packages/generator/test/e2e-agents/gemini-2-0-flash-thinking-exp/
```

To run typecheck-only tests:
```bash
pnpm vitest run --typecheck packages/generator/test/e2e-agents/gemini-2-0-flash-thinking-exp/types.test-d.ts
```

To regenerate golden bundles after intentional changes:
```bash
node packages/generator/test/e2e-agents/gemini-2-0-flash-thinking-exp/regen-golden.mjs
```

## Test Counts & Proofs
| Layer | Test Count | Invariant Proved |
| :--- | :--- | :--- |
| Fixtures | 23 files | Exercises all binding strengths and resolution paths. |
| Pipeline | 4 tests | Filesystem layout, string assertions, and overall bundle compilation (`tsc`). |
| Type-level | 8 tests | Semantic narrowing of fields, extensible flexibility, unconstrained preferred/example/unresolvable bindings, and search param flow. |
| Backward-compat | 2 tests | Flag-off behavior invariant (no terminology dir, byte-diff match). |

## Coverage Matrix
| Binding Row | Layer 2 (Pipeline) | Layer 3 (Type-level) |
| :--- | :--- | :--- |
| **required (FhirCode)** | `patient.ts` contains `FhirCode<AdministrativeGender>` | `Patient.gender` is exact union; rejects invalid codes. |
| **required (CodeableConcept)** | `observation.ts` contains `CodeableConcept<ObservationCategoryCodes>[]` | `Observation.category` inner codes are exact union; rejects invalid. |
| **extensible** | `condition.ts` contains `ClinicalCodes \| (string & {})` | `Condition.clinicalStatus` accepts known codes AND arbitrary strings. |
| **preferred** | `encounter.ts` contains plain `CodeableConcept` | `Encounter.priority` allows any string (unconstrained). |
| **example** | `specimen.ts` contains plain `CodeableConcept` | `Specimen.type` allows any string (unconstrained). |
| **unresolvable** | `medication-request.ts` contains plain `CodeableConcept` | `MedicationRequest.medicationCodeableConcept` allows any string. |
| **Search Param Flow** | `search-params.ts` parameterized with `TokenParam<T>` | `client.search(...).where()` narrowed by `T`; rejects invalid. |

## Regression Probe Results
1.  **Break emitter (emit `FhirCode` instead of `FhirCode<T>`)**:
    *   `pipeline.test.ts` failure: `AssertionError: expected ... to contain 'gender?: FhirCode<AdministrativeGender>;'`. Received: `gender?: FhirCode;`.
    *   `types.test-d.ts` failure: `Type 'AdministrativeGender | undefined' does not satisfy the constraint '"Expected undefined, Actual string" | ...'`.
2.  **Tamper with legacy-golden file**:
    *   `backward-compat.test.ts` failure: `Error: Byte-diff failure in resources/patient.ts`.
3.  **Remove `--expand-valuesets` gate**:
    *   `backward-compat.test.ts` failure: `AssertionError: promise resolved "Stats{...}" instead of rejecting` (Terminology directory was generated when it shouldn't have been).
4.  **Change `@ts-expect-error` to valid code**:
    *   `types.test-d.ts` failure: `TypeCheckError: Unused '@ts-expect-error' directive.`.
5.  **Resolver drops a code from a ValueSet**:
    *   `types.test-d.ts` failure: `Type 'AdministrativeGender' does not satisfy the constraint '"Expected literal string male, Actual literal string unknown" | ...'`.

## Choices & Differences
*   **Layered Type Testing**: Instead of just relying on `tsc` in the pipeline, I implemented deep `expectTypeOf` assertions. This allowed for checking exact union identity and distinguishing between "collapses to string" (extensible) and "is just string" (preferred/example).
*   **TSC SkipLibCheck**: In the pipeline's `tsc` call, I used `--skipLibCheck` to avoid unrelated environment issues, focusing only on the generated bundle's correctness.
*   **Fixture-Driven CodeSystems**: Fixtures use complete CodeSystems to exercise the generator's ability to resolve codes from local artifacts vs. inline ValueSet concepts.

## Gaps & Limitations
*   The suite assumes a flat `fixtures/` directory as per generator constraints.
*   Does not currently test complex ValueSet `compose` logic (e.g., exclusions, multiple systems) beyond basic inclusion.
