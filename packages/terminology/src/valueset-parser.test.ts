import { describe, expect, it } from "vitest";
import type { CodeSystemModel } from "./model.js";
import { resolveCompose } from "./valueset-parser.js";

function makeCsLookup(...systems: CodeSystemModel[]): Map<string, CodeSystemModel> {
  return new Map(systems.map((cs) => [cs.url, cs]));
}

describe("resolveCompose", () => {
  it("resolves explicit concept lists", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/test",
      name: "Test",
      compose: {
        include: [
          {
            system: "http://example.com/cs",
            concept: [
              { code: "a", display: "Alpha" },
              { code: "b", display: "Beta" },
            ],
          },
        ],
      },
    };

    const result = resolveCompose(vs, new Map());

    expect(result).toBeDefined();
    expect(result!.codes).toHaveLength(2);
    expect(result!.codes[0]!.code).toBe("a");
    expect(result!.codes[0]!.system).toBe("http://example.com/cs");
    expect(result!.isComplete).toBe(true);
  });

  it("resolves system-only include from complete CodeSystem", () => {
    const cs: CodeSystemModel = {
      url: "http://example.com/cs",
      name: "TestCS",
      content: "complete",
      concepts: [
        { code: "x", display: "X" },
        { code: "y", display: "Y" },
      ],
    };

    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/all-codes",
      name: "AllCodes",
      compose: {
        include: [{ system: "http://example.com/cs" }],
      },
    };

    const result = resolveCompose(vs, makeCsLookup(cs));

    expect(result!.codes).toHaveLength(2);
    expect(result!.isComplete).toBe(true);
  });

  it("marks incomplete when CodeSystem is not-present", () => {
    const cs: CodeSystemModel = {
      url: "http://snomed.info/sct",
      name: "SNOMED",
      content: "not-present",
      concepts: [],
    };

    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/snomed-subset",
      name: "SnomedSubset",
      compose: {
        include: [{ system: "http://snomed.info/sct" }],
      },
    };

    const result = resolveCompose(vs, makeCsLookup(cs));

    expect(result).toBeUndefined(); // no codes resolved
  });

  it("applies exclude rules", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/excluded",
      name: "Excluded",
      compose: {
        include: [
          {
            system: "http://example.com/cs",
            concept: [
              { code: "a", display: "A" },
              { code: "b", display: "B" },
              { code: "c", display: "C" },
            ],
          },
        ],
        exclude: [
          {
            system: "http://example.com/cs",
            concept: [{ code: "b" }],
          },
        ],
      },
    };

    const result = resolveCompose(vs, new Map());

    expect(result!.codes).toHaveLength(2);
    expect(result!.codes.map((c) => c.code)).toEqual(["a", "c"]);
  });

  it("combines multiple includes", () => {
    const vs = {
      resourceType: "ValueSet",
      url: "http://example.com/ValueSet/multi",
      name: "Multi",
      compose: {
        include: [
          { system: "http://sys1.com", concept: [{ code: "a" }] },
          { system: "http://sys2.com", concept: [{ code: "b" }] },
        ],
      },
    };

    const result = resolveCompose(vs, new Map());

    expect(result!.codes).toHaveLength(2);
    expect(result!.codes[0]!.system).toBe("http://sys1.com");
    expect(result!.codes[1]!.system).toBe("http://sys2.com");
  });

  it("returns undefined for non-ValueSet input", () => {
    expect(resolveCompose({ resourceType: "CodeSystem" }, new Map())).toBeUndefined();
  });
});
