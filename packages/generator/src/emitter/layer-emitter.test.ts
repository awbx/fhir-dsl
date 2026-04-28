import { describe, expect, it } from "vitest";
import type { ResourceModel } from "../model/resource-model.js";
import { emitLayers, layerOf } from "./layer-emitter.js";

const fakeModel = (name: string): ResourceModel => ({
  name,
  url: `http://hl7.org/fhir/StructureDefinition/${name}`,
  kind: "resource",
  isAbstract: false,
  properties: [],
  backboneElements: [],
});

describe("layerOf", () => {
  it("classifies foundational types", () => {
    expect(layerOf("Bundle")).toBe("Foundation");
    expect(layerOf("CapabilityStatement")).toBe("Foundation");
    expect(layerOf("StructureDefinition")).toBe("Foundation");
    expect(layerOf("AuditEvent")).toBe("Foundation");
  });

  it("classifies base types", () => {
    expect(layerOf("Patient")).toBe("Base");
    expect(layerOf("Practitioner")).toBe("Base");
    expect(layerOf("Organization")).toBe("Base");
    expect(layerOf("Encounter")).toBe("Base");
  });

  it("classifies clinical types", () => {
    expect(layerOf("Observation")).toBe("Clinical");
    expect(layerOf("Condition")).toBe("Clinical");
    expect(layerOf("MedicationRequest")).toBe("Clinical");
    expect(layerOf("CarePlan")).toBe("Clinical");
  });

  it("classifies financial types", () => {
    expect(layerOf("Account")).toBe("Financial");
    expect(layerOf("Claim")).toBe("Financial");
    expect(layerOf("Coverage")).toBe("Financial");
    expect(layerOf("ExplanationOfBenefit")).toBe("Financial");
  });

  it("classifies specialized types", () => {
    expect(layerOf("ResearchStudy")).toBe("Specialized");
    expect(layerOf("PlanDefinition")).toBe("Specialized");
    expect(layerOf("Measure")).toBe("Specialized");
  });

  it("falls back to Specialized for unknown types", () => {
    expect(layerOf("SomeFutureResource")).toBe("Specialized");
  });
});

describe("emitLayers", () => {
  const source = emitLayers([fakeModel("Patient"), fakeModel("Observation"), fakeModel("Account")]);

  it("emits a typed FhirLayer alias", () => {
    expect(source).toContain(
      'export type FhirLayer = "Foundation" | "Base" | "Clinical" | "Financial" | "Specialized";',
    );
  });

  it("maps each generated resource to its layer", () => {
    expect(source).toContain('Patient: "Base"');
    expect(source).toContain('Observation: "Clinical"');
    expect(source).toContain('Account: "Financial"');
  });

  it("emits the as-const + satisfies guard", () => {
    expect(source).toContain("as const satisfies Record<string, FhirLayer>");
  });

  it("emits referencesUpward helper", () => {
    expect(source).toContain("export function referencesUpward(");
  });

  it("orders entries alphabetically for deterministic output", () => {
    // Patient (P) should appear before Observation (O is lower alphabetically — O<P)
    const oIdx = source.indexOf("Observation:");
    const pIdx = source.indexOf("Patient:");
    expect(oIdx).toBeGreaterThan(-1);
    expect(pIdx).toBeGreaterThan(oIdx);
  });
});
