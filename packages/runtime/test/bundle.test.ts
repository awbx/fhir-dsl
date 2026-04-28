import { describe, expect, it } from "vitest";
import { resolveReference, resolveReferences } from "../src/bundle.js";

const patient = { resourceType: "Patient", id: "p1", name: [{ family: "Smith" }] };
const practitioner = { resourceType: "Practitioner", id: "pr1", name: [{ family: "Jones" }] };

const bundle = {
  resourceType: "Bundle",
  type: "searchset",
  entry: [
    { fullUrl: "https://hapi.fhir.org/baseR4/Patient/p1", resource: patient },
    { fullUrl: "https://hapi.fhir.org/baseR4/Practitioner/pr1", resource: practitioner },
  ],
};

describe("resolveReference", () => {
  it("resolves an absolute fullUrl reference", () => {
    expect(resolveReference(bundle, "https://hapi.fhir.org/baseR4/Patient/p1")).toBe(patient);
  });

  it("resolves a Reference object via .reference", () => {
    expect(resolveReference(bundle, { reference: "Patient/p1" })).toBe(patient);
  });

  it("resolves a relative ResourceType/id reference", () => {
    expect(resolveReference(bundle, "Practitioner/pr1")).toBe(practitioner);
  });

  it("returns undefined when nothing matches", () => {
    expect(resolveReference(bundle, "Patient/nope")).toBeUndefined();
    expect(resolveReference(bundle, "Foo/p1")).toBeUndefined();
  });

  it("handles null/undefined refs gracefully", () => {
    expect(resolveReference(bundle, null)).toBeUndefined();
    expect(resolveReference(bundle, undefined)).toBeUndefined();
    expect(resolveReference(bundle, {})).toBeUndefined();
  });

  it("resolves contained #id refs against the enclosing resource", () => {
    const obs = {
      resourceType: "Observation",
      contained: [{ resourceType: "Patient", id: "local", name: [{ family: "Local" }] }],
    };
    const r = resolveReference(undefined, "#local", { containedOn: obs });
    expect(r?.resourceType).toBe("Patient");
  });

  it("does not resolve #id without containedOn", () => {
    expect(resolveReference(bundle, "#local")).toBeUndefined();
  });

  it("ignores history-suffix forms gracefully (Patient/p1/_history/2 — last seg is _history then 2)", () => {
    // resolveReference uses ResourceType/id heuristic. A history form
    // won't match (lastSegment becomes "_history"). Documenting that
    // versioned references aren't supported by the basic resolver.
    expect(resolveReference(bundle, "Patient/p1/_history/2")).toBeUndefined();
  });
});

describe("resolveReferences", () => {
  it("hydrates an array of refs, dropping unresolved", () => {
    const out = resolveReferences(bundle, [
      { reference: "Patient/p1" },
      { reference: "Patient/none" },
      { reference: "Practitioner/pr1" },
    ]);
    expect(out).toEqual([patient, practitioner]);
  });

  it("returns [] for undefined input", () => {
    expect(resolveReferences(bundle, undefined)).toEqual([]);
  });
});
