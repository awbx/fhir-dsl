import { describe, expect, it } from "vitest";
import { parseExpansion, parseExpansionsBundle } from "./expansion-parser.js";

describe("parseExpansion", () => {
  it("parses a pre-expanded ValueSet", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://hl7.org/fhir/ValueSet/administrative-gender",
      name: "AdministrativeGender",
      expansion: {
        contains: [
          { system: "http://hl7.org/fhir/administrative-gender", code: "male", display: "Male" },
          { system: "http://hl7.org/fhir/administrative-gender", code: "female", display: "Female" },
          { system: "http://hl7.org/fhir/administrative-gender", code: "other", display: "Other" },
          { system: "http://hl7.org/fhir/administrative-gender", code: "unknown", display: "Unknown" },
        ],
      },
    };

    const result = parseExpansion(vs);

    expect(result).toBeDefined();
    expect(result!.url).toBe("http://hl7.org/fhir/ValueSet/administrative-gender");
    expect(result!.name).toBe("AdministrativeGender");
    expect(result!.isComplete).toBe(true);
    expect(result!.codes).toHaveLength(4);
    expect(result!.codes.map((c) => c.code)).toEqual(["male", "female", "other", "unknown"]);
  });

  it("flattens nested contains", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/nested",
      name: "Nested",
      expansion: {
        contains: [
          { code: "a", display: "A" },
          {
            code: "b",
            display: "B",
            contains: [
              { code: "b1", display: "B1" },
              { code: "b2", display: "B2" },
            ],
          },
        ],
      },
    };

    const result = parseExpansion(vs);

    expect(result!.codes).toHaveLength(4);
    expect(result!.codes.map((c) => c.code)).toEqual(["a", "b", "b1", "b2"]);
  });

  it("skips abstract entries", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/abstract",
      name: "WithAbstract",
      expansion: {
        contains: [
          { code: "parent", display: "Parent", abstract: true },
          { code: "child", display: "Child" },
        ],
      },
    };

    const result = parseExpansion(vs);

    expect(result!.codes).toHaveLength(1);
    expect(result!.codes[0]!.code).toBe("child");
  });

  it("returns undefined for non-expanded ValueSet", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/compose-only",
      compose: { include: [{ system: "http://example.com" }] },
    };

    expect(parseExpansion(vs)).toBeUndefined();
  });

  it("returns undefined for empty expansion", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/empty",
      expansion: { contains: [] },
    };

    expect(parseExpansion(vs)).toBeUndefined();
  });
});

describe("parseExpansionsBundle", () => {
  it("parses a Bundle of expanded ValueSets", () => {
    const bundle = {
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "ValueSet",
            url: "http://example.com/ValueSet/a",
            name: "A",
            expansion: { contains: [{ code: "x" }] },
          },
        },
        {
          resource: {
            resourceType: "ValueSet",
            url: "http://example.com/ValueSet/b",
            name: "B",
            expansion: { contains: [{ code: "y" }] },
          },
        },
      ],
    };

    const result = parseExpansionsBundle(bundle);

    expect(result.size).toBe(2);
    expect(result.get("http://example.com/ValueSet/a")!.codes[0]!.code).toBe("x");
    expect(result.get("http://example.com/ValueSet/b")!.codes[0]!.code).toBe("y");
  });
});
