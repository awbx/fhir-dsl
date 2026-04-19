---
name: Edge-case pass — orthogonal review across all packages
description: (a) empty, (b) null/undefined/missing, (c) polymorphism (value[x]), (d) slicing, (e) Reference<T> narrowing, (f) choice in search, (g) Unicode/NFC
type: working-document
---

# Edge-case pass

Seven orthogonal edge-case families, static-read findings only, minimal repro per row.
Net-new findings beyond `fhirpath-challenge.md` + `rest-search-preread.md`.

Files inspected:
- `packages/fhirpath/src/eval/nav.ts`, `eval/operators.ts`, `eval/filtering.ts`, `builder.ts`
- `packages/generator/src/parser/profile.ts`, `parser/structure-definition.ts`, `parser/search-parameter.ts`
- `packages/types/src/datatypes.ts` (Reference definition)
- `packages/core/src/search-query-builder.ts`

---

## (a) Empty-collection propagation

### a.1 Comparison on multi-element collection silently picks `[0]`
`fhirpath/src/eval/operators.ts:80`:

```ts
const left = collection.length === 1 ? collection[0] : collection[0];
```

The ternary is a NO-OP. A 3-element collection `[1,2,3]` compared with `5` returns `[false]` (based on 1 vs 5), not an error. **Spec §5.6.1 requires `=`, `<`, `<=`, `>`, `>=` on non-singleton to be an error.** Already in fhirpath-challenge.md row #1; reinforced here.

**Repro:**
```ts
const obs = { resourceType: "Observation", code: { coding: [
  { code: "a" }, { code: "b" }, { code: "c" }
]}};
fp().code.coding.code.evaluate(obs); // returns ["a","b","c"] (OK)
// But comparing to a scalar:
fp().code.coding.code.equals("a").evaluate(obs);
// Returns [false] (based on "a"==="a"? no — based on left=["a","b","c"][0]="a" vs "a" ⇒ [true])
// Spec says: ERROR
```

### a.2 Missing-field vs empty-array: both collapse to `[]`
`eval/nav.ts:8-11`: `val == null` covers `undefined` and `null`, then `Array.isArray(val)` returns `val` (so `[]` propagates as `[]`). So after `.name`, a resource with `name: []` and a resource with no `name` field are indistinguishable. FHIR §2.1.26 ("Missing information") states: for elements, missing and empty-array MUST be semantically equal, but the DSL does NOT emit `[]` distinctly from `undefined` anywhere downstream, which is consistent. **No bug here; confirming spec-conformance.**

### a.3 `exists()` on `[null]` should be `true` per spec
`nav.ts:9`: `if (val == null) return [];` filters nulls BEFORE they enter the collection. So an array `[null, "x"]` becomes `["x"]`, meaning `collection.count()` returns 1 when spec says 2. **Spec §5.2.2 `exists()`: returns `true` if the collection is non-empty; a collection `{null}` IS non-empty in FHIRPath (null is a valid item).** The DSL implicitly filters nulls — loses information.

**Severity:** Medium. Not in fhirpath-challenge.md. Worth a test.

### a.4 `and`/`or`/`implies` use non-standard three-valued logic
Already covered in `fhirpath-challenge.md`. `toSingletonBoolean()` silently returns `undefined` for multi-element → should error. Cross-reference.

---

## (b) null / undefined / missing field coercion

### b.1 Literal JS `null` inside data is invisible
See a.3 above.

### b.2 `{}`-empty object treated as truthy/present by `exists()`
`nav.ts:8`: `if (item == null || typeof item !== "object") return []`. An empty object `{}` is typeof "object" and not null, so it flows through. Then `obj[prop]` is `undefined`, so `val == null` → returns `[]`. **Consistent with spec;** a resource `{ }` doesn't contribute children. OK.

### b.3 `FhirString` primitive extension: `_fieldName` sibling is ignored
Search and FHIRPath both navigate `obj[prop]` only. FHIR primitives can have a `_prop` sibling carrying `id`/`extension`. The DSL's `.name.family` never reaches `_family`. **Gap, not strict bug.** In search, `FhirString` primitives with only an extension (no `value`) are still present; search comparators would miss them.

**Severity:** Medium for FHIRPath (affects `extension` navigation on primitives), Low for search.

---

## (c) Polymorphism — `value[x]`

### c.1 FHIRPath `.value` on Observation returns `[]`
`eval/nav.ts:8` uses exact prop name. Observation has `valueQuantity`/`valueCodeableConcept` etc., not `value`. **Spec §6.3 of FHIR semantics:** `Observation.value` ≡ union of all `value[x]` variants via implicit polymorphic dispatch. The DSL does NOT do this.

**Repro:**
```ts
const obs = { resourceType: "Observation", valueQuantity: { value: 120 }};
fp<Observation>().value.evaluate(obs); // returns []  (should return [{value:120}])
fp<Observation>().valueQuantity.value.evaluate(obs); // returns [120]  (works)
```

The TypeScript-generated type only exposes `valueQuantity`, `valueCodeableConcept`, ... as separate fields (see `generator/src/parser/structure-definition.ts:149` `expandChoiceType`). So the DSL user MUST commit to one polymorphic variant statically — they cannot write `.value` at all.

**Severity:** High — blocks faithful FHIRPath expressions copied from CapabilityStatements, SearchParameter `expression`, etc.

**Spec impact:** The `expression` field on SearchParameter resources (e.g. `Observation.value.ofType(Quantity)`) is UNEXECUTABLE by this DSL. `parser/search-parameter.ts:66` stores the raw string but nothing evaluates it against resources.

### c.2 `ofType(Quantity)` duck-types — fragile
`eval/filtering.ts:5-20`: `Quantity` is matched by `"value" in obj && "unit" in obj`. But FHIR `Observation.component[].valueQuantity` is nested inside `component`, and the parent `component` dict also has `value`. A `component` with both `valueQuantity` and `code` would duck-match for *multiple* types:

```ts
const component = { code: {...}, valueQuantity: { value: 1, unit: "kg" } };
matchesType(component, "Quantity") // → false (no "value" at root; OK)
matchesType(component.valueQuantity, "Quantity") // → true
// But:
matchesType({ value: "string", unit: "x" }, "Quantity") // → true (wrong — should be Quantity?)
```

Also `Identifier`: `["system","value"]` → both keys also appear in `Coding`. A `Coding` duck-matches as `Identifier`. **Ambiguity is accepted silently.**

**Severity:** Medium. Not in challenge docs.

---

## (d) Slicing — profile generator drops `:` elements

### d.1 `suffix.includes(":")` → skip (parser/profile.ts:64)
`packages/generator/src/parser/profile.ts:64`:

```ts
// Skip sliced elements (e.g., "component:systolic") — they share the same property name
if (suffix.includes(":")) continue;
```

Concretely for US Core Patient profile with `Patient.identifier:MRN` slice:

- Profile SD has `Patient.identifier` (unconstrained) and `Patient.identifier:MRN` (sliced, `patternCodeableConcept` for `system = "http://hl7.org/fhir/sid/us-mrn"`, required, `min=1`).
- Parser skips the `:MRN` element entirely.
- Result: generated `USCorePatientProfile` has `identifier: Identifier[]` typed identically to base Patient. **No type narrowing; no const pattern; no required-ness on the MRN slice itself.**

**What concretely breaks in user code:**
```ts
const p: USCorePatient = {
  resourceType: "Patient",
  identifier: [],  // ← TS accepts this; US Core spec says MRN is REQUIRED
};
```

The profile offers zero enforcement beyond the base Patient. That's not a "narrowing"; that's an empty declaration. Cross-reference AUDIT.md "slicing not supported".

**Severity:** High. Breaks the value proposition of the profile generator for US Core / IPS / any IG that uses slicing.

### d.2 `fixed[x]` / `pattern[x]` also dropped
Even when `:` is not present, the parser does not read `fixedCode`, `fixedString`, `fixedUri`, `patternCodeableConcept` (seen as type fields in `FhirElementDefinition:20-24`) to narrow types. A slice like `Observation.code` with `patternCodeableConcept = {coding:[{system:"LOINC", code: "1234-5"}]}` should produce `code: CodeableConcept<"LOINC", "1234-5">` or similar literal type — the parser discards this.

**Severity:** High. Same impact class as d.1.

---

## (e) Reference<T> narrowing — cosmetic only

### e.1 `_T` is a phantom type parameter
`packages/types/src/datatypes.ts:204`:

```ts
export interface Reference<_T extends string = string> extends Element {
  reference?: FhirString;
  type?: FhirUri;
  identifier?: Identifier;
  display?: FhirString;
}
```

The leading underscore `_T` in TypeScript convention signals "unused". The body of `Reference` never uses `_T`. Therefore:

```ts
const ref: Reference<"Patient"> = { reference: "Practitioner/xyz" };  // ✓ accepted
const p: Reference<"Patient"> = { reference: "X" };
const pr: Reference<"Practitioner"> = p;  // ✓ accepted — structurally identical
```

**Test-d (repro, failing assertion):**
```ts
import { expectTypeOf } from "expect-type";
import type { Reference } from "@fhir-dsl/types";

// THIS SHOULD FAIL BUT PASSES:
expectTypeOf<Reference<"Patient">>().toMatchTypeOf<Reference<"Practitioner">>(); // ✓ passes
// Per the name, the above should be an ERROR — Patient ≠ Practitioner.
```

This confirms AUDIT.md's claim "Reference<T> narrowing is unused". The fix requires at minimum `type?: _T` or a branded type like `{ __refTarget?: _T }`.

**Severity:** High for type safety advertisement. Low for runtime (Reference.type is optional anyway per spec).

---

## (f) Choice types in search

### f.1 `Patient.deceased[x]` → `deceased` search param
FHIR R5 spec: `Patient.deceased` is `deceasedBoolean | deceasedDateTime`. The spec SearchParameter `Patient-deceased` has type `token` and `expression = "Patient.deceased.exists() and Patient.deceased != false"`. So the search param is boolean-typed (does a death date or `true` exist?).

The DSL's search-param model (`parser/search-parameter.ts:61-69`) stores `type: "token"` and the raw expression, but the query builder types `value: string | boolean` on token params. A user writing:

```ts
client.search("Patient").where("deceased", "eq", true)
```

…will serialize to URL `?deceased=true`. Spec says the server dispatches on the expression and will match both boolean-true and present-dateTime. OK on the wire.

But: the DSL offers no typed API for `deceased-date` (if a profile adds one as `:dateTime` narrowing). The choice-type-dispatch-for-search problem is silent because servers do the work, but the DSL's generated type `SearchParamFor<Patient>["deceased"]` gives `{ value: boolean }` — losing the ability to search on date bounds. Gap, not bug.

**Severity:** Low. Ergonomics hole.

### f.2 SearchParameter `expression` is stored but never consumed
`parser/search-parameter.ts:66`: `expression: sp.expression` is captured. Nothing in the codebase evaluates it. So the DSL cannot:
- Validate that user-supplied `.where("code", "eq", "X")` would match some server resource
- Generate client-side pre-filter (e.g., for an in-memory cache layer)

**Severity:** Low. Missing feature, not a bug.

---

## (g) Unicode / NFC in string params

### g.1 No `.normalize("NFC")` anywhere in fhirpath or core
Confirmed by ripgrep across `packages/fhirpath` and `packages/core`: zero hits for `normalize` / `NFC`.

FHIR R5 §2.1.20 and §3.1.1.5.3 (string search): **"All strings SHOULD be normalized to Unicode Normalization Form C (NFC) before comparison."**

**Repro for search:**
```ts
// Two strings look identical but are NOT byte-equal:
const nfc = "é";            // U+00E9 (single code point)
const nfd = "\u0065\u0301"; // "e" + combining acute (two code points)
nfc === nfd; // false

client.search("Patient").where("family", "eq", nfd);
// Serializes as raw bytes via URLSearchParams, never NFC'd.
// Server NFC's its stored value; query NFD; no match.
```

**Severity:** Medium. Causes silent no-matches when the user's string is in NFD (macOS filesystem default for some contexts, copy-pasted from HL7 examples, etc.).

### g.2 Emoji and supplementary planes
- `String.length` counts UTF-16 code units, not characters or bytes.
- `auto-POST` threshold at `search-query-builder.ts:678` uses `.length` — an emoji-heavy search (e.g., `patient.name.given = "🧑‍⚕️"`) occupies 7 UTF-16 units but ~13 UTF-8 bytes.
- `substring()` / `length()` in FHIRPath likely count code units; §5.6.2 says "characters". Needs test.

**Severity:** Medium. Already related to rest-search-preread §1.5.

### g.3 FHIRPath `@`-quoted string escapes
Not inspected here — defer to fhirpath-challenge.md.

---

## Summary table

| # | Edge case | File:line | Severity | In existing docs? |
|---|---|---|---|---|
| a.1 | `evalComparison` no-op ternary | fhirpath/eval/operators.ts:80 | High | Yes (fhirpath-challenge #1) |
| a.3 | Null inside collection silently dropped | fhirpath/eval/nav.ts:9 | Medium | NO — NEW |
| a.4 | `toSingletonBoolean` → undefined instead of error | fhirpath/eval/operators.ts:98 | High | Yes |
| b.3 | `_field` primitive-extension sibling ignored | fhirpath/eval/nav.ts:8 | Medium | NO — NEW |
| c.1 | `.value` on Observation returns [] (polymorphism unimplemented) | fhirpath/eval/nav.ts:8 | High | NO — NEW |
| c.2 | `ofType(Identifier)` duck-match collides with Coding | fhirpath/eval/filtering.ts:5 | Medium | NO — NEW |
| d.1 | Sliced elements skipped (`identifier:MRN`) | generator/parser/profile.ts:64 | High | Yes (AUDIT) |
| d.2 | `fixed[x]` / `pattern[x]` never narrow types | generator/parser/profile.ts:73 | High | Partial |
| e.1 | `Reference<T>` `_T` phantom → narrowing cosmetic | types/datatypes.ts:204 | High | Yes (AUDIT) |
| f.1 | `deceased[x]` → only boolean in typed API | generator/parser/search-parameter.ts | Low | NO — NEW |
| f.2 | SearchParameter `expression` stored but unused | generator/parser/search-parameter.ts:66 | Low | NO — NEW |
| g.1 | No NFC normalization before search/FHIRPath compare | (grep: zero hits) | Medium | NO — NEW |
| g.2 | Emoji/UTF-8: `.length` ≠ bytes in POST threshold + FHIRPath strings | core/search-query-builder.ts:678 | Medium | Partial |

**Net-new edge cases:** a.3, b.3, c.1, c.2, f.1, f.2, g.1. Seven items DocsEngineer should add to the Bug Report (task #16) and the Missing-Features list (task #15).

---

## Debate prompt for TestEngineer

Looking at `packages/fhirpath/test/spec-gaps.test.ts` (test-engineer's in-progress output):

**Question:** are tests written against normative spec §§ quotes, or against current implementation behavior?

Concrete challenges:
- Does `spec-gaps.test.ts` have a test that `3 > 1` on `[1,2,3]` raises, or does it merely assert `[true]` (current buggy behavior)?
- Does it cite spec text like `§5.6.1 "The built-in singleton evaluation of collections requires that the collection contain only one item"` inline?
- Does it test `.value` on Observation with `valueQuantity` returning `[{value: 120}]` (spec-correct for polymorphism) or `[]` (current behavior)?

If the tests merely lock in current behavior, they measure *consistency*, not *compliance*. Each failing test should include a `// Spec: §X.Y.Z` comment tying it to the rule it enforces.

---

**Status:** edge-case pass complete, 7 net-new items, ready for debate (task #13) and DocsEngineer consumption (tasks #15, #16).
