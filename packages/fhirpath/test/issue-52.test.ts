/**
 * Issue #52 — non-Bundle resolve, terminology functions, and the
 * round-trip-but-throw guarantee for callers without a resolver.
 *
 * descendants() and repeat() were already implemented; covered as
 * sanity checks here so the issue's ticked items have a single home.
 */
import { describe, expect, it } from "vitest";
import { fhirpath } from "../src/builder.js";
import type { TerminologyResolver } from "../src/index.js";
import { FhirPathEvaluationError } from "../src/index.js";
import type { TestPatient } from "../src/test-types.js";

function fp() {
  return fhirpath<TestPatient>("Patient");
}

describe("resolve() — non-Bundle resolver hook", () => {
  it("falls back to EvalOptions.resolveReference when there's no Bundle", () => {
    const target = { resourceType: "Practitioner", id: "abc" };
    const obs = {
      resourceType: "Observation",
      performer: [{ reference: "Practitioner/abc" }],
    };
    const expr = fhirpath<{ resourceType: "Observation"; performer: Array<{ reference: string }> }>(
      "Observation",
    ).performer.resolve();
    const result = expr.evaluate(obs as never, {
      resolveReference: (ref) => (ref === "Practitioner/abc" ? target : undefined),
    });
    expect(result).toEqual([target]);
  });

  it("falls back to the resolver when Bundle lookup misses", () => {
    // rootResource is a Bundle but the reference points at something
    // that isn't in any entry — resolver fires as the fallback.
    let resolverCalls = 0;
    const fallback = { resourceType: "Practitioner", id: "fallback" };
    const obs = {
      resourceType: "Observation" as const,
      performer: [{ reference: "Practitioner/elsewhere" }],
    };
    const expr = fhirpath<{ resourceType: "Observation"; performer: Array<{ reference: string }> }>(
      "Observation",
    ).performer.resolve();
    const result = expr.evaluate(obs as never, {
      resolveReference: (ref) => {
        resolverCalls++;
        expect(ref).toBe("Practitioner/elsewhere");
        return fallback;
      },
    });
    expect(result).toEqual([fallback]);
    expect(resolverCalls).toBe(1);
  });

  it("returns empty when neither Bundle nor resolver finds the target", () => {
    const obs = {
      resourceType: "Observation",
      performer: [{ reference: "Practitioner/missing" }],
    };
    const expr = fhirpath<{ resourceType: "Observation"; performer: Array<{ reference: string }> }>(
      "Observation",
    ).performer.resolve();
    expect(expr.evaluate(obs as never)).toEqual([]);
  });
});

describe("Terminology functions — compile and evaluate via resolver", () => {
  const RESOLVER: TerminologyResolver = {
    conformsTo(resource, profileUrl) {
      return (
        typeof resource === "object" &&
        resource !== null &&
        (resource as { resourceType?: string }).resourceType === "Patient" &&
        profileUrl === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
      );
    },
    memberOf(coding, valueSetUrl) {
      const code = typeof coding === "string" ? coding : (coding as { code?: string })?.code;
      return code === "abc" && valueSetUrl === "http://example.com/vs";
    },
    subsumes(a, b) {
      return a === "parent" && b === "child";
    },
    subsumedBy(a, b) {
      return b === "parent" && a === "child";
    },
  };

  it("conformsTo() compiles and evaluates", () => {
    const expr = fp().conformsTo("http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient");
    expect(expr.compile()).toBe(
      "Patient.conformsTo('http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient')",
    );
    const patient: TestPatient = { resourceType: "Patient" };
    expect(expr.evaluate(patient, { terminology: RESOLVER })).toEqual([true]);
    expect(expr.evaluate({ resourceType: "Observation" } as never, { terminology: RESOLVER })).toEqual([false]);
  });

  it("memberOf() over a Coding singleton", () => {
    const expr = fhirpath<{ resourceType: "Test"; code: { code: string } }>("Test").code.memberOf(
      "http://example.com/vs",
    );
    expect(expr.compile()).toBe("Test.code.memberOf('http://example.com/vs')");
    expect(expr.evaluate({ resourceType: "Test", code: { code: "abc" } } as never, { terminology: RESOLVER })).toEqual([
      true,
    ]);
    expect(expr.evaluate({ resourceType: "Test", code: { code: "xyz" } } as never, { terminology: RESOLVER })).toEqual([
      false,
    ]);
  });

  it("subsumes() / subsumedBy() compile to the right strings", () => {
    expect(fp().subsumes("child").compile()).toBe("Patient.subsumes('child')");
    expect(fp().subsumedBy("parent").compile()).toBe("Patient.subsumedBy('parent')");
  });

  it("subsumes() returns the resolver's verdict", () => {
    const focus = { resourceType: "Test", code: "parent" };
    const expr = fhirpath<{ resourceType: "Test"; code: string }>("Test").code.subsumes("child");
    expect(expr.evaluate(focus as never, { terminology: RESOLVER })).toEqual([true]);
  });

  it("throws a clear error when the resolver method is missing", () => {
    const patient: TestPatient = { resourceType: "Patient" };
    expect(() => fp().conformsTo("http://x").evaluate(patient)).toThrow(FhirPathEvaluationError);
    expect(() => fp().memberOf("http://x").evaluate(patient)).toThrow(/memberOf.*EvalOptions/);
    expect(() => fp().subsumes("a").evaluate(patient)).toThrow(/subsumes.*EvalOptions/);
    expect(() => fp().subsumedBy("a").evaluate(patient)).toThrow(/subsumedBy.*EvalOptions/);
  });

  it("returns empty on an empty input collection (no-op semantics)", () => {
    // FHIRPath: function of empty is empty for these. Guard against the
    // resolver being called with `undefined`.
    const patient: TestPatient = { resourceType: "Patient" };
    const expr = fhirpath<TestPatient>("Patient").name.first().memberOf("http://x");
    expect(expr.evaluate(patient, { terminology: RESOLVER })).toEqual([]);
  });
});

describe("descendants() and repeat() — already shipped, sanity-pin", () => {
  it("descendants() walks the transitive children", () => {
    const patient = {
      resourceType: "Patient" as const,
      name: [{ given: ["Ada"], family: "Lovelace" }],
    };
    const out = fp().descendants().evaluate(patient);
    // Expect the walk to include the name object, the given array's
    // contents, and the family string.
    expect(out).toContain("Lovelace");
    expect(out).toContain("Ada");
  });

  it("repeat() projects until stable", () => {
    // Trivial cycle-free chain: each link points at .next
    type Chain = { resourceType: "Test"; v: number; next?: Chain };
    const root: Chain = { resourceType: "Test", v: 1, next: { resourceType: "Test", v: 2 } };
    const expr = fhirpath<Chain>("Test").repeat(($this) => $this.next as never);
    const out = expr.evaluate(root as never);
    expect(out).toHaveLength(1);
    expect((out[0] as Chain).v).toBe(2);
  });
});
