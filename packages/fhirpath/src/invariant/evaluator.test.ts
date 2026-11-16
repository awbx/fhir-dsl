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

const check = (expression: string, value: unknown) =>
  compileInvariant({ key: "k", expression, severity: "error", human: "h" }).check(value).passed;

describe("invariant — replaceMatches()", () => {
  it("replaces every match, with $n group substitution", () => {
    expect(check("a.replaceMatches('o', '0') = 'f00 b00'", { a: "foo boo" })).toBe(true);
    expect(check("a.replaceMatches('(\\\\w+)@(\\\\w+)', '$2 at $1') = 'b at a'", { a: "a@b" })).toBe(true);
  });

  it("handles sdf-8a's type-name extraction", () => {
    expect(check("a.replaceMatches('\\\\..*', '') = 'Patient'", { a: "Patient.name.given" })).toBe(true);
    expect(check("a.replaceMatches('\\\\..*', '') = 'Patient'", { a: "Observation.code" })).toBe(false);
  });

  it("is empty on empty input", () => {
    expect(check("a.replaceMatches('o', '0').empty()", {})).toBe(true);
  });

  it("is indeterminate on an invalid regex, a non-string subject or a wrong arity", () => {
    expect(check("a.replaceMatches('(', 'x') = 'y'", { a: "abc" })).toBe("indeterminate");
    expect(check("a.replaceMatches('o', '0') = 'y'", { a: ["o", "o"] })).toBe("indeterminate");
    expect(check("a.replaceMatches('o', '0') = 'y'", { a: 1 })).toBe("indeterminate");
    expect(check("a.replaceMatches('o') = 'y'", { a: "o" })).toBe("indeterminate");
  });
});

describe("invariant — htmlChecks() (txt-1 / txt-2)", () => {
  const NS = 'xmlns="http://www.w3.org/1999/xhtml"';
  const txt = (div: unknown) => check("htmlChecks()", div);

  it("accepts ordinary narrative", () => {
    expect(txt(`<div ${NS}>Hello</div>`)).toBe(true);
    expect(
      txt(
        `<div ${NS}><p class="x" style="color:red">A &amp; B&#160;&lt;</p><table border="1"><tr><td colspan="2">x</td></tr></table>` +
          `<a href="http://example.org/?a=1&amp;b=2" title='a > b'>link</a><br/><ul><li>i</li></ul></div>`,
      ),
    ).toBe(true);
    expect(txt(`<div ${NS}><!-- comment --><![CDATA[ x < y ]]></div>`)).toBe(true);
    expect(txt(`<div ${NS}><img src="#pic" alt=""/></div>`)).toBe(true);
    expect(txt(`<div ${NS}>&nbsp;</div>`)).toBe(true);
  });

  it("rejects a root that isn't an XHTML div", () => {
    expect(txt(`<p ${NS}>x</p>`)).toBe(false);
    expect(txt("<div>x</div>")).toBe(false);
    expect(txt('<div xmlns="http://example.org">x</div>')).toBe(false);
  });

  it("rejects disallowed elements and attributes", () => {
    expect(txt(`<div ${NS}><script>alert(1)</script>x</div>`)).toBe(false);
    expect(txt(`<div ${NS}><form><input type="text"/></form>x</div>`)).toBe(false);
    expect(txt(`<div ${NS}><iframe src="http://x"></iframe>x</div>`)).toBe(false);
    expect(txt(`<div ${NS}><style>p{}</style>x</div>`)).toBe(false);
    expect(txt(`<div ${NS}><font color="red">x</font></div>`)).toBe(false);
    expect(txt(`<div ${NS}><ins>x</ins></div>`)).toBe(false);
    expect(txt(`<div ${NS}><p onclick="f()">x</p></div>`)).toBe(false);
    expect(txt(`<div ${NS}><a href=" JavaScript:alert(1)">x</a></div>`)).toBe(false);
    expect(txt(`<div ${NS}><a href="jav&#x09;ascript:alert(1)">x</a></div>`)).toBe(false);
  });

  it("rejects narrative without content", () => {
    expect(txt(`<div ${NS}></div>`)).toBe(false);
    expect(txt(`<div ${NS}/>`)).toBe(false);
    expect(txt(`<div ${NS}> <p>\n</p> &#32;</div>`)).toBe(false);
  });

  it("is indeterminate on markup it can't read", () => {
    expect(txt(`<div ${NS}><p>x</div>`)).toBe("indeterminate");
    expect(txt(`<div ${NS}>a & b</div>`)).toBe("indeterminate");
    expect(txt(`<div ${NS}><td nowrap>x</td></div>`)).toBe("indeterminate");
    expect(txt(`<div ${NS}>x</div>trailing`)).toBe("indeterminate");
    expect(txt(`<?xml version="1.0"?><div ${NS}>x</div>`)).toBe("indeterminate");
    expect(txt(`<div ${NS}><svg:svg xmlns:svg="http://www.w3.org/2000/svg"/>x</div>`)).toBe("indeterminate");
    expect(txt(`<div ${NS}>x`)).toBe("indeterminate");
    expect(txt(42)).toBe("indeterminate");
  });

  it("is empty when there is no div", () => {
    expect(check("text.htmlChecks().empty()", {})).toBe(true);
  });
});

describe("invariant — resolve()", () => {
  // ctm-1 lives on CareTeam.participant; here it is evaluated from the CareTeam.
  const ctm1 =
    "participant.all(onBehalfOf.exists() implies (member.resolve().iif(empty(), true, ofType(Practitioner).exists())))";

  it("resolves #id against the root's contained resources", () => {
    const careTeam = (type: string) => ({
      resourceType: "CareTeam",
      contained: [{ resourceType: type, id: "m" }],
      participant: [{ member: { reference: "#m" }, onBehalfOf: { reference: "Organization/1" } }],
    });
    expect(check(ctm1, careTeam("Practitioner"))).toBe(true);
    expect(check(ctm1, careTeam("Patient"))).toBe(false);
  });

  it("resolves a dangling #id to empty when the root has contained resources", () => {
    const res = {
      resourceType: "CareTeam",
      contained: [{ resourceType: "Patient", id: "p" }],
      participant: [{ member: { reference: "#other" } }],
    };
    expect(check("participant.member.resolve().empty()", res)).toBe(true);
    expect(check("participant.member.reference.resolve().empty()", res)).toBe(true);
    expect(check("participant.member.reference.replaceMatches('other', 'p').resolve().id = 'p'", res)).toBe(true);
  });

  it("is indeterminate for #id when the root has no contained resources", () => {
    const res = { resourceType: "CareTeam", participant: [{ member: { reference: "#m" } }] };
    expect(check("participant.member.resolve().empty()", res)).toBe("indeterminate");
  });

  it("is indeterminate for references outside the resource", () => {
    const res = {
      resourceType: "CareTeam",
      contained: [{ resourceType: "Practitioner", id: "m" }],
      participant: [{ member: { reference: "Practitioner/m" }, onBehalfOf: { reference: "Organization/1" } }],
    };
    expect(check(ctm1, res)).toBe("indeterminate");
    expect(check("participant.member.identifier.resolve().empty()", res)).toBe(true);
    expect(check("participant.onBehalfOf.reference.resolve().empty()", res)).toBe("indeterminate");
    expect(check("participant.onBehalfOf.select(identifier).resolve().empty()", res)).toBe(true);
    expect(check("participant.onBehalfOf.select(display | reference).resolve().empty()", res)).toBe("indeterminate");
  });

  it("is indeterminate when the root is not a resource (element-level invariant)", () => {
    const participant = { member: { reference: "#m" }, onBehalfOf: { reference: "Organization/1" } };
    const expr = "onBehalfOf.exists() implies (member.resolve().iif(empty(), true, ofType(Practitioner).exists()))";
    expect(check(expr, participant)).toBe("indeterminate");
  });

  it("resolves inside a Bundle by fullUrl and by Type/id", () => {
    const bundle = (memberRef: string, type = "Practitioner") => ({
      resourceType: "Bundle",
      type: "collection",
      entry: [
        { fullUrl: "urn:uuid:1", resource: { resourceType: type, id: "x" } },
        {
          fullUrl: "http://srv/fhir/CareTeam/ct",
          resource: {
            resourceType: "CareTeam",
            id: "ct",
            participant: [{ member: { reference: memberRef }, onBehalfOf: { reference: "Organization/1" } }],
          },
        },
        { fullUrl: "http://srv/fhir/Patient/p", resource: { resourceType: "Patient", id: "p" } },
        { fullUrl: "http://elsewhere/Group/g", resource: { resourceType: "Group", id: "g" } },
      ],
    });
    const ex = "entry.resource.ofType(CareTeam).participant.member.resolve()";
    expect(check(`${ex}.ofType(Practitioner).exists()`, bundle("urn:uuid:1"))).toBe(true);
    expect(check(`${ex}.ofType(Practitioner).exists()`, bundle("urn:uuid:1", "Patient"))).toBe(false);
    expect(check(`${ex}.id = 'p'`, bundle("Patient/p"))).toBe(true);
    expect(check(`${ex}.id = 'p'`, bundle("http://srv/fhir/Patient/p"))).toBe(true);
    expect(check(`${ex}.exists()`, bundle("Patient/missing"))).toBe("indeterminate");
    expect(check(`${ex}.exists()`, bundle("http://other/Patient/p"))).toBe("indeterminate");
    // Same Type/id but a different server base than the referencing entry.
    expect(check(`${ex}.exists()`, bundle("Group/g"))).toBe("indeterminate");
    // #id inside an entry resolves against that (non-contained) entry, not the Bundle.
    expect(check(`${ex}.exists()`, bundle("#nope"))).toBe(false);
  });

  it("resolves #id inside a Bundle entry against that entry's contained", () => {
    const bundle = {
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "CareTeam",
            contained: [{ resourceType: "Practitioner", id: "m" }],
            participant: [{ member: { reference: "#m" } }, { member: { reference: "#gone" } }],
          },
        },
      ],
    };
    expect(check("entry.resource.participant.member.resolve().count() = 1", bundle)).toBe(true);
  });

  it("follows the spec's bundle-references example (base and version rules)", () => {
    const obs = (fullUrl: string, reference: string) => ({
      fullUrl,
      resource: { resourceType: "Observation", id: fullUrl.split("/").pop(), subject: { reference } },
    });
    const patient = (fullUrl: string, id: string, versionId?: string) => ({
      fullUrl,
      resource: { resourceType: "Patient", id, ...(versionId ? { meta: { versionId } } : {}) },
    });
    const bundle = (entry: object) => ({
      resourceType: "Bundle",
      type: "collection",
      entry: [
        patient("http://example.org/fhir/Patient/23", "23"),
        patient("http://example.org/fhir/Patient/45", "45", "1"),
        patient("http://example.org/fhir/Patient/45", "45", "2"),
        entry,
      ],
    });
    const ex = "entry.resource.ofType(Observation).subject.resolve()";
    expect(check(`${ex}.id = '23'`, bundle(obs("http://example.org/fhir/Observation/1", "Patient/23")))).toBe(true);
    // Relative to another server's base: not this Bundle's Patient/23.
    expect(check(`${ex}.exists()`, bundle(obs("http://example.org/fhir-2/Observation/1", "Patient/23")))).toBe(
      "indeterminate",
    );
    const v2 = bundle(obs("http://example.org/fhir/Observation/1", "Patient/45/_history/2"));
    expect(check(`${ex}.meta.versionId = '2'`, v2)).toBe(true);
    const abs = bundle(obs("http://example.org/fhir/Observation/1", "http://example.org/fhir/Patient/45/_history/1"));
    expect(check(`${ex}.meta.versionId = '1'`, abs)).toBe(true);
    expect(check(`${ex}.exists()`, bundle(obs("http://example.org/fhir/Observation/1", "Patient/45")))).toBe(
      "indeterminate",
    );
  });
});
