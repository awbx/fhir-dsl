/**
 * Spec-gap pin tests for @fhir-dsl/fhirpath.
 *
 * These tests pin CURRENT behavior for features that are partially or not
 * implemented against the FHIRPath N1 spec. They pass today; when a gap is
 * filled, the corresponding todo or test should be rewritten to assert
 * correct spec behavior.
 *
 * Most "missing feature" items are expressed as `it.todo` so they appear in
 * the vitest report without failing CI. The positive pins assert current
 * compile() output for features where a proxy-based builder silently
 * accepts an unknown method name (e.g. `fp().name.extension` compiles as a
 * field navigation, NOT as a FHIR extension() call) — when the real
 * implementation lands, these strings will change and the test must be
 * rewritten.
 *
 * See AUDIT.md in the repo root for the full gap list and severity ratings.
 */

import { describe, expect, it } from "vitest";
import { fhirpath } from "../src/builder.js";
import type { TestPatient } from "../src/test-types.js";

function fp() {
  return fhirpath<TestPatient>("Patient");
}

describe("FHIRPath spec gaps (pins current behavior — see AUDIT.md)", () => {
  describe("arithmetic operators (spec §6.6)", () => {
    it("supports integer addition via .add()", () => {
      const resource: any = { resourceType: "Observation", valueInteger: 10 };
      expect((fp() as any).valueInteger.add(2).evaluate(resource)).toEqual([12]);
    });
    it("supports subtraction/multiplication/division on a navigated number", () => {
      const resource: any = { resourceType: "Observation", valueInteger: 20 };
      expect((fp() as any).valueInteger.sub(5).evaluate(resource)).toEqual([15]);
      expect((fp() as any).valueInteger.mul(2).evaluate(resource)).toEqual([40]);
      expect((fp() as any).valueInteger.div(4).evaluate(resource)).toEqual([5]);
    });
    it("supports integer divide (`divTrunc`) and modulo (`mod`)", () => {
      const resource: any = { resourceType: "Observation", valueInteger: 17 };
      expect((fp() as any).valueInteger.divTrunc(5).evaluate(resource)).toEqual([3]);
      expect((fp() as any).valueInteger.mod(5).evaluate(resource)).toEqual([2]);
    });
    it("supports string concatenation via `&` (concat)", () => {
      const resource: any = { resourceType: "Patient", id: "abc" };
      expect((fp() as any).id.concat("-suffix").evaluate(resource)).toEqual(["abc-suffix"]);
    });
  });

  describe("bracket indexer [n] — missing", () => {
    it.todo("supports Patient.name[0] equivalent via .at(n) or bracket syntax");
  });

  // environment variables + FHIR-specific functions are now implemented — see
  // FP-VAR-* and FP-FHIR-* in spec-compliance.test.ts.

  describe("string equivalence operators ~ and !~ — missing", () => {
    it.todo("'Smith' ~ 'smith' returns true (case-insensitive equivalence, spec §6.3.1.4)");
  });

  // UCUM-aware Quantity equality and ordering — shipped in #51.
  // Positive coverage lives in `test/issue-51.test.ts`.
});
