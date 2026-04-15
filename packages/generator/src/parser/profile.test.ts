import { describe, expect, it } from "vitest";
import { parseProfile } from "./profile.js";

function makeSD(overrides: Record<string, unknown> = {}) {
  return {
    resourceType: "StructureDefinition" as const,
    url: "http://example.org/StructureDefinition/test-profile",
    name: "TestProfile",
    type: "Observation",
    baseDefinition: "http://hl7.org/fhir/StructureDefinition/Observation",
    derivation: "constraint" as const,
    abstract: false,
    kind: "resource",
    ...overrides,
  };
}

function makeElement(path: string, overrides: Record<string, unknown> = {}) {
  return { path, ...overrides };
}

describe("parseProfile", () => {
  it("returns basic profile metadata", () => {
    const sd = makeSD({
      title: "Test Observation Profile",
      differential: { element: [makeElement("Observation")] },
    });

    const result = parseProfile(sd as any, "test.ig");

    expect(result.name).toBe("TestProfile");
    expect(result.url).toBe("http://example.org/StructureDefinition/test-profile");
    expect(result.baseResourceType).toBe("Observation");
    expect(result.igName).toBe("test.ig");
    expect(result.description).toBe("Test Observation Profile");
  });

  it("uses sd.name as description when title is missing", () => {
    const sd = makeSD({ differential: { element: [] } });
    const result = parseProfile(sd as any, "test.ig");
    expect(result.description).toBe("TestProfile");
  });

  it("extracts constrained required properties", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.status", {
            min: 1,
            max: "1",
            type: [{ code: "code" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");

    expect(result.constrainedProperties).toHaveLength(1);
    expect(result.constrainedProperties[0]!.name).toBe("status");
    expect(result.constrainedProperties[0]!.isRequired).toBe(true);
    expect(result.constrainedProperties[0]!.isArray).toBe(false);
  });

  it("skips root element", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation", { min: 0 }),
          makeElement("Observation.status", { min: 1, type: [{ code: "code" }] }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(1);
  });

  it("skips nested backbone elements (dots beyond first level)", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.component.value", {
            min: 1,
            type: [{ code: "Quantity" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("skips sliced elements (colon in path)", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.component:systolic", {
            min: 1,
            type: [{ code: "BackboneElement" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("skips base inherited properties unless constrained with min > 0", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.id", { type: [{ code: "id" }] }),
          makeElement("Observation.meta", { min: 1, type: [{ code: "Meta" }] }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    // id (min=0 default) is skipped, meta (min=1) is included
    expect(result.constrainedProperties).toHaveLength(1);
    expect(result.constrainedProperties[0]!.name).toBe("meta");
  });

  it("filters out Reference-only types", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.subject", {
            min: 1,
            type: [{ code: "Reference", targetProfile: ["http://hl7.org/fhir/StructureDefinition/Patient"] }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    // Reference is filtered out, no usable types remain
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("handles choice types by expanding each type", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.value[x]", {
            min: 1,
            type: [{ code: "Quantity" }, { code: "string" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(2);
    expect(result.constrainedProperties[0]!.name).toBe("valueQuantity");
    expect(result.constrainedProperties[1]!.name).toBe("valueString");
    expect(result.constrainedProperties[0]!.isChoiceType).toBe(true);
  });

  it("resolves FHIRPath system types in choice type names", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.value[x]", {
            min: 1,
            type: [{ code: "http://hl7.org/fhirpath/System.Boolean" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties[0]!.name).toBe("valueBoolean");
  });

  it("marks array properties from max=*", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.category", {
            min: 1,
            max: "*",
            type: [{ code: "CodeableConcept" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties[0]!.isArray).toBe(true);
  });

  it("skips non-required non-choice properties", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.note", {
            min: 0,
            type: [{ code: "Annotation" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("falls back to snapshot when differential is missing", () => {
    const sd = makeSD({
      snapshot: {
        element: [makeElement("Observation"), makeElement("Observation.status", { min: 1, type: [{ code: "code" }] })],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(1);
  });

  it("derives slug from URL last segment when lowercase", () => {
    const sd = makeSD({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.slug).toBe("us-core-patient");
  });

  it("derives slug from name when URL last segment is PascalCase", () => {
    const sd = makeSD({
      url: "http://example.org/StructureDefinition/MyCustomProfile",
      name: "MyCustomProfile",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.slug).toBe("my-custom-profile");
  });

  it("sanitizes name removing special characters", () => {
    const sd = makeSD({
      name: "US-Core Patient Profile",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.name).toBe("USCorePatientProfile");
  });

  it("deduplicates property names", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.code", { min: 1, type: [{ code: "CodeableConcept" }] }),
          makeElement("Observation.code", { min: 1, type: [{ code: "CodeableConcept" }] }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toHaveLength(1);
  });

  it("handles empty element list", () => {
    const sd = makeSD({ differential: { element: [] } });
    const result = parseProfile(sd as any, "test.ig");
    expect(result.constrainedProperties).toEqual([]);
  });
});
