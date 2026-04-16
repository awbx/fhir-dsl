import { describe, expect, it } from "vitest";
import { TerminologyRegistry } from "./registry.js";

describe("TerminologyRegistry", () => {
  it("resolves ValueSets from pre-expanded entries", () => {
    const registry = new TerminologyRegistry();

    registry.loadExpansions([
      {
        resourceType: "ValueSet",
        url: "http://hl7.org/fhir/ValueSet/administrative-gender",
        name: "AdministrativeGender",
        expansion: {
          contains: [
            { code: "male", display: "Male" },
            { code: "female", display: "Female" },
          ],
        },
      },
    ]);

    registry.resolveAll();

    const resolved = registry.resolve("http://hl7.org/fhir/ValueSet/administrative-gender");
    expect(resolved).toBeDefined();
    expect(resolved!.codes).toHaveLength(2);
    expect(resolved!.codes[0]!.code).toBe("male");
  });

  it("resolves ValueSets from compose using loaded CodeSystems", () => {
    const registry = new TerminologyRegistry();

    registry.loadCodeSystem({
      resourceType: "CodeSystem",
      url: "http://example.com/cs",
      name: "TestCS",
      content: "complete",
      concept: [
        { code: "a", display: "Alpha" },
        { code: "b", display: "Beta" },
      ],
    });

    registry.loadValueSet({
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/test",
      name: "Test",
      compose: {
        include: [{ system: "http://example.com/cs" }],
      },
    });

    registry.resolveAll();

    const resolved = registry.resolve("http://example.com/ValueSet/test");
    expect(resolved).toBeDefined();
    expect(resolved!.codes).toHaveLength(2);
  });

  it("prefers expansion over compose resolution", () => {
    const registry = new TerminologyRegistry();

    // Load expansion with 2 codes
    registry.loadExpansions([
      {
        resourceType: "ValueSet",
        url: "http://example.com/ValueSet/test",
        name: "Test",
        expansion: {
          contains: [{ code: "expanded-a" }, { code: "expanded-b" }],
        },
      },
    ]);

    // Also load the ValueSet with compose (3 codes)
    registry.loadValueSet({
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/test",
      name: "Test",
      compose: {
        include: [
          {
            system: "http://example.com/cs",
            concept: [{ code: "a" }, { code: "b" }, { code: "c" }],
          },
        ],
      },
    });

    registry.resolveAll();

    const resolved = registry.resolve("http://example.com/ValueSet/test");
    // Should use the expansion (2 codes), not compose (3 codes)
    expect(resolved!.codes).toHaveLength(2);
    expect(resolved!.codes[0]!.code).toBe("expanded-a");
  });

  it("resolves URL with version suffix", () => {
    const registry = new TerminologyRegistry();

    registry.loadExpansions([
      {
        resourceType: "ValueSet",
        url: "http://hl7.org/fhir/ValueSet/gender",
        name: "Gender",
        expansion: { contains: [{ code: "male" }] },
      },
    ]);

    registry.resolveAll();

    // Should resolve even with |version suffix
    const resolved = registry.resolve("http://hl7.org/fhir/ValueSet/gender|4.0.1");
    expect(resolved).toBeDefined();
    expect(resolved!.codes[0]!.code).toBe("male");
  });

  it("returns undefined for unknown ValueSet", () => {
    const registry = new TerminologyRegistry();
    registry.resolveAll();

    expect(registry.resolve("http://example.com/ValueSet/nonexistent")).toBeUndefined();
  });

  it("tracks counts", () => {
    const registry = new TerminologyRegistry();

    registry.loadCodeSystem({
      resourceType: "CodeSystem",
      url: "http://example.com/cs",
      name: "CS",
      content: "complete",
      concept: [{ code: "a" }],
    });

    registry.loadExpansions([
      {
        resourceType: "ValueSet",
        url: "http://example.com/ValueSet/a",
        name: "A",
        expansion: { contains: [{ code: "x" }] },
      },
    ]);

    registry.resolveAll();

    expect(registry.codeSystemCount).toBe(1);
    expect(registry.resolvedCount).toBe(1);
  });
});
