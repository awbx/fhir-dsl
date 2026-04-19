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
  describe("arithmetic operators — missing entirely", () => {
    it.todo("supports integer addition: 1 + 2 = 3 (spec §6.6)");
    it.todo("supports subtraction, multiplication, division");
    it.todo("supports integer divide (`div`) and modulo (`mod`)");
    it.todo("supports string concatenation via `&` (spec §6.6.4)");
  });

  describe("bracket indexer [n] — missing", () => {
    it.todo("supports Patient.name[0] equivalent via .at(n) or bracket syntax");
  });

  describe("environment variables (%context / %resource / %ucum) — missing", () => {
    it.todo("evaluate(ops, resource, env) accepts an environment bag");
    it.todo("exposes %resource and %rootResource inside where() predicates");
  });

  describe("FHIR extensions: extension(url), resolve(), hasValue() — missing", () => {
    it.todo("extension(url) returns the Extension by url");
    it.todo("resolve() dereferences a Reference to its resource");
    it.todo("hasValue() returns true when a primitive has a value");

    // GAP: the proxy builder silently treats `.extension` as a field
    // navigation. When real extension(url) lands, this compile() output
    // will change and the test should be rewritten to call
    // `.extension("http://...")` instead.
    it("proxy currently compiles `.extension` as a field navigation", () => {
      const compiled = (fp() as any).extension.compile();
      expect(compiled).toBe("Patient.extension");
    });
  });

  describe("string equivalence operators ~ and !~ — missing", () => {
    it.todo("'Smith' ~ 'smith' returns true (case-insensitive equivalence, spec §6.3.1.4)");
  });

  describe("$index and $total context variables in projections — missing", () => {
    it.todo("select() callback exposes $index alongside $this");
  });

  describe("aggregate() — missing", () => {
    it.todo("aggregate($this, $total, init?) reduces a collection");
  });

  describe("UCUM-aware Quantity equality — not implemented", () => {
    // toQuantity() stores the raw unit string; semantically-equal quantities
    // with different unit spellings compare as unequal.
    it.todo("Quantity('120 mmHg') = Quantity('120 mm[Hg]') via UCUM conversion");
  });
});
