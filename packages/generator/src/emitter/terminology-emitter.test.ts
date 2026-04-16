import type { ResolvedValueSet } from "@fhir-dsl/terminology";
import { describe, expect, it } from "vitest";
import { emitTerminology } from "./terminology-emitter.js";

function makeVS(overrides: Partial<ResolvedValueSet> = {}): ResolvedValueSet {
  return {
    url: "http://hl7.org/fhir/ValueSet/test",
    name: "TestValueSet",
    codes: [
      { code: "a", display: "Alpha" },
      { code: "b", display: "Beta" },
    ],
    isComplete: true,
    ...overrides,
  };
}

describe("emitTerminology", () => {
  it("emits literal union type for ValueSet", () => {
    const result = emitTerminology([makeVS()]);

    expect(result.valueSetsSource).toContain('export type TestValueSet = "a" | "b";');
  });

  it("emits const namespace object", () => {
    const result = emitTerminology([makeVS()]);

    expect(result.codeSystemsSource).toContain("export const TestValueSet = {");
    expect(result.codeSystemsSource).toContain('"a" as const');
    expect(result.codeSystemsSource).toContain('"b" as const');
  });

  it("builds bindingTypeMap from ValueSet URLs", () => {
    const result = emitTerminology([makeVS()]);

    expect(result.bindingTypeMap.get("http://hl7.org/fhir/ValueSet/test")).toBe("TestValueSet");
  });

  it("skips ValueSets with no codes", () => {
    const result = emitTerminology([makeVS({ codes: [] })]);

    expect(result.valueSetsSource).toBe("");
    expect(result.codeSystemsSource).toBe("");
    expect(result.bindingTypeMap.size).toBe(0);
  });

  it("emits index re-exports", () => {
    const result = emitTerminology([makeVS()]);

    expect(result.indexSource).toContain('export * from "./valuesets.js"');
    expect(result.indexSource).toContain('export * from "./codesystems.js"');
  });

  it("handles codes with special characters", () => {
    const result = emitTerminology([
      makeVS({
        codes: [{ code: "not-present" }, { code: "http://example.com" }],
      }),
    ]);

    expect(result.valueSetsSource).toContain('"not-present"');
    expect(result.codeSystemsSource).toContain("NotPresent:");
  });

  it("sanitizes names with spaces into valid identifiers", () => {
    const result = emitTerminology([makeVS({ name: "Marital Status Codes", url: "http://example.com/vs/marital" })]);

    expect(result.valueSetsSource).toContain("export type MaritalStatusCodes =");
    expect(result.bindingTypeMap.get("http://example.com/vs/marital")).toBe("MaritalStatusCodes");
  });

  it("deduplicates sanitized names", () => {
    const result = emitTerminology([
      makeVS({ name: "TestCodes", url: "http://a.com", codes: [{ code: "a" }] }),
      makeVS({ name: "TestCodes", url: "http://b.com", codes: [{ code: "b" }] }),
    ]);

    // Only the first one should be emitted
    const matches = result.valueSetsSource.match(/export type TestCodes/g);
    expect(matches).toHaveLength(1);
  });

  it("sorts ValueSets by name", () => {
    const result = emitTerminology([
      makeVS({ name: "Zebra", url: "http://z.com", codes: [{ code: "z" }] }),
      makeVS({ name: "Alpha", url: "http://a.com", codes: [{ code: "a" }] }),
    ]);

    const alphaIdx = result.valueSetsSource.indexOf("Alpha");
    const zebraIdx = result.valueSetsSource.indexOf("Zebra");
    expect(alphaIdx).toBeLessThan(zebraIdx);
  });
});
