import { describe, expect, it } from "vitest";
import type { ExtensionModel } from "../model/extension-model.js";
import { makeFallbackMapper } from "../spec/test-helpers.js";
import { emitExtension, emitExtensionIndex, emitExtensionRegistry } from "./extension-emitter.js";

const MAPPER = makeFallbackMapper();

function makeExt(overrides: Partial<ExtensionModel> = {}): ExtensionModel {
  return {
    name: "USCoreRaceExtension",
    url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
    igName: "hl7.fhir.us.core",
    description: "US Core Race Extension",
    valueTypes: [{ code: "CodeableConcept" }],
    isComplex: false,
    ...overrides,
  };
}

describe("emitExtension", () => {
  it("emits an interface extending Extension<URL> with the URL pinned", () => {
    const out = emitExtension(makeExt(), MAPPER);
    expect(out).toContain(
      'export interface USCoreRaceExtension extends Extension<"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race">',
    );
    expect(out).toContain('url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race";');
  });

  it("emits the narrowed value[x] field when the extension is simple", () => {
    const out = emitExtension(makeExt(), MAPPER);
    expect(out).toContain("valueCodeableConcept?: CodeableConcept;");
  });

  it("imports CodeableConcept and Extension from datatypes", () => {
    const out = emitExtension(makeExt(), MAPPER);
    expect(out).toContain('import type { CodeableConcept, Extension } from "../datatypes.js"');
  });

  it("omits the value field for complex extensions", () => {
    const out = emitExtension(makeExt({ isComplex: true, valueTypes: [] }), MAPPER);
    expect(out).not.toContain("valueCodeableConcept");
    // It still emits the URL and the open Extension extension.
    expect(out).toContain("extends Extension<");
  });

  it("renders multiple value[x] choices when more than one is allowed", () => {
    const out = emitExtension(makeExt({ valueTypes: [{ code: "Quantity" }, { code: "string" }] }), MAPPER);
    expect(out).toContain("valueQuantity?: Quantity;");
    expect(out).toContain("valueString?: FhirString;");
  });

  it("includes a JSDoc block when description is present", () => {
    const out = emitExtension(makeExt(), MAPPER);
    expect(out).toContain("/**");
    expect(out).toContain(" * US Core Race Extension");
    expect(out).toContain("http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");
  });
});

describe("emitExtensionIndex", () => {
  it("re-exports each extension file in alphabetical order", () => {
    const out = emitExtensionIndex([makeExt({ name: "BetaExtension" }), makeExt({ name: "AlphaExtension" })]);
    const alphaIdx = out.indexOf("alpha-extension");
    const betaIdx = out.indexOf("beta-extension");
    expect(alphaIdx).toBeLessThan(betaIdx);
  });
});

describe("emitExtensionRegistry", () => {
  it("emits an ExtensionRegistry mapping URL → typed extension", () => {
    const out = emitExtensionRegistry([makeExt()]);
    expect(out).toContain('import type { USCoreRaceExtension } from "./uscore-race-extension.js"');
    expect(out).toContain("export interface ExtensionRegistry");
    expect(out).toContain('"http://hl7.org/fhir/us/core/StructureDefinition/us-core-race": USCoreRaceExtension;');
  });
});
