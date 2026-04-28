import { describe, expect, it } from "vitest";
import { makeFallbackCatalog } from "../spec/test-helpers.js";
import { isExtensionSD, parseExtension } from "./extension.js";

const CATALOG = makeFallbackCatalog();

function makeExtSD(overrides: Record<string, unknown> = {}) {
  return {
    resourceType: "StructureDefinition" as const,
    url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
    name: "USCoreRaceExtension",
    title: "US Core Race Extension",
    type: "Extension" as const,
    baseDefinition: "http://hl7.org/fhir/StructureDefinition/Extension",
    derivation: "constraint" as const,
    abstract: false,
    kind: "complex-type" as const,
    ...overrides,
  };
}

describe("isExtensionSD", () => {
  it("recognises extension StructureDefinitions", () => {
    expect(isExtensionSD(makeExtSD())).toBe(true);
  });

  it("rejects regular profile StructureDefinitions", () => {
    expect(isExtensionSD({ ...makeExtSD(), type: "Patient", kind: "resource" })).toBe(false);
  });

  it("rejects abstract or specialization SDs", () => {
    expect(isExtensionSD({ ...makeExtSD(), derivation: "specialization" })).toBe(false);
  });

  it("rejects non-objects", () => {
    expect(isExtensionSD(null)).toBe(false);
    expect(isExtensionSD("Extension")).toBe(false);
  });
});

describe("parseExtension", () => {
  it("captures URL, name, and title", () => {
    const sd = makeExtSD();
    const ext = parseExtension(sd as any, "hl7.fhir.us.core", CATALOG);
    expect(ext.name).toBe("USCoreRaceExtension");
    expect(ext.url).toBe("http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");
    expect(ext.igName).toBe("hl7.fhir.us.core");
    expect(ext.description).toBe("US Core Race Extension");
  });

  it("extracts a single narrowed value[x] type", () => {
    const sd = makeExtSD({
      differential: {
        element: [
          { path: "Extension" },
          { path: "Extension.value[x]", min: 0, max: "1", type: [{ code: "CodeableConcept" }] },
        ],
      },
    });
    const ext = parseExtension(sd as any, "hl7.fhir.us.core", CATALOG);
    expect(ext.valueTypes).toEqual([{ code: "CodeableConcept" }]);
    expect(ext.isComplex).toBe(false);
  });

  it("flags complex extensions when only sub-extensions are constrained", () => {
    const sd = makeExtSD({
      differential: {
        element: [
          { path: "Extension" },
          { path: "Extension.extension", slicing: { discriminator: [{ type: "value", path: "url" }] } },
          {
            path: "Extension.extension",
            sliceName: "ombCategory",
            min: 0,
            max: "*",
            type: [{ code: "Extension" }],
          },
        ],
      },
    });
    const ext = parseExtension(sd as any, "hl7.fhir.us.core", CATALOG);
    expect(ext.isComplex).toBe(true);
    expect(ext.valueTypes).toEqual([]);
  });

  it("sanitises kebab-case names to PascalCase + Extension suffix", () => {
    const sd = makeExtSD({ name: "us-core-race", url: "http://example/ext/us-core-race" });
    const ext = parseExtension(sd as any, "hl7.fhir.us.core", CATALOG);
    expect(ext.name).toBe("UsCoreRaceExtension");
  });

  it("does not double-suffix when SD name already ends with Extension", () => {
    const sd = makeExtSD({ name: "USCoreRaceExtension" });
    const ext = parseExtension(sd as any, "hl7.fhir.us.core", CATALOG);
    expect(ext.name).toBe("USCoreRaceExtension");
  });
});
