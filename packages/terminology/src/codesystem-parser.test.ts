import { describe, expect, it } from "vitest";
import { parseCodeSystem } from "./codesystem-parser.js";

describe("parseCodeSystem", () => {
  it("flattens a complete CodeSystem with flat concepts", () => {
    const cs = {
      resourceType: "CodeSystem",
      url: "http://hl7.org/fhir/administrative-gender",
      name: "AdministrativeGender",
      content: "complete",
      concept: [
        { code: "male", display: "Male" },
        { code: "female", display: "Female" },
        { code: "other", display: "Other" },
        { code: "unknown", display: "Unknown" },
      ],
    };

    const result = parseCodeSystem(cs);

    expect(result).toBeDefined();
    expect(result!.url).toBe("http://hl7.org/fhir/administrative-gender");
    expect(result!.content).toBe("complete");
    expect(result!.concepts).toHaveLength(4);
    expect(result!.concepts.map((c) => c.code)).toEqual(["male", "female", "other", "unknown"]);
  });

  it("flattens hierarchical concepts", () => {
    const cs = {
      resourceType: "CodeSystem",
      url: "http://example.com/cs/hierarchical",
      name: "Hierarchical",
      content: "complete",
      concept: [
        {
          code: "A",
          display: "Category A",
          concept: [
            { code: "A1", display: "Sub A1" },
            { code: "A2", display: "Sub A2" },
          ],
        },
        { code: "B", display: "Category B" },
      ],
    };

    const result = parseCodeSystem(cs);

    expect(result!.concepts).toHaveLength(4);
    expect(result!.concepts.map((c) => c.code)).toEqual(["A", "A1", "A2", "B"]);
  });

  it("returns empty concepts for not-present content", () => {
    const cs = {
      resourceType: "CodeSystem",
      url: "http://snomed.info/sct",
      name: "SNOMEDCT",
      content: "not-present",
      concept: [{ code: "should-be-ignored" }],
    };

    const result = parseCodeSystem(cs);

    expect(result!.content).toBe("not-present");
    expect(result!.concepts).toHaveLength(0);
  });

  it("returns undefined for non-CodeSystem input", () => {
    expect(parseCodeSystem({ resourceType: "ValueSet" })).toBeUndefined();
    expect(parseCodeSystem(null)).toBeUndefined();
    expect(parseCodeSystem("string")).toBeUndefined();
  });
});
