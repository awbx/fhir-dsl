import { describe, expect, it } from "vitest";
import { compileInvariant, validateInvariants } from "./index.js";

// FHIR R4 invariants that the subset must handle correctly. The
// expressions are copied verbatim from the spec; the test resources are
// hand-rolled.

describe("invariant — pat-1: name | telecom | address | organization", () => {
  const inv = compileInvariant({
    key: "pat-1",
    expression: "name.exists() or telecom.exists() or address.exists() or organization.exists()",
    severity: "error",
    human: "Patient.contact must have at least one contact mechanism",
  });

  it("passes when name is present", () => {
    expect(inv.check({ name: [{ given: ["Ada"] }] }).passed).toBe(true);
  });

  it("fails when none of the identifying fields are present", () => {
    expect(inv.check({}).passed).toBe(false);
  });
});

describe("invariant — ext-1: extension xor value", () => {
  const inv = compileInvariant({
    key: "ext-1",
    expression: "extension.exists() != value.exists()",
    severity: "error",
    human: "Either an extension must have value[x] or sub-extensions, not both",
  });

  it("passes when only the extension array is present", () => {
    expect(inv.check({ url: "http://x", extension: [{ url: "http://y" }] }).passed).toBe(true);
  });

  it("passes when only value[x] is present", () => {
    // `value` resolves through the `value[x]` choice variant.
    expect(inv.check({ url: "http://x", valueString: "ok" }).passed).toBe(true);
    expect(inv.check({ url: "http://x", valueQuantity: { value: 1 } }).passed).toBe(true);
    expect(inv.check({ url: "http://x", value: [1] }).passed).toBe(true);
  });

  it("fails when both are present or both are absent", () => {
    expect(inv.check({ url: "http://x", value: [1], extension: [{}] }).passed).toBe(false);
    expect(inv.check({ url: "http://x" }).passed).toBe(false);
  });
});

describe("invariant — implies operator (us-core-1 style)", () => {
  const inv = compileInvariant({
    key: "us-core-1",
    expression: "telecom.exists() implies telecom.system.exists()",
    severity: "error",
    human: "If a telecom is provided, it must have a system",
  });

  it("passes when there's no telecom (vacuously true)", () => {
    expect(inv.check({}).passed).toBe(true);
  });

  it("passes when telecom is present and has a system", () => {
    expect(inv.check({ telecom: [{ system: "phone", value: "555-1212" }] }).passed).toBe(true);
  });

  it("fails when telecom is present but has no system", () => {
    expect(inv.check({ telecom: [{ value: "555-1212" }] }).passed).toBe(false);
  });
});

describe("invariant — matches() with regex", () => {
  const inv = compileInvariant({
    key: "id-format",
    expression: "id.matches('^[A-Za-z0-9-.]+$')",
    severity: "error",
    human: "id must match the FHIR id pattern",
  });

  it("passes for a valid id", () => {
    expect(inv.check({ id: "abc-123" }).passed).toBe(true);
  });

  it("fails for an invalid id", () => {
    expect(inv.check({ id: "bad/id" }).passed).toBe(false);
  });

  it("returns indeterminate when id is missing", () => {
    expect(inv.check({}).passed).toBe("indeterminate");
  });
});

describe("invariant — count() comparison", () => {
  const inv = compileInvariant({
    key: "obs-7",
    expression: "component.count() <= 3",
    severity: "error",
    human: "An observation may not have more than 3 components",
  });

  it("passes at the boundary", () => {
    expect(inv.check({ component: [{}, {}, {}] }).passed).toBe(true);
  });

  it("fails when over the boundary", () => {
    expect(inv.check({ component: [{}, {}, {}, {}] }).passed).toBe(false);
  });

  it("passes when component is missing (count = 0)", () => {
    expect(inv.check({}).passed).toBe(true);
  });
});

describe("invariant — three-valued logic propagation", () => {
  it("`true and ()` is indeterminate, `false and ()` is false", () => {
    const inv = compileInvariant({
      key: "tvl-and",
      expression: "missing.exists() and other.exists()",
      severity: "error",
      human: "irrelevant",
    });
    // missing.exists() === false, so the whole and is false.
    expect(inv.check({}).passed).toBe(false);
  });

  it("`false implies anything` is true", () => {
    const inv = compileInvariant({
      key: "tvl-implies",
      expression: "missing.exists() implies somethingElse.exists()",
      severity: "error",
      human: "irrelevant",
    });
    expect(inv.check({}).passed).toBe(true);
  });
});

describe("validateInvariants", () => {
  it("returns an OperationOutcome with one issue per failing invariant", () => {
    const oo = validateInvariants({}, [
      {
        key: "pat-1",
        expression: "name.exists() or telecom.exists()",
        severity: "error",
        human: "Patient must have name or telecom",
      },
      {
        key: "id-set",
        expression: "id.exists()",
        severity: "warning",
        human: "Patient should have an id",
      },
    ]);
    expect(oo.resourceType).toBe("OperationOutcome");
    expect(oo.issue).toHaveLength(2);
    expect(oo.issue[0]).toMatchObject({ severity: "error", code: "invariant" });
    expect(oo.issue[1]).toMatchObject({ severity: "warning", code: "invariant" });
  });

  it("reports indeterminate evaluations as warnings", () => {
    const oo = validateInvariants({}, [
      { key: "x", expression: "id.matches('foo')", severity: "error", human: "needs id" },
    ]);
    expect(oo.issue[0]?.severity).toBe("warning");
  });

  it("emits no issues when every invariant passes", () => {
    const oo = validateInvariants({ name: [{ given: ["Ada"] }] }, [
      { key: "pat-1", expression: "name.exists()", severity: "error", human: "must have name" },
    ]);
    expect(oo.issue).toEqual([]);
  });
});

// Issue #54: standard R4 invariants using `.not()`, `%resource`, `|`, `is`
// and `value[x]` failed to compile or evaluated wrongly.
describe("invariant — standard R4 constraints (#54)", () => {
  const per1 = {
    key: "per-1",
    severity: "error" as const,
    human: "If present, start SHALL have a lower value than end",
    expression: "start.hasValue().not() or end.hasValue().not() or (start <= end)",
  };

  it("per-1: compiles the .not() method form and flags start > end", () => {
    const oo = validateInvariants({ start: "2020-02-01", end: "2020-01-01" }, [per1]);
    expect(oo.issue).toHaveLength(1);
    expect(oo.issue[0]).toMatchObject({ severity: "error", code: "invariant" });
    expect(validateInvariants({ start: "2020-01-01", end: "2020-02-01" }, [per1]).issue).toEqual([]);
    expect(validateInvariants({ start: "2020-01-01" }, [per1]).issue).toEqual([]);
  });

  it("per-1: compares dateTimes by instant, not by string", () => {
    // 10:00+02:00 is 08:00Z, which is before 09:00Z.
    const oo = validateInvariants({ start: "2020-01-01T10:00:00+02:00", end: "2020-01-01T09:00:00Z" }, [per1]);
    expect(oo.issue).toEqual([]);
  });

  it("per-1: mixed precision that overlaps is not an error", () => {
    // `2020-02-15` vs `2020-02`: equal at month precision, so the order is unknown.
    const oo = validateInvariants({ start: "2020-02-15", end: "2020-02" }, [per1]);
    expect(oo.issue.filter((i) => i.severity === "error")).toEqual([]);
    expect(validateInvariants({ start: "2020-03-15", end: "2020-02" }, [per1]).issue[0]?.severity).toBe("error");
  });

  it("keywords are plain names after a dot", () => {
    const inv = compileInvariant({
      key: "k",
      expression: "a.not() and b.exists().not()",
      severity: "error",
      human: "h",
    });
    expect(inv.check({ a: false }).passed).toBe(true);
  });

  const obs7 = {
    key: "obs-7",
    severity: "error" as const,
    human:
      "If Observation.code is the same as an Observation.component.code then the value element SHALL NOT be present",
    expression: "value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()",
  };

  it("obs-7: lexes %resource and passes a valid Observation", () => {
    const oo = validateInvariants({ resourceType: "Observation", code: { text: "x" } }, [obs7]);
    expect(oo).toEqual({ resourceType: "OperationOutcome", issue: [] });
  });

  it("obs-7: flags a value alongside a component sharing the Observation code", () => {
    const coding = [{ system: "http://loinc.org", code: "8480-6" }];
    const oo = validateInvariants(
      { resourceType: "Observation", code: { coding }, valueQuantity: { value: 1 }, component: [{ code: { coding } }] },
      [obs7],
    );
    expect(oo.issue[0]?.severity).toBe("error");
  });

  it("obs-6: resolves value against valueQuantity", () => {
    const obs6 = {
      key: "obs-6",
      severity: "error" as const,
      human: "dataAbsentReason SHALL only be present if Observation.value[x] is not present",
      expression: "dataAbsentReason.empty() or value.empty()",
    };
    const oo = validateInvariants(
      { resourceType: "Observation", valueQuantity: { value: 5, unit: "mg" }, dataAbsentReason: { text: "unknown" } },
      [obs6],
    );
    expect(oo.issue).toHaveLength(1);
    expect(oo.issue[0]?.severity).toBe("error");
  });

  it("choice dispatch does not leak into non-choice siblings", () => {
    // `reference` is not a choice base, so it must not pick up `referenceRange`.
    const inv = compileInvariant({ key: "k", expression: "reference.empty()", severity: "error", human: "h" });
    expect(inv.check({ referenceRange: [{ text: "x" }] }).passed).toBe(true);
  });

  it("%resource on an element outside its resource is indeterminate, not an error", () => {
    // ref-1 is attached to the Reference datatype; the enclosing resource is unknown there.
    const ref1 = {
      key: "ref-1",
      severity: "error" as const,
      human: "SHALL have a contained resource if a local reference is provided",
      expression:
        "reference.startsWith('#').not() or (reference.substring(1).trace('url') in %rootResource.contained.id.trace('ids'))",
    };
    const oo = validateInvariants({ reference: "#p1" }, [ref1]);
    expect(oo.issue.filter((i) => i.severity === "error")).toEqual([]);
    // On a resource root, %rootResource is the resource itself.
    const resource = { resourceType: "Observation", contained: [{ resourceType: "Patient", id: "p1" }] };
    const inv = compileInvariant({ ...ref1, expression: "'p1' in %rootResource.contained.id" });
    expect(inv.check(resource).passed).toBe(true);
  });

  it("dom-3 compiles and passes a resource without contained resources", () => {
    const dom3 = {
      key: "dom-3",
      severity: "error" as const,
      human: "If the resource is contained in another resource, it SHALL be referred to from elsewhere in the resource",
      expression:
        "contained.where((('#'+id in (%resource.descendants().reference | %resource.descendants().as(canonical) | %resource.descendants().as(uri) | %resource.descendants().as(url))) or descendants().where(reference = '#').exists() or descendants().where(as(canonical) = '#').exists() or descendants().where(as(canonical) = '#').exists()).not()).trace('unmatched', id).empty()",
    };
    expect(validateInvariants({ resourceType: "Patient" }, [dom3]).issue).toEqual([]);
  });

  it("supports the | union operator", () => {
    const app3 = {
      key: "app-3",
      severity: "error" as const,
      human: "Only proposed or cancelled appointments can be missing start/end dates",
      expression: "(start.exists() and end.exists()) or (status in ('proposed' | 'cancelled' | 'waitlist'))",
    };
    expect(validateInvariants({ status: "proposed" }, [app3]).issue).toEqual([]);
    expect(validateInvariants({ status: "booked" }, [app3]).issue[0]?.severity).toBe("error");
  });

  it("supports the is type operator on choice values", () => {
    const que7 = {
      key: "que-7",
      severity: "error" as const,
      human: "If the operator is 'exists', the value must be a boolean",
      expression: "operator = 'exists' implies (answer is Boolean)",
    };
    expect(validateInvariants({ operator: "exists", answerBoolean: true }, [que7]).issue).toEqual([]);
    expect(validateInvariants({ operator: "exists", answerCoding: { code: "x" } }, [que7]).issue[0]?.severity).toBe(
      "error",
    );
  });

  it("supports the infix contains operator", () => {
    const inv = compileInvariant({ key: "k", expression: "tags contains 'a'", severity: "error", human: "h" });
    expect(inv.check({ tags: ["a", "b"] }).passed).toBe(true);
    expect(inv.check({ tags: ["b"] }).passed).toBe(false);
  });

  it("compileInvariant wraps lexer errors as compile errors", () => {
    expect(() => compileInvariant({ key: "k", expression: "a # b", severity: "error", human: "h" })).toThrow(
      /failed to compile k/,
    );
  });

  it("validateInvariants reports an unsupported expression as a warning instead of throwing", () => {
    const oo = validateInvariants({}, [{ key: "k", expression: "a # b", severity: "error", human: "h" }]);
    expect(oo.issue).toHaveLength(1);
    expect(oo.issue[0]?.severity).toBe("warning");
  });
});
