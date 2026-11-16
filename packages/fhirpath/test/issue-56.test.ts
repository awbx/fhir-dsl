/**
 * Issue #56 — choice-type (`[x]`) navigation in the op-based engine uses the
 * same base/suffix tables as the invariant engine (`src/fhir-choice.ts`):
 * every R4–R6 `[x]` base dispatches, and a key matches only when its suffix
 * is a FHIR type name.
 */
import { describe, expect, it } from "vitest";
import { evaluate } from "../src/evaluator.js";
import { CHOICE_BASES, findChoiceVariant } from "../src/fhir-choice.js";
import { compileInvariant, fhirpath } from "../src/index.js";
import type { PathOp } from "../src/ops.js";

const nav = (prop: string): PathOp => ({ type: "nav", prop });

describe("findChoiceVariant", () => {
  it("returns key, type and value for a choice variant", () => {
    expect(findChoiceVariant({ valueQuantity: { value: 1 } }, "value")).toEqual({
      key: "valueQuantity",
      type: "Quantity",
      value: { value: 1 },
    });
    expect(findChoiceVariant({ effectiveDateTime: "2020" }, "effective")).toEqual({
      key: "effectiveDateTime",
      type: "dateTime",
      value: "2020",
    });
  });

  it("ignores non-choice bases and non-type suffixes", () => {
    expect(findChoiceVariant({ referenceRange: [{}] }, "reference")).toBeUndefined();
    expect(findChoiceVariant({ valueFoo: 1 }, "value")).toBeUndefined();
  });

  it("covers the R4 bases missing from the old allowlist", () => {
    for (const base of ["answer", "probability", "subject", "item", "date", "code", "when", "time"]) {
      expect(CHOICE_BASES.has(base)).toBe(true);
    }
  });
});

describe("full engine — choice-type navigation (issue #56)", () => {
  it("Questionnaire.item.enableWhen.answer → answerBoolean", () => {
    const q = {
      resourceType: "Questionnaire",
      item: [{ linkId: "1", enableWhen: [{ question: "0", operator: "=", answerBoolean: true }] }],
    };
    expect(fhirpath<any>("Questionnaire").item.enableWhen.answer.evaluate(q)).toEqual([true]);
  });

  it("RiskAssessment.prediction.probability → probabilityDecimal", () => {
    const ra = { resourceType: "RiskAssessment", prediction: [{ probabilityDecimal: 0.42 }] };
    expect(fhirpath<any>("RiskAssessment").prediction.probability.evaluate(ra)).toEqual([0.42]);
  });

  it("`reference` does not dispatch to `referenceRange`", () => {
    const obs = { resourceType: "Observation", referenceRange: [{ text: "normal" }] };
    expect(fhirpath<any>("Observation").reference.evaluate(obs)).toEqual([]);
  });

  it("`date` does not dispatch to a non-type suffix", () => {
    expect(evaluate([nav("date")], { dateRecorded: "2020-01-01" })).toEqual([]);
    expect(evaluate([nav("date")], { dateDateTime: "2020-01-01" })).toEqual(["2020-01-01"]);
  });

  it("an unknown-suffix key like `valueFoo` is not matched", () => {
    expect(evaluate([nav("value")], { valueFoo: 1 })).toEqual([]);
    expect(evaluate([nav("value")], { valueFoo: 1, valueString: "x" })).toEqual(["x"]);
  });

  it("direct lookup wins over a choice variant", () => {
    expect(evaluate([nav("value")], { value: 1, valueString: "x" })).toEqual([1]);
  });

  it("explicit null on the base is preserved and does not fall back (BUG-024)", () => {
    expect(evaluate([nav("value")], { value: null, valueString: "x" })).toEqual([null]);
  });

  it("merges the `_<key>` primitive sibling of the dispatched variant", () => {
    const ext = { extension: [{ url: "http://example.org/e", valueCode: "c" }] };
    const result = evaluate([nav("value"), nav("extension"), nav("url")], { valueString: "x", _valueString: ext });
    expect(result).toEqual(["http://example.org/e"]);
  });
});

describe("full engine — is / as / ofType use the dispatched choice type", () => {
  // `{ value: 5 }` has no unit, so the duck-typing in ofType() would reject it
  // and `is` (resourceType-only) would never match. The choice key settles it.
  const obs = { resourceType: "Observation", valueQuantity: { value: 5 } };

  it("ofType(Quantity) keeps a valueQuantity reached via `value`", () => {
    expect(fhirpath<any>("Observation").value.ofType("Quantity").evaluate(obs)).toEqual([{ value: 5 }]);
    expect(fhirpath<any>("Observation").value.ofType("Range").evaluate(obs)).toEqual([]);
  });

  it("ofType(Quantity) accepts Quantity specialisations; ofType(Duration) is exact", () => {
    const o = { resourceType: "Observation", valueDuration: { value: 3, code: "h" } };
    expect(fhirpath<any>("Observation").value.ofType("Quantity").evaluate(o)).toEqual([{ value: 3, code: "h" }]);
    expect(fhirpath<any>("Observation").value.ofType("Duration").evaluate(o)).toEqual([{ value: 3, code: "h" }]);
    expect(fhirpath<any>("Observation").value.ofType("Age").evaluate(o)).toEqual([]);
  });

  it("`is` / `as` answer from the dispatched type", () => {
    expect(evaluate([nav("value"), { type: "is", typeName: "Quantity" }], obs)).toEqual([true]);
    expect(evaluate([nav("value"), { type: "is", typeName: "CodeableConcept" }], obs)).toEqual([false]);
    expect(evaluate([nav("value"), { type: "as", typeName: "Quantity" }], obs)).toEqual([{ value: 5 }]);
    expect(evaluate([nav("value"), { type: "as", typeName: "Period" }], obs)).toEqual([]);
  });
});

describe("invariant engine — shares the same choice tables", () => {
  it("answer → answerBoolean, probability → probabilityDecimal", () => {
    const k = (expression: string) => compileInvariant({ key: "k", expression, severity: "error", human: "h" });
    expect(k("answer.exists()").check({ answerBoolean: false }).passed).toBe(true);
    expect(k("probability > 0.4").check({ probabilityDecimal: 0.42 }).passed).toBe(true);
    expect(k("value.exists()").check({ valueFoo: 1 }).passed).toBe(false);
  });

  it("`is Quantity` holds for a Quantity specialisation", () => {
    const inv = compileInvariant({ key: "k", expression: "value is Quantity", severity: "error", human: "h" });
    expect(inv.check({ valueAge: { value: 40, code: "a" } }).passed).toBe(true);
  });
});
