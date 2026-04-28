import { describe, expect, it } from "vitest";
import { makeFallbackCatalog } from "../spec/test-helpers.js";
import { parseProfile } from "./profile.js";

const CATALOG = makeFallbackCatalog();

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

    const result = parseProfile(sd as any, "test.ig", CATALOG);

    expect(result.name).toBe("TestProfile");
    expect(result.url).toBe("http://example.org/StructureDefinition/test-profile");
    expect(result.baseResourceType).toBe("Observation");
    expect(result.igName).toBe("test.ig");
    expect(result.description).toBe("Test Observation Profile");
  });

  it("uses sd.name as description when title is missing", () => {
    const sd = makeSD({ differential: { element: [] } });
    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);

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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("extracts sliced elements as separate slice models", () => {
    const sd = makeSD({
      differential: {
        element: [
          makeElement("Observation"),
          makeElement("Observation.component", { slicing: { discriminator: [{ type: "value", path: "code" }] } }),
          makeElement("Observation.component:systolic", {
            min: 1,
            max: "1",
            type: [{ code: "BackboneElement" }],
            short: "Systolic blood pressure",
          }),
          makeElement("Observation.component:diastolic", {
            min: 1,
            max: "1",
            type: [{ code: "BackboneElement" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toHaveLength(0);
    expect(result.slices).toHaveLength(2);

    const systolic = result.slices.find((s) => s.sliceName === "systolic");
    expect(systolic).toBeDefined();
    expect(systolic?.basePropName).toBe("component");
    expect(systolic?.sanitizedName).toBe("systolic");
    expect(systolic?.min).toBe(1);
    expect(systolic?.max).toBe("1");
    expect(systolic?.discriminator).toEqual([{ type: "value", path: "code" }]);
    expect(systolic?.description).toBe("Systolic blood pressure");
  });

  it("extracts an extension slice with its profile URL", () => {
    const sd = makeSD({
      type: "Patient",
      baseDefinition: "http://hl7.org/fhir/StructureDefinition/Patient",
      differential: {
        element: [
          makeElement("Patient"),
          makeElement("Patient.extension", { slicing: { discriminator: [{ type: "value", path: "url" }] } }),
          makeElement("Patient.extension:race", {
            sliceName: "race",
            min: 0,
            max: "1",
            type: [
              {
                code: "Extension",
                profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"],
              },
            ],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.slices).toHaveLength(1);
    const race = result.slices[0]!;
    expect(race.basePropName).toBe("extension");
    expect(race.sliceName).toBe("race");
    expect(race.extensionUrl).toBe("http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");
    expect(race.discriminator).toEqual([{ type: "value", path: "url" }]);
  });

  it("normalises kebab-case slice names to camelCase in sanitizedName", () => {
    const sd = makeSD({
      type: "Patient",
      differential: {
        element: [
          makeElement("Patient"),
          makeElement("Patient.extension", { slicing: { discriminator: [{ type: "value", path: "url" }] } }),
          makeElement("Patient.extension:us-core-race", {
            sliceName: "us-core-race",
            min: 0,
            max: "1",
            type: [{ code: "Extension" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.slices[0]!.sanitizedName).toBe("usCoreRace");
  });

  it("ignores nested slice elements (e.g., extension:race.url)", () => {
    const sd = makeSD({
      type: "Patient",
      differential: {
        element: [
          makeElement("Patient"),
          makeElement("Patient.extension", { slicing: { discriminator: [{ type: "value", path: "url" }] } }),
          makeElement("Patient.extension:race", {
            sliceName: "race",
            min: 0,
            type: [{ code: "Extension" }],
          }),
          makeElement("Patient.extension:race.url", {
            min: 1,
            type: [{ code: "uri" }],
          }),
        ],
      },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    // Only the top-level race slice — the .url child is part of the
    // extension's internal shape, not a separate slice.
    expect(result.slices).toHaveLength(1);
    expect(result.slices[0]!.sliceName).toBe("race");
  });

  it("returns an empty slices array when the profile defines no slicing", () => {
    const sd = makeSD({
      differential: {
        element: [makeElement("Observation"), makeElement("Observation.status", { min: 1, type: [{ code: "code" }] })],
      },
    });
    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.slices).toEqual([]);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toHaveLength(0);
  });

  it("falls back to snapshot when differential is missing", () => {
    const sd = makeSD({
      snapshot: {
        element: [makeElement("Observation"), makeElement("Observation.status", { min: 1, type: [{ code: "code" }] })],
      },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toHaveLength(1);
  });

  it("derives slug from URL last segment when lowercase", () => {
    const sd = makeSD({
      url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.slug).toBe("us-core-patient");
  });

  it("derives slug from name when URL last segment is PascalCase", () => {
    const sd = makeSD({
      url: "http://example.org/StructureDefinition/MyCustomProfile",
      name: "MyCustomProfile",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.slug).toBe("my-custom-profile");
  });

  it("sanitizes name removing special characters", () => {
    const sd = makeSD({
      name: "US-Core Patient Profile",
      differential: { element: [] },
    });

    const result = parseProfile(sd as any, "test.ig", CATALOG);
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

    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toHaveLength(1);
  });

  it("handles empty element list", () => {
    const sd = makeSD({ differential: { element: [] } });
    const result = parseProfile(sd as any, "test.ig", CATALOG);
    expect(result.constrainedProperties).toEqual([]);
  });
});
