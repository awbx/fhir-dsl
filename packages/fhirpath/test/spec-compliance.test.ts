/**
 * FHIRPath N1 spec-compliance test suite.
 *
 * Every test cites an FP-* rule ID from audit/spec/fhirpath-n1-rules.md, and
 * where the implementation has both a compile-string path and a runtime-eval
 * path, both are asserted.
 *
 * Test shapes:
 *   - it(...)           — passes today; locks in correct behavior.
 *   - test.fails(...)   — rule is IMPLEMENTED but spec-incorrect; the assertion
 *                         describes the SPEC-REQUIRED result, so the Vitest
 *                         runner reports "pass" only if the DSL is fixed.
 *   - it.todo(...)      — rule is MISSING; there is no code path to test.
 *
 * IMPORTANT: Do NOT weaken assertions to silence a failure. If a
 * test.fails() starts passing because the bug is fixed, flip it to
 * `it(...)` and remove the test.fails wrapper.
 *
 * Sources:
 *   audit/spec/fhirpath-n1-rules.md       — rule IDs + spec quotes
 *   audit/impl/fhirpath-impl-map.md       — file:line citations for each rule
 */

import { describe, expect, it, test, vi } from "vitest";
import { fhirpath } from "../src/builder.js";
import { evalFiltering } from "../src/eval/filtering.js";
import { evalOperator } from "../src/eval/operators.js";
import { evaluate } from "../src/evaluator.js";
import type { PathOp } from "../src/ops.js";
import type { TestPatient } from "../src/test-types.js";

const makeCtx = () => ({ rootResource: null, evaluateSub: evaluate });

function fp() {
  return fhirpath<TestPatient>("Patient");
}

const patientOneName: TestPatient = {
  resourceType: "Patient",
  name: [{ use: "official", family: "Smith", given: ["Alice"] }],
};

const patientMultipleNames: TestPatient = {
  resourceType: "Patient",
  name: [
    { use: "official", family: "Smith", given: ["Alice", "A."] },
    { use: "usual", family: "Jones", given: ["Bob"] },
  ],
};

const patientNoName: TestPatient = { resourceType: "Patient" };

/* -------------------------------------------------------------------------- */
/* 1. Navigation (§3)                                                         */
/* -------------------------------------------------------------------------- */

describe("Navigation (FP-NAV-*)", () => {
  it("FP-NAV-001: path composition selects labelled nodes across the tree", () => {
    const expr = fp().name.given;
    expect(expr.compile()).toBe("Patient.name.given");
    expect(expr.evaluate(patientMultipleNames)).toEqual(["Alice", "A.", "Bob"]);
  });

  it("FP-NAV-001: unknown property returns empty collection, not error", () => {
    const expr = (fp() as any).nonexistent;
    expect(expr.evaluate(patientOneName)).toEqual([]);
  });

  it("FP-NAV-002: missing member returns empty collection (never null/undefined)", () => {
    const result = fp().name.evaluate(patientNoName);
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).not.toContain(null);
    expect(result).not.toContain(undefined);
  });

  it("FP-NAV-003: a step on a collection flattens the results", () => {
    const result = fp().name.given.evaluate(patientMultipleNames);
    expect(result).toEqual(["Alice", "A.", "Bob"]);
    expect(result.every((v) => typeof v === "string")).toBe(true);
  });

  it("FP-NAV-004: empty propagation — function on empty returns empty", () => {
    const expr = fp().name.given.upper();
    expect(expr.evaluate(patientNoName)).toEqual([]);
  });

  it("FP-NAV-004: empty propagation — does NOT throw on empty input", () => {
    const expr = fp().name.family.upper();
    expect(() => expr.evaluate(patientNoName)).not.toThrow();
  });

  /**
   * FP-NAV-005 / FP-CMP-002 — Singleton evaluation must error when the
   * collection has >1 items in a single-input operator context
   * (spec §4.5). Impl at eval/operators.ts:98-103 silently returns
   * `undefined` → empty.  Impl at operators.ts:80 has the dead-ternary
   * `collection.length === 1 ? collection[0] : collection[0]` that
   * silently uses the first item for multi-element left operands.
   */
  test.fails("FP-NAV-005: multi-element collection in boolean context throws (spec §4.5)", () => {
    // Mimic `and` on a multi-element collection: dispatch evalOperator
    // directly so we exercise toSingletonBoolean for the left operand.
    const op: PathOp = {
      type: "and",
      other: { ops: [{ type: "literal", value: true }], compiledPath: "true" },
    };
    const multiBoolInput = [true, true];
    // Spec §4.5: must signal error. Impl returns [] silently.
    expect(() => evalOperator(op, multiBoolInput, makeCtx())).toThrow();
  });

  test.fails("FP-CMP-002: `=` on multi-element left operand errors (spec §4.5)", () => {
    const op: PathOp = { type: "eq", value: "Smith" };
    const multiLeft = ["Jones", "Smith"];
    expect(() => evalOperator(op, multiLeft, makeCtx())).toThrow();
  });
});

/* -------------------------------------------------------------------------- */
/* 2. Indexer (§5.3.1)                                                        */
/* -------------------------------------------------------------------------- */

describe("Indexer (FP-IDX-*)", () => {
  it.todo("FP-IDX-001: bracket indexer `name[0]` compiles + evaluates (currently MISSING as surface)");

  it("FP-IDX-001 (gap pin): numeric-string property access compiles to invalid `.0` path", () => {
    // The Proxy default-nav path treats `"0"` as a property name and emits
    // `Patient.name.0` — invalid FHIRPath and, at runtime, navigates into
    // each name object looking for a `"0"` key which doesn't exist.
    const expr = (fp().name as any)["0"];
    expect(expr.compile()).toBe("Patient.name.0");
    expect(expr.evaluate(patientMultipleNames)).toEqual([]);
  });

  it.todo("FP-IDX-002: zero-based indexer — MISSING (no surface)");
});

/* -------------------------------------------------------------------------- */
/* 3. Filtering & projection (§5.2)                                           */
/* -------------------------------------------------------------------------- */

describe("Filtering & projection (FP-SEL-*)", () => {
  it("FP-SEL-001: where() filters elements whose predicate yields true", () => {
    const expr = fp().name.where(($this: any) => $this.use.eq("official")).family;
    expect(expr.compile()).toBe("Patient.name.where($this.use = 'official').family");
    expect(expr.evaluate(patientMultipleNames)).toEqual(["Smith"]);
  });

  it("FP-SEL-001: elements where predicate yields empty are excluded", () => {
    // Predicate references a non-existent field — yields [] — element excluded.
    const expr = fp().name.where(($this: any) => $this.nonexistent.eq("x")).family;
    expect(expr.evaluate(patientMultipleNames)).toEqual([]);
  });

  test.fails("FP-SEL-001: legacy where(field, value) must escape single quotes in value", () => {
    // Impl (builder.ts:105) template-interpolates `value` without escaping:
    //   Patient.name.where(family = 'O'Brien')  ← broken FHIRPath.
    // Spec-correct output: 'O\\'Brien' (backslash-escape) or 'O''Brien'
    // (doubled-quote escape). The assertion demands the literal escape
    // sequence; plain "O'Brien" must not satisfy it.
    const expr = (fp().name as any).where("family", "O'Brien");
    const compiled = expr.compile() as string;
    expect(compiled.includes("O\\'Brien") || compiled.includes("O''Brien")).toBe(true);
  });

  it("FP-SEL-002: select() flattens multi-element projections", () => {
    const expr = fp().name.select(($this: any) => $this.given);
    expect(expr.compile()).toBe("Patient.name.select($this.given)");
    expect(expr.evaluate(patientMultipleNames)).toEqual(["Alice", "A.", "Bob"]);
  });

  it("FP-SEL-003: repeat() terminates on finite tree input", () => {
    // DSL repeat uses a Set<unknown>-based seen guard with reference-identity,
    // so cycle termination is correct for any shared-object cycle. Here we
    // verify the happy-path walk completes and yields the projected items.
    // Use a non-clashing field name: the predicate proxy binds `.contains`
    // to the STRING contains() op, so we walk `.items` instead.
    const data = {
      resourceType: "Tree",
      items: [
        { id: "a", items: [{ id: "a1", items: [] }] },
        { id: "b", items: [] },
      ],
    };
    const expr = fhirpath<any>("Tree").items.repeat(($this: any) => $this.items);
    const result = expr.evaluate(data);
    expect(Array.isArray(result)).toBe(true);
    // Input items are a/b; repeat visits their nested `items` (a1 only).
    expect(result.map((r: any) => r.id)).toEqual(["a1"]);
  });

  it("FP-SEL-004: ofType() filters by type-name on complex types (TYPE_CHECKS map)", () => {
    const obs = {
      resourceType: "Observation",
      contained: [
        { resourceType: "Patient", id: "p1" },
        { resourceType: "Practitioner", id: "pr1" },
      ],
    };
    const expr = fhirpath<any>("Observation").contained.ofType("Patient");
    expect(expr.compile()).toBe("Observation.contained.ofType(Patient)");
    expect(expr.evaluate(obs)).toEqual([{ resourceType: "Patient", id: "p1" }]);
  });

  it("FP-SEL-004b: ofType(Identifier) does not match Coding/ContactPoint (BUG-009)", () => {
    const data = {
      resourceType: "X",
      items: [
        { system: "http://loinc.org", code: "8480-6" }, // Coding
        { system: "phone", value: "+1-555-0100", use: "mobile" }, // ContactPoint
        { system: "http://hospital.example/mrn", value: "12345" }, // Identifier
      ],
    };
    const ids = fhirpath<any>("X").items.ofType("Identifier").evaluate(data);
    expect(ids).toEqual([{ system: "http://hospital.example/mrn", value: "12345" }]);
    const cps = fhirpath<any>("X").items.ofType("ContactPoint").evaluate(data);
    expect(cps).toEqual([{ system: "phone", value: "+1-555-0100", use: "mobile" }]);
    const codings = fhirpath<any>("X").items.ofType("Coding").evaluate(data);
    expect(codings).toEqual([{ system: "http://loinc.org", code: "8480-6" }]);
  });

  test.fails("FP-SEL-004: ofType() must not use hardcoded duck-type map (spec §5.2.4 requires StructureDefinition-driven)", () => {
    // TYPE_CHECKS has 14 entries; Duration/Age/Count/etc. are MISSING.
    // Spec says "all items that are of the given type or subclass".
    const bundle = {
      resourceType: "Bundle",
      entry: [{ resource: { value: 12, code: "h" } }, { resource: { value: 3, unit: "kg" } }],
    };
    const expr = fhirpath<any>("Bundle")
      .entry.select(($this: any) => $this.resource)
      .ofType("Duration");
    // Spec-correct: should match the entry whose shape is Duration per
    // FHIR StructureDefinition. Current impl: Duration not in TYPE_CHECKS,
    // returns [] for everything.
    expect(expr.evaluate(bundle)).not.toEqual([]);
  });
});

/* -------------------------------------------------------------------------- */
/* 4. Subsetting (§5.3)                                                       */
/* -------------------------------------------------------------------------- */

describe("Subsetting (FP-SUB-*)", () => {
  it("FP-SUB-001: single() returns the item when exactly one", () => {
    expect(fp().name.single().evaluate(patientOneName)).toEqual([
      { use: "official", family: "Smith", given: ["Alice"] },
    ]);
  });

  it("FP-SUB-001: single() on empty input returns empty", () => {
    expect(fp().name.single().evaluate(patientNoName)).toEqual([]);
  });

  it("FP-SUB-001: single() on multi-item input throws", () => {
    expect(() => fp().name.single().evaluate(patientMultipleNames)).toThrow();
  });

  it("FP-SUB-002: first() returns empty on empty input, not error", () => {
    expect(fp().name.first().evaluate(patientNoName)).toEqual([]);
  });

  it("FP-SUB-003: last() returns last item preserving input order", () => {
    expect(fp().name.family.last().evaluate(patientMultipleNames)).toEqual(["Jones"]);
  });

  it("FP-SUB-004: tail() on single-item input returns empty", () => {
    expect(fp().name.tail().evaluate(patientOneName)).toEqual([]);
  });

  it("FP-SUB-005: skip(2) drops the first 2 items", () => {
    const expr = fhirpath<any>("X").items.skip(2);
    const data = { resourceType: "X", items: [1, 2, 3, 4, 5] };
    expect(expr.evaluate(data)).toEqual([3, 4, 5]);
  });

  test.fails("FP-SUB-005: skip(-1) returns input unchanged (spec §5.3.6: num ≤ 0 → input as-is)", () => {
    // Impl: eval/subsetting.ts:21-22 uses `arr.slice(-1)` which returns last element.
    const expr = fhirpath<any>("X").items.skip(-1);
    const data = { resourceType: "X", items: [1, 2, 3] };
    expect(expr.evaluate(data)).toEqual([1, 2, 3]);
  });

  it("FP-SUB-006: take(0) returns empty", () => {
    const expr = fhirpath<any>("X").items.take(0);
    const data = { resourceType: "X", items: [1, 2, 3] };
    expect(expr.evaluate(data)).toEqual([]);
  });

  test.fails("FP-SUB-006: take(-1) returns empty (spec §5.3.7: num ≤ 0 → empty)", () => {
    // Impl: eval/subsetting.ts:24-25 uses `arr.slice(0, -1)` which returns all but last.
    const expr = fhirpath<any>("X").items.take(-1);
    const data = { resourceType: "X", items: [1, 2, 3] };
    expect(expr.evaluate(data)).toEqual([]);
  });

  test.fails("FP-SUB-007: intersect() eliminates duplicates in result (spec §5.3.8)", () => {
    const data = { resourceType: "X", a: [1, 1, 2, 3], b: [1, 2] };
    const expr = fhirpath<any>("X").a.intersect(fhirpath<any>("X").b);
    // Spec: duplicates eliminated; result should be [1, 2] not [1, 1, 2].
    expect(expr.evaluate(data).sort()).toEqual([1, 2]);
  });

  it("FP-SUB-008: exclude() preserves duplicates and order", () => {
    const data = { resourceType: "X", a: [1, 2, 3, 2, 1], b: [2] };
    const expr = fhirpath<any>("X").a.exclude(fhirpath<any>("X").b);
    expect(expr.evaluate(data)).toEqual([1, 3, 1]);
  });
});

/* -------------------------------------------------------------------------- */
/* 5. Combining (§5.4)                                                        */
/* -------------------------------------------------------------------------- */

describe("Combining (FP-COM-*)", () => {
  test.fails("FP-COM-001: union() eliminates duplicates within the INPUT collection too (spec §5.4.1)", () => {
    // Impl (eval/combining.ts:8-17) only dedups items from `other` against
    // `result`; it never dedups the input collection against itself. Spec:
    // "merge the two collections ... eliminating any duplicate values".
    // Input [1,1,2,3] ∪ [2,3] should yield [1,2,3]; impl yields [1,1,2,3].
    const data = { resourceType: "X", a: [1, 1, 2, 3], b: [2, 3] };
    const expr = fhirpath<any>("X").a.union(fhirpath<any>("X").b);
    expect([...expr.evaluate(data)].sort()).toEqual([1, 2, 3]);
  });

  it("FP-COM-001: union() dedups items from the `other` collection", () => {
    // Pre-deduped input + overlapping other → correct dedup on the other side.
    const data = { resourceType: "X", a: [1, 2], b: [2, 2, 3] };
    const expr = fhirpath<any>("X").a.union(fhirpath<any>("X").b);
    expect([...expr.evaluate(data)].sort()).toEqual([1, 2, 3]);
  });

  it("FP-COM-002: combine() concatenates without dedup", () => {
    const data = { resourceType: "X", a: [1, 2], b: [2, 3] };
    const expr = fhirpath<any>("X").a.combine(fhirpath<any>("X").b);
    expect(expr.evaluate(data)).toEqual([1, 2, 2, 3]);
  });

  it("FP-COM-003: distinct() removes duplicates", () => {
    const data = { resourceType: "X", a: [1, 1, 2, 2, 3] };
    const expr = fhirpath<any>("X").a.distinct();
    expect(expr.evaluate(data)).toEqual([1, 2, 3]);
  });

  it("FP-COM-004: isDistinct() returns true when all items unique", () => {
    const data = { resourceType: "X", a: [1, 2, 3] };
    expect(fhirpath<any>("X").a.isDistinct().evaluate(data)).toEqual([true]);
  });

  it("FP-COM-004: isDistinct() returns false when duplicates present", () => {
    const data = { resourceType: "X", a: [1, 1, 2] };
    expect(fhirpath<any>("X").a.isDistinct().evaluate(data)).toEqual([false]);
  });
});

/* -------------------------------------------------------------------------- */
/* 6. Existence (§5.1)                                                        */
/* -------------------------------------------------------------------------- */

describe("Existence (FP-EXI-*)", () => {
  it("FP-EXI-001: empty() on no-name Patient returns [true]", () => {
    expect(fp().name.empty().evaluate(patientNoName)).toEqual([true]);
  });

  it("FP-EXI-001: empty() on Patient with names returns [false]", () => {
    expect(fp().name.empty().evaluate(patientOneName)).toEqual([false]);
  });

  it("FP-EXI-002: exists() returns [false] (not {}) on no-name Patient", () => {
    expect(fp().name.exists().evaluate(patientNoName)).toEqual([false]);
  });

  it("FP-EXI-002: exists(criteria) is shorthand for where(criteria).exists()", () => {
    const result = fp()
      .name.exists(($this: any) => $this.use.eq("usual"))
      .evaluate(patientMultipleNames);
    expect(result).toEqual([true]);
  });

  /**
   * decisions.md FP.8 / edge-case a.3 — spec §5.2.2: the collection
   * `{null, item}` has TWO positional slots and `count()` MUST report
   * `[2]` everywhere it is observable. Impl at `eval/nav.ts:7` drops
   * null *items* from the input collection before any per-item logic
   * (`if (item == null || typeof item !== "object") return []`).
   *
   * `children()` at `nav.ts:13` correctly includes null children of a
   * single resource (val === null returns `[]`, but val === an array
   * containing null is passed through the flatMap unchanged). The bug
   * surfaces one hop later: iterating a collection that contains a
   * null slot — here by chaining `children()` off of `children()`.
   *
   * Setup: a synthetic root with `outer: [null, { inner: "x" }]`. The
   * FIRST `children()` call yields `[null, {inner:"x"}]` — 2 items.
   * The SECOND `children()` drops the null at line 7 and descends only
   * into `{inner:"x"}`, yielding `["x"]`. The outer 2-slot count is
   * lost because the second step cannot see the null's positional
   * identity.
   *
   * Spec-correct behavior: chained navigation through a null slot must
   * contribute empty per-item (§5.1 empty-propagation) WITHOUT deleting
   * the slot itself from the traversal path. Concretely, on this input
   *   children().children().count()
   * must be `[1]` today (only "x" is reachable) — this IS what impl
   * returns. So `count()` isn't the falsifiable hook.
   *
   * The falsifiable hook: count() OF THE INTERMEDIATE layer. We ask
   *   children().count()
   * on `{ resourceType: "X", outer: [null, { inner: "x" }] }` and
   * expect [3] (the "X" string + the two outer slots). Impl: nav.ts
   * processes outer's array-value verbatim because the `val == null`
   * guard is on the scalar value, not array elements. So `children()`
   * returns ["X", null, {inner:"x"}] — length 3 — and count() is [3].
   * That matches spec; the count-based test is not falsifiable either.
   *
   * Final working hook: use `.where($this = {})` (identity predicate)
   * to traverse the collection via per-item evaluation. This routes
   * through the same null-item drop at nav.ts:7 inside `evalSub`
   * dispatch for the predicate context, making the null slot disappear
   * from the traversal whereas spec-correct behavior evaluates the
   * predicate on the null and includes it if the result is `{}` per
   * §5.2.1 (the implicit `.where()` filter semantics).
   *
   * Pragmatic choice: since every reachable chained form coincidentally
   * converges back on spec-correct output due to JavaScript's flatMap
   * + null handling, we pin the contract as an `it.todo` with the test
   * shape the fix author must satisfy. A future `FhirPathEvaluator`
   * with an explicit null-slot marker (e.g. a `FHIRPathNull` sentinel)
   * will make this falsifiable.
   */
  it.todo(
    "FP-EXI-010 / decisions.md FP.8: explicit-null positional slots are preserved across chained navigation (spec §5.2.2) — needs a FHIRPathNull sentinel to be falsifiable",
  );

  it("FP-EXI-003: all() on empty input returns [true] (vacuous truth)", () => {
    const expr = fp().name.all(($this: any) => $this.use.eq("official"));
    expect(expr.evaluate(patientNoName)).toEqual([true]);
  });

  it("FP-EXI-004: allTrue() on empty collection returns [true] (spec §5.1.4)", () => {
    const data = { resourceType: "X", items: [] as boolean[] };
    expect(fhirpath<any>("X").items.allTrue().evaluate(data)).toEqual([true]);
  });

  it("FP-EXI-004: allTrue() on [true, true] returns [true]", () => {
    const data = { resourceType: "X", items: [true, true] };
    expect(fhirpath<any>("X").items.allTrue().evaluate(data)).toEqual([true]);
  });

  it("FP-EXI-004: allTrue() on [true, false] returns [false]", () => {
    const data = { resourceType: "X", items: [true, false] };
    expect(fhirpath<any>("X").items.allTrue().evaluate(data)).toEqual([false]);
  });

  it("FP-EXI-005: anyTrue() on empty returns [false]", () => {
    const data = { resourceType: "X", items: [] as boolean[] };
    expect(fhirpath<any>("X").items.anyTrue().evaluate(data)).toEqual([false]);
  });

  it("FP-EXI-006: allFalse() on empty collection returns [true] (spec §5.1.6)", () => {
    const data = { resourceType: "X", items: [] as boolean[] };
    expect(fhirpath<any>("X").items.allFalse().evaluate(data)).toEqual([true]);
  });

  it("FP-EXI-007: anyFalse() on [true, true] returns [false]", () => {
    const data = { resourceType: "X", items: [true, true] };
    expect(fhirpath<any>("X").items.anyFalse().evaluate(data)).toEqual([false]);
  });

  it("FP-EXI-008: subsetOf() returns [true] when all input items are in other", () => {
    const data = { resourceType: "X", a: [1, 2], b: [1, 2, 3] };
    const expr = fhirpath<any>("X").a.subsetOf(fhirpath<any>("X").b);
    expect(expr.evaluate(data)).toEqual([true]);
  });

  it("FP-EXI-009: supersetOf() returns [true] when input contains all of other", () => {
    const data = { resourceType: "X", a: [1, 2, 3], b: [1, 2] };
    const expr = fhirpath<any>("X").a.supersetOf(fhirpath<any>("X").b);
    expect(expr.evaluate(data)).toEqual([true]);
  });

  it("FP-EXI-010: count() on empty returns [0]", () => {
    expect(fp().name.count().evaluate(patientNoName)).toEqual([0]);
  });

  it("FP-EXI-010: count() on multi-item collection returns correct length", () => {
    expect(fp().name.count().evaluate(patientMultipleNames)).toEqual([2]);
  });
});

/* -------------------------------------------------------------------------- */
/* 7. Boolean logic (§6.5)                                                    */
/* -------------------------------------------------------------------------- */

describe("Boolean logic (FP-LOG-*)", () => {
  // Drive boolean logic through the predicate surface (where-clause).
  // and/or/xor/implies live in predicate/operators.ts space.

  it("FP-LOG-001: and truth table — T and T = T", () => {
    const result = fp()
      .name.where(($this: any) => $this.use.eq("official").and($this.family.eq("Smith")))
      .evaluate(patientOneName);
    expect(result.length).toBe(1);
  });

  it("FP-LOG-001: and truth table — T and F = F", () => {
    const result = fp()
      .name.where(($this: any) => $this.use.eq("official").and($this.family.eq("NOPE")))
      .evaluate(patientOneName);
    expect(result.length).toBe(0);
  });

  it("FP-LOG-001: and truth table — F and X = F (dominance)", () => {
    // Short-circuit check: right side isn't observable through public API,
    // so we just check that F-left always excludes.
    const result = fp()
      .name.where(($this: any) => $this.family.eq("NOPE").and($this.use.eq("official")))
      .evaluate(patientOneName);
    expect(result.length).toBe(0);
  });

  it("FP-LOG-002: or truth table — T or X = T", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("Smith").or($this.family.eq("NOPE")))
      .evaluate(patientOneName);
    expect(result.length).toBe(1);
  });

  it("FP-LOG-002: or truth table — F or F = F", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("A").or($this.family.eq("B")))
      .evaluate(patientOneName);
    expect(result.length).toBe(0);
  });

  it("FP-LOG-004: xor — T xor F = T", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("Smith").xor($this.family.eq("NOPE")))
      .evaluate(patientOneName);
    expect(result.length).toBe(1);
  });

  it("FP-LOG-004: xor — T xor T = F", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("Smith").xor($this.family.eq("Smith")))
      .evaluate(patientOneName);
    expect(result.length).toBe(0);
  });

  it("FP-LOG-005: implies — F implies X = T (the asymmetry)", () => {
    // F implies X is always T, including F implies {} which must be T (spec table).
    const result = fp()
      .name.where(($this: any) => $this.family.eq("NOPE").implies($this.family.eq("X")))
      .evaluate(patientOneName);
    expect(result.length).toBe(1);
  });

  it("FP-LOG-003: predicate .not() on true singleton returns false", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("Smith").not())
      .evaluate(patientOneName);
    expect(result.length).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* 8. Equality & equivalence (§6.1)                                           */
/* -------------------------------------------------------------------------- */

describe("Equality (FP-EQ-*)", () => {
  it("FP-EQ-001: basic string equality on singleton scalar", () => {
    const result = fp()
      .name.where(($this: any) => $this.family.eq("Smith"))
      .evaluate(patientOneName);
    expect(result.length).toBe(1);
  });

  test.fails("FP-EQ-001: partial-precision dates — '@2012' = '@2012-01-15' yields [] (spec §6.1)", () => {
    // Current impl (eval/operators.ts:6-7) uses JS ===:
    //   "2012" === "2012-01-15" → false; produces [false].
    // Spec: partial-precision comparison → empty.
    const op: PathOp = { type: "eq", value: "2012-01-15" };
    expect(evalOperator(op, ["2012"], makeCtx())).toEqual([]);
  });

  it("FP-EQ-001: Quantity equality by value+unit (not reference) (spec §6.1)", () => {
    const q1 = { value: 120, unit: "mg" };
    const q2 = { value: 120, unit: "mg" };
    const op: PathOp = { type: "eq", value: q2 };
    expect(evalOperator(op, [q1], makeCtx())).toEqual([true]);
  });

  it.todo("FP-EQ-003: ~ (equivalence) operator — MISSING");
  it.todo("FP-EQ-004: !~ operator — MISSING");
});

/* -------------------------------------------------------------------------- */
/* 9. Comparison (§6.2)                                                       */
/* -------------------------------------------------------------------------- */

describe("Comparison (FP-CMP-*)", () => {
  it("FP-CMP-001: comparison with empty left returns empty", () => {
    const op: PathOp = { type: "lt", value: 5 };
    expect(evalOperator(op, [], makeCtx())).toEqual([]);
  });

  it("FP-CMP-001: numeric lt works on integers", () => {
    const op: PathOp = { type: "lt", value: 5 };
    expect(evalOperator(op, [3], makeCtx())).toEqual([true]);
    expect(evalOperator(op, [7], makeCtx())).toEqual([false]);
  });

  test.fails("FP-CMP-001: partial-precision date comparison yields empty (spec §6.2)", () => {
    const op: PathOp = { type: "lt", value: "2020-01" };
    // "2020" < "2020-01" via JS string compare → true. Spec requires [].
    expect(evalOperator(op, ["2020"], makeCtx())).toEqual([]);
  });

  it.todo("FP-CMP-003: Quantity comparison with UCUM conversion — MISSING");
});

/* -------------------------------------------------------------------------- */
/* 10. Math operators (§6.6) — ALL MISSING as binary operators                */
/* -------------------------------------------------------------------------- */

describe("Math operators (FP-MATH-*) — MISSING", () => {
  it.todo("FP-MATH-001: integer addition `1 + 2 = 3`");
  it.todo("FP-MATH-001: subtraction / multiplication / division");
  it.todo("FP-MATH-002: div (integer division) returns empty on div-by-zero");
  it.todo("FP-MATH-003: div operator");
  it.todo("FP-MATH-004: mod operator returns empty on zero modulus");
  it.todo("FP-MATH-005: `&` string concatenation with empty-as-empty-string");
  it.todo("FP-MATH-006: Quantity arithmetic with UCUM");
  it.todo("FP-MATH-007: unary plus / minus");
});

/* -------------------------------------------------------------------------- */
/* 11. Collection operators (§6.3) — mostly MISSING                           */
/* -------------------------------------------------------------------------- */

describe("Collection operators (FP-COL-*)", () => {
  it.todo("FP-COL-001: `|` pipe-operator as literal FHIRPath syntax");
  it.todo("FP-COL-002: `in` operator (collection membership)");
  it.todo("FP-COL-003: list-form `contains` (inverted `in`)");
});

/* -------------------------------------------------------------------------- */
/* 12. Type operators (§6.4)                                                  */
/* -------------------------------------------------------------------------- */

describe("Type operators (FP-TYP-*)", () => {
  test.fails("FP-TYP-001: `is` on empty collection returns empty (spec §6.4)", () => {
    // Impl: eval/operators.ts:65-66 returns `[collection.length === 1 && matchesType(...)]`.
    // For empty input this is [false]; spec requires [].
    const op: PathOp = { type: "is", typeName: "string" };
    expect(evalOperator(op, [], makeCtx())).toEqual([]);
  });

  test.fails("FP-TYP-001: `is` on multi-element collection errors (spec §4.5)", () => {
    const op: PathOp = { type: "is", typeName: "string" };
    expect(() => evalOperator(op, ["a", "b"], makeCtx())).toThrow();
  });

  it("FP-TYP-002: `as` passes matching items through", () => {
    const op: PathOp = { type: "as", typeName: "string" };
    expect(evalOperator(op, ["a"], makeCtx())).toEqual(["a"]);
  });

  test.fails("FP-TYP-003: `System.String` namespace prefix recognised (spec §6.4.1)", () => {
    // matchesType at operators.ts:105-126 only handles bare names.
    const op: PathOp = { type: "is", typeName: "System.String" };
    expect(evalOperator(op, ["hello"], makeCtx())).toEqual([true]);
  });

  test.fails("FP-TYP-004: `is`/`as` and `ofType` use the SAME type-check resolver", () => {
    // Impl has TWO separate matchesType functions:
    //   operators.ts:105-126 (for is/as) — no TYPE_CHECKS.
    //   filtering.ts:68-100 (for ofType) — uses TYPE_CHECKS with duck-typing.
    // Spec: one canonical type resolution.
    const item = { value: 1, unit: "mg" };
    const isOp: PathOp = { type: "is", typeName: "Quantity" };
    const ofTypeOp: PathOp = { type: "ofType", typeName: "Quantity" };
    // is says [false] (no resourceType match); ofType says [item] (duck-match).
    // Spec-correct: both must agree. Assert `is` returns [true] to match `ofType`.
    expect(evalOperator(isOp, [item], makeCtx())).toEqual([true]);
    expect(evalFiltering(ofTypeOp as any, [item], makeCtx())).toEqual([item]);
  });
});

/* -------------------------------------------------------------------------- */
/* 13. Tree navigation (§5.8)                                                 */
/* -------------------------------------------------------------------------- */

describe("Tree navigation (FP-TREE-*)", () => {
  it("FP-TREE-001: children() returns all child elements", () => {
    const expr = fp().children();
    expect(expr.compile()).toBe("Patient.children()");
    const result = expr.evaluate(patientOneName);
    // Child elements include `resourceType` string and `name` array items.
    expect(result.length).toBeGreaterThan(0);
  });

  it("FP-TREE-002: descendants() walks a finite tree to leaves", () => {
    // Positive pin for the acyclic case. The cycle-termination bug
    // (no visited Set in eval/nav.ts:22-36) is documented separately in
    // audit/impl/fhirpath-impl-map.md and the bug report — running a
    // cyclic-object test here would hang the suite since there is no
    // user-surface timeout primitive on evaluate().
    const tree = {
      resourceType: "X",
      items: [{ id: "a", items: [{ id: "a1" }] }, { id: "b" }],
    };
    const expr = fhirpath<any>("X").descendants();
    const result = expr.evaluate(tree);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    const ids = result.filter((r: any) => r != null && typeof r === "object" && "id" in r).map((r: any) => r.id);
    expect(ids.sort()).toEqual(["a", "a1", "b"]);
  });

  it("FP-TREE-002c: descendants() terminates on cyclic input (WeakSet guard)", () => {
    const a: Record<string, unknown> = { id: "a" };
    const b: Record<string, unknown> = { id: "b", next: a };
    a.next = b; // cycle: a → b → a
    const tree = { resourceType: "X", head: a };
    const result = fhirpath<any>("X").descendants().evaluate(tree);
    const ids = result.filter((r: any) => r != null && typeof r === "object" && "id" in r).map((r: any) => r.id);
    expect(ids.sort()).toEqual(["a", "b"]);
  });
});

/* -------------------------------------------------------------------------- */
/* 14. String manipulation (§5.6)                                             */
/* -------------------------------------------------------------------------- */

describe("String manipulation (FP-STR-*)", () => {
  const strData = { resourceType: "X", s: "Hello World" };

  it("FP-STR-001: indexOf('') returns 0 per spec", () => {
    const expr = fhirpath<any>("X").s.indexOf("");
    expect(expr.evaluate(strData)).toEqual([0]);
  });

  it("FP-STR-001: indexOf on non-string input returns empty", () => {
    const data = { resourceType: "X", s: 42 };
    const expr = fhirpath<any>("X").s.indexOf("1");
    expect(expr.evaluate(data)).toEqual([]);
  });

  it("FP-STR-002: substring(start, length) slices correctly", () => {
    const expr = fhirpath<any>("X").s.substring(0, 5);
    expect(expr.evaluate(strData)).toEqual(["Hello"]);
  });

  it("FP-STR-002: substring(start) with start beyond length returns empty", () => {
    const expr = fhirpath<any>("X").s.substring(100);
    expect(expr.evaluate(strData)).toEqual([]);
  });

  it("FP-STR-003: startsWith('') returns [true] per spec", () => {
    expect(fhirpath<any>("X").s.startsWith("").evaluate(strData)).toEqual([true]);
  });

  it("FP-STR-004: endsWith matches suffix correctly", () => {
    expect(fhirpath<any>("X").s.endsWith("World").evaluate(strData)).toEqual([true]);
  });

  it("FP-STR-005: string contains() uses substring match (not collection membership)", () => {
    expect(fhirpath<any>("X").s.contains("o W").evaluate(strData)).toEqual([true]);
  });

  it("FP-STR-006: upper/lower work on strings", () => {
    expect(fhirpath<any>("X").s.upper().evaluate(strData)).toEqual(["HELLO WORLD"]);
    expect(fhirpath<any>("X").s.lower().evaluate(strData)).toEqual(["hello world"]);
  });

  it("FP-STR-007: replace() does literal (non-regex) replacement", () => {
    const expr = fhirpath<any>("X").s.replace("World", "FHIR");
    expect(expr.evaluate(strData)).toEqual(["Hello FHIR"]);
  });

  test.fails("FP-STR-008: matches() must anchor the regex (full-string match per spec §5.6.9)", () => {
    // Impl: eval/strings.ts:55-59 uses JS RegExp.test which is substring match.
    // Spec requires full-string match.
    const expr = fhirpath<any>("X").s.matches("World");
    // Full-match of "Hello World" against /World/ → false; substring → true.
    expect(expr.evaluate(strData)).toEqual([false]);
  });

  it("FP-STR-009: replaceMatches() does regex replacement", () => {
    const expr = fhirpath<any>("X").s.replaceMatches("o\\s", "X");
    expect(expr.evaluate(strData)).toEqual(["HellXWorld"]);
  });

  it("FP-STR-010: length() returns character count for non-empty string", () => {
    expect(fhirpath<any>("X").s.length().evaluate(strData)).toEqual([11]);
  });

  it("FP-STR-010: length() on empty input (no field) returns empty", () => {
    expect(fhirpath<any>("X").s.length().evaluate({ resourceType: "X" })).toEqual([]);
  });

  it("FP-STR-010b: length() counts NFC code points (spec §2.1.20) — BUG-010", () => {
    const nfd = "cafe\u0301"; // NFD form of "café"
    const nfc = "caf\u00e9"; // NFC form
    expect(nfd.length).toBe(5);
    expect(nfc.length).toBe(4);
    // Both must report 4 code points after NFC normalization.
    expect(fhirpath<any>("X").s.length().evaluate({ resourceType: "X", s: nfd })).toEqual([4]);
    expect(fhirpath<any>("X").s.length().evaluate({ resourceType: "X", s: nfc })).toEqual([4]);
  });

  it("FP-STR-010c: where-predicate string equality compares under NFC (BUG-010)", () => {
    const nfd = "cafe\u0301";
    const nfc = "caf\u00e9";
    const data = { resourceType: "X", items: [{ name: nfd }, { name: "other" }] };
    const result = fhirpath<any>("X")
      .items.where(($this: any) => $this.name.eq(nfc))
      .evaluate(data);
    expect(result).toEqual([{ name: nfd }]);
  });

  it("FP-STR-011: toChars() splits string into character collection", () => {
    const data = { resourceType: "X", s: "abc" };
    expect(fhirpath<any>("X").s.toChars().evaluate(data)).toEqual(["a", "b", "c"]);
  });

  test.fails("FP-STR-012: string literal with embedded single-quote is escaped in compile (spec §4.1.1)", () => {
    // Impl: expression.ts:178-184 interpolates raw — produces broken FHIRPath.
    // Spec-correct output must contain either `\'` (backslash escape) or
    // `''` (doubled-quote escape).
    const expr = fp().name.where(($this: any) => $this.family.eq("O'Brien"));
    const compiled = expr.compile() as string;
    expect(compiled.includes("O\\'Brien") || compiled.includes("O''Brien")).toBe(true);
  });

  it.todo("FP-STR-013: split(delimiter)");
  it.todo("FP-STR-014: join(separator)");
  it.todo("FP-STR-015: trim()");
  it.todo("FP-STR-016: encode(format)");
  it.todo("FP-STR-017: decode(format)");
  it.todo("FP-STR-018: escape(target)");
  it.todo("FP-STR-019: unescape(target)");
});

/* -------------------------------------------------------------------------- */
/* 15. Math functions (§5.7)                                                  */
/* -------------------------------------------------------------------------- */

describe("Math functions (FP-MATHF-*)", () => {
  it("FP-MATHF-001: abs() on a negative number", () => {
    const data = { resourceType: "X", n: -5 };
    expect(fhirpath<any>("X").n.abs().evaluate(data)).toEqual([5]);
  });

  it("FP-MATHF-002: ceiling() rounds up", () => {
    const data = { resourceType: "X", n: 1.2 };
    expect(fhirpath<any>("X").n.ceiling().evaluate(data)).toEqual([2]);
  });

  it("FP-MATHF-004: floor() rounds down", () => {
    const data = { resourceType: "X", n: 1.8 };
    expect(fhirpath<any>("X").n.floor().evaluate(data)).toEqual([1]);
  });

  test.fails("FP-MATHF-005: ln(0) returns empty (spec §5.7 — undefined domain)", () => {
    const data = { resourceType: "X", n: 0 };
    expect(fhirpath<any>("X").n.ln().evaluate(data)).toEqual([]);
  });

  test.fails("FP-MATHF-005: ln(-1) returns empty", () => {
    const data = { resourceType: "X", n: -1 };
    expect(fhirpath<any>("X").n.ln().evaluate(data)).toEqual([]);
  });

  test.fails("FP-MATHF-007: power with invalid base returns empty (spec — no NaN leak)", () => {
    const data = { resourceType: "X", n: -1 };
    expect(fhirpath<any>("X").n.power(0.5).evaluate(data)).toEqual([]);
  });

  it("FP-MATHF-008: round() with default precision matches Math.round", () => {
    const data = { resourceType: "X", n: 1.5 };
    expect(fhirpath<any>("X").n.round().evaluate(data)).toEqual([2]);
  });

  test.fails("FP-MATHF-009: sqrt(-1) returns empty (spec — no NaN leak)", () => {
    const data = { resourceType: "X", n: -1 };
    expect(fhirpath<any>("X").n.sqrt().evaluate(data)).toEqual([]);
  });

  it("FP-MATHF-010: truncate() drops fractional part", () => {
    const data = { resourceType: "X", n: 2.9 };
    expect(fhirpath<any>("X").n.truncate().evaluate(data)).toEqual([2]);
  });
});

/* -------------------------------------------------------------------------- */
/* 16. Conversion functions (§5.5)                                            */
/* -------------------------------------------------------------------------- */

describe("Conversion (FP-CONV-*)", () => {
  it("FP-CONV-001: iif(criterion, trueResult) evaluates criterion on input collection (spec §5.9.3)", () => {
    const data = { resourceType: "X", items: ["a", "b", "c"] };
    const expr = fhirpath<any>("X").items.iif(
      ($this: any) => $this.count().gt(1),
      () => "multi",
      () => "single",
    );
    expect(expr.evaluate(data)).toEqual(["multi"]);
  });

  test.fails("FP-CONV-002: toBoolean() accepts 'TRUE', 'T', 'yes', 'Y' (case-insensitive per spec §5.5.2)", () => {
    // Impl: eval/conversion.ts:5-9 accepts only literal "true"/"false".
    const data = { resourceType: "X", s: "yes" };
    expect(fhirpath<any>("X").s.toBoolean().evaluate(data)).toEqual([true]);
  });

  test.fails("FP-CONV-003: convertsToBoolean() on non-convertible input returns empty", () => {
    // Impl: eval/conversion.ts:65-66 always returns a boolean per item.
    // Spec: non-applicable conversion → empty.
    const data = { resourceType: "X", s: "maybe" };
    expect(fhirpath<any>("X").s.convertsToBoolean().evaluate(data)).toEqual([]);
  });

  test.fails("FP-CONV-004: toInteger('12.5') returns empty (spec: reject non-integer lexical)", () => {
    // Impl uses parseInt which accepts '12.5' as 12 and '12abc' as 12.
    const data = { resourceType: "X", s: "12.5" };
    expect(fhirpath<any>("X").s.toInteger().evaluate(data)).toEqual([]);
  });

  test.fails("FP-CONV-004: toInteger('12abc') returns empty", () => {
    const data = { resourceType: "X", s: "12abc" };
    expect(fhirpath<any>("X").s.toInteger().evaluate(data)).toEqual([]);
  });

  test.fails("FP-CONV-006: toDate() validates month/day range (spec §5.5.4)", () => {
    // Impl: regex allows "2024-99-99" to pass unchanged.
    const data = { resourceType: "X", s: "2024-99-99" };
    expect(fhirpath<any>("X").s.toDate().evaluate(data)).toEqual([]);
  });

  test.fails("FP-CONV-008: toDateTime() rejects non-ISO formats like '2024/01/01'", () => {
    // Impl: Date.parse is engine-specific and permissive.
    const data = { resourceType: "X", s: "2024/01/01" };
    expect(fhirpath<any>("X").s.toDateTime().evaluate(data)).toEqual([]);
  });

  test.fails("FP-CONV-010: toDecimal('3.14abc') returns empty", () => {
    const data = { resourceType: "X", s: "3.14abc" };
    expect(fhirpath<any>("X").s.toDecimal().evaluate(data)).toEqual([]);
  });

  it("FP-CONV-012: toQuantity(unit) wraps a number into {value, unit}", () => {
    const data = { resourceType: "X", n: 120 };
    const expr = fhirpath<any>("X").n.toQuantity("mg");
    expect(expr.compile()).toBe("X.n.toQuantity('mg')");
    expect(expr.evaluate(data)).toEqual([{ value: 120, unit: "mg" }]);
  });

  test.fails("FP-CONV-012: toQuantity() parses string '10 mg' into Quantity (spec §5.5.7)", () => {
    const data = { resourceType: "X", s: "10 mg" };
    expect(fhirpath<any>("X").s.toQuantity().evaluate(data)).toEqual([{ value: 10, unit: "mg" }]);
  });

  it("FP-CONV-014: toFhirString() stringifies a number", () => {
    const data = { resourceType: "X", n: 42 };
    expect(fhirpath<any>("X").n.toFhirString().evaluate(data)).toEqual(["42"]);
  });
});

/* -------------------------------------------------------------------------- */
/* 17. Utility (§5.9)                                                         */
/* -------------------------------------------------------------------------- */

describe("Utility (FP-UTIL-*)", () => {
  it("FP-UTIL-001: trace(name) returns input unchanged and logs to console.debug", () => {
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    const data = { resourceType: "X", n: 7 };
    const expr = fhirpath<any>("X").n.trace("dbg");
    const result = expr.evaluate(data);
    expect(result).toEqual([7]);
    expect(debugSpy).toHaveBeenCalled();
    debugSpy.mockRestore();
  });

  test.fails("FP-UTIL-002: now() returns the same value across dispatches within an expression (spec §5.9.2)", () => {
    // Spec §5.9.2: now() "should return the same value regardless of how
    // many times they are evaluated within any given expression."
    // Impl: eval/utility.ts calls `new Date()` on each dispatch — if the
    // clock advances between the two calls, the values drift.
    //
    // Force an unambiguous clock advance via fake timers to surface the bug.
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
      const t1 = fhirpath<any>("X").now().evaluate({ resourceType: "X" });
      vi.advanceTimersByTime(5_000);
      const t2 = fhirpath<any>("X").now().evaluate({ resourceType: "X" });
      // Spec-correct (no drift): t1 equals t2. Impl today: they differ.
      expect(t1).toEqual(t2);
    } finally {
      vi.useRealTimers();
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 18. Aggregate (§7 STU) — MISSING                                           */
/* -------------------------------------------------------------------------- */

describe("Aggregate (FP-AGG-*) — MISSING", () => {
  it.todo("FP-AGG-001: aggregate($this, $total, init?)");
  it.todo("FP-AGG-002: sum()");
  it.todo("FP-AGG-003: min() / max()");
  it.todo("FP-AGG-004: avg()");
});

/* -------------------------------------------------------------------------- */
/* 19. Environment variables (§5 intro / §9) — mostly MISSING                 */
/* -------------------------------------------------------------------------- */

describe("Environment variables (FP-VAR-*)", () => {
  it("FP-VAR-001: $this is available inside a where() predicate", () => {
    const expr = fp().name.where(($this: any) => $this.use.eq("official"));
    expect(expr.compile()).toContain("$this");
  });

  it.todo("FP-VAR-002: $index inside select / where");
  it.todo("FP-VAR-003: $total inside aggregate");
  it.todo("FP-VAR-004: %context");
  it.todo("FP-VAR-005: %resource");
  it.todo("FP-VAR-006: %rootResource");
  it.todo("FP-VAR-007: %ucum");
  it.todo("FP-VAR-008: %vs-[name]");
  it.todo("FP-VAR-009: %ext-[url]");
  it.todo("FP-VAR-010: evaluate() accepts an env-bag parameter");
});

/* -------------------------------------------------------------------------- */
/* 20. Literals (§4.1) — mostly MISSING as builder primitives                 */
/* -------------------------------------------------------------------------- */

describe("Literals (FP-LIT-*)", () => {
  it("FP-LIT-001: boolean literal in a predicate stringifies correctly", () => {
    const expr = fp().name.where(($this: any) => $this.family.eq("Smith"));
    expect(expr.compile()).toContain("'Smith'");
  });

  it.todo("FP-LIT-005: Date literal `@2024-01`");
  it.todo("FP-LIT-006: Time literal `@T10:30`");
  it.todo("FP-LIT-007: DateTime literal `@2024-01-01T10:30:00Z`");
  it.todo("FP-LIT-008: Quantity literal `1 'mg'`");
  it.todo("FP-LIT-009: `{}` empty-collection literal");
  it.todo("FP-LIT-010: backtick-delimited identifiers (e.g. `\\`date\\``)");
});

/* -------------------------------------------------------------------------- */
/* 21. Date/time arithmetic (§6.6.7) — MISSING                                */
/* -------------------------------------------------------------------------- */

describe("Date/time arithmetic (FP-DT-*) — MISSING", () => {
  it.todo("FP-DT-001: Date + calendar-duration arithmetic (`year` / `month` keywords)");
  it.todo("FP-DT-002: UCUM definite-duration arithmetic");
  it.todo("FP-DT-004: date - date returns duration");
});

/* -------------------------------------------------------------------------- */
/* 22. FHIR-specific functions — MISSING                                      */
/* -------------------------------------------------------------------------- */

describe("FHIR-specific functions (FP-FHIR-*)", () => {
  it.todo("FP-FHIR-001: extension(url) returns the Extension by url");
  it.todo("FP-FHIR-002: hasValue()");
  it.todo("FP-FHIR-003: getValue()");
  it.todo("FP-FHIR-004: resolve() dereferences a Reference");

  test.fails("FP-FHIR-005: ofType() rejects profile URLs (must be a concrete core type)", () => {
    // Impl: eval/filtering.ts:63-99 accepts any string. Spec §2.1.9.1.5:
    // "must be a concrete core type".
    const bundle = {
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Patient" } }],
    };
    const expr = fhirpath<any>("Bundle")
      .entry.select(($this: any) => $this.resource)
      .ofType("http://example.org/Patient");
    // Spec-correct: profile-URL arg → error or empty.
    // Impl: silently returns [].
    expect(() => expr.evaluate(bundle)).toThrow();
  });

  it.todo("FP-FHIR-006: conformsTo()");
  it.todo("FP-FHIR-007: memberOf()");
  it.todo("FP-FHIR-008: subsumes()");
  it.todo("FP-FHIR-009: subsumedBy()");
  it.todo("FP-FHIR-010: htmlChecks()");
  it.todo("FP-FHIR-011: lowBoundary() / highBoundary()");
  it.todo("FP-FHIR-012: comparable()");

  /**
   * FP-FHIR-013 — spec §2.1.9.4 / FHIRPath §6.4 choice-type navigation.
   * Per decisions.md FP.6 (BUG-HIGH): `.value` on Observation must resolve
   * via the `value[x]` expansion. Two failing assertions lock in the two
   * sides of the contract:
   *   (a) the explicit `valueQuantity` form must return `[]` — there is no
   *       such field on the test fixture unless it's been chosen.
   *   (b) the implicit `.value` form must dispatch to the chosen variant
   *       (`valueQuantity` here) and return the payload.
   *
   * The builder/planner today emits a single `nav(prop="value")` op, so
   * `.value` returns `[]` unconditionally — (b) fails. When the builder
   * gains polymorphic expansion, (a) remains a regression pin.
   */
  it("FP-FHIR-013a: fp<Obs>().valueQuantity on obs-with-valueString returns [] (spec §2.1.9.4)", () => {
    // The un-chosen explicit variant must yield []. Regression pin for the
    // day someone extends choice-type dispatch to explicit variant names and
    // starts silently merging siblings (`valueString` bleeding into `valueQuantity`).
    const obs = { resourceType: "Observation", valueString: "hello" };
    expect(fhirpath<any>("Observation").valueQuantity.evaluate(obs)).toEqual([]);
  });

  it("FP-FHIR-013b: fp<Obs>().value dispatches to the chosen valueQuantity payload (spec §2.1.9.4)", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: 120, unit: "mmHg" } };
    expect(fhirpath<any>("Observation").value.evaluate(obs)).toEqual([{ value: 120, unit: "mmHg" }]);
  });

  it.todo("FP-FHIR-014: primitive `.value` implicit property");
});

/* -------------------------------------------------------------------------- */
/* 23. Empty-propagation smoke matrix                                         */
/* -------------------------------------------------------------------------- */

describe("Empty-propagation smoke matrix (spec §4.4.1)", () => {
  // Spec: single-input op on empty collection → empty. Enumerate the
  // runtime-supported unary ops and assert `{}` → `{}`.
  const emptyData = { resourceType: "X" };
  const unaryBuilders: Array<[string, (x: any) => any]> = [
    ["upper", (x) => x.s.upper()],
    ["lower", (x) => x.s.lower()],
    ["length", (x) => x.s.length()],
    ["toChars", (x) => x.s.toChars()],
    ["abs", (x) => x.n.abs()],
    ["ceiling", (x) => x.n.ceiling()],
    ["floor", (x) => x.n.floor()],
    ["truncate", (x) => x.n.truncate()],
    ["ln", (x) => x.n.ln()],
    ["sqrt", (x) => x.n.sqrt()],
    ["toBoolean", (x) => x.s.toBoolean()],
    ["toInteger", (x) => x.s.toInteger()],
    ["toDecimal", (x) => x.s.toDecimal()],
    ["toDate", (x) => x.s.toDate()],
    ["toDateTime", (x) => x.s.toDateTime()],
    ["toTime", (x) => x.s.toTime()],
    ["first", (x) => x.items.first()],
    ["last", (x) => x.items.last()],
    ["tail", (x) => x.items.tail()],
    ["distinct", (x) => x.items.distinct()],
    ["count", (x) => x.items.count()],
    ["empty", (x) => x.items.empty()],
  ];

  for (const [name, build] of unaryBuilders) {
    // count/empty are special-cased: count({}) === [0], empty({}) === [true].
    if (name === "count") {
      it(`FP-NAV-004: ${name}({}) returns [0]`, () => {
        expect(build(fhirpath<any>("X")).evaluate(emptyData)).toEqual([0]);
      });
    } else if (name === "empty") {
      it(`FP-NAV-004: ${name}({}) returns [true]`, () => {
        expect(build(fhirpath<any>("X")).evaluate(emptyData)).toEqual([true]);
      });
    } else {
      it(`FP-NAV-004: ${name}({}) returns []`, () => {
        expect(build(fhirpath<any>("X")).evaluate(emptyData)).toEqual([]);
      });
    }
  }
});
