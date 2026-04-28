import { describe, expect, it } from "vitest";
import { parseCodeSystem } from "../src/codesystem-parser.js";
import { resolveCompose } from "../src/valueset-parser.js";

const animalCs = parseCodeSystem({
  resourceType: "CodeSystem",
  url: "http://example/cs/animal",
  name: "Animal",
  content: "complete",
  hierarchyMeaning: "is-a",
  concept: [
    {
      code: "animal",
      display: "Animal",
      concept: [
        {
          code: "mammal",
          display: "Mammal",
          concept: [
            { code: "dog", display: "Dog" },
            { code: "cat", display: "Cat" },
          ],
        },
        { code: "bird", display: "Bird" },
      ],
    },
  ],
});

describe("Phase 3.2: CodeSystem hierarchy", () => {
  it("emits ConceptNodes with parents derived from nesting", () => {
    expect(animalCs?.nodes?.find((n) => n.code === "dog")?.parents).toEqual(["mammal"]);
    expect(animalCs?.nodes?.find((n) => n.code === "mammal")?.parents).toEqual(["animal"]);
    expect(animalCs?.nodes?.find((n) => n.code === "animal")?.parents).toBeUndefined();
  });

  it("backfills children", () => {
    const animal = animalCs?.nodes?.find((n) => n.code === "animal");
    expect(animal?.children).toEqual(["mammal", "bird"]);
  });

  it("isA() walks transitively", () => {
    expect(animalCs?.isA?.("animal", "dog")).toBe(true);
    expect(animalCs?.isA?.("mammal", "dog")).toBe(true);
    expect(animalCs?.isA?.("dog", "mammal")).toBe(false);
    expect(animalCs?.isA?.("animal", "animal")).toBe(true); // reflexive
  });

  it("captures explicit `parent` properties", () => {
    const cs = parseCodeSystem({
      resourceType: "CodeSystem",
      url: "x",
      name: "x",
      content: "complete",
      concept: [
        { code: "a" },
        { code: "b", property: [{ code: "parent", valueCode: "a" }] },
        { code: "c", property: [{ code: "parent", valueCode: "b" }] },
      ],
    });
    expect(cs?.isA?.("a", "c")).toBe(true);
  });

  it("captures designations and other properties", () => {
    const cs = parseCodeSystem({
      resourceType: "CodeSystem",
      url: "x",
      name: "x",
      content: "complete",
      concept: [
        {
          code: "abc",
          designation: [
            { language: "en", value: "ABC" },
            { language: "fr", value: "ABC-fr" },
          ],
          property: [{ code: "status", valueCode: "active" }],
        },
      ],
    });
    const node = cs?.nodes?.find((n) => n.code === "abc");
    expect(node?.designations).toHaveLength(2);
    expect(node?.properties).toEqual({ status: "active" });
  });
});

describe("Phase 3.2: ValueSet filter ops", () => {
  const csLookup = new Map([[animalCs!.url, animalCs!]]);

  it("is-a expands to descendants", () => {
    const vs = resolveCompose(
      {
        resourceType: "ValueSet",
        url: "http://example/vs/mammals",
        name: "Mammals",
        compose: {
          include: [
            {
              system: "http://example/cs/animal",
              filter: [{ property: "concept", op: "is-a", value: "mammal" }],
            },
          ],
        },
      },
      csLookup,
    );
    const codes = vs!.codes.map((c) => c.code).sort();
    expect(codes).toEqual(["cat", "dog", "mammal"]);
    expect(vs!.isComplete).toBe(true);
  });

  it("descendent-of excludes the ancestor itself", () => {
    const vs = resolveCompose(
      {
        resourceType: "ValueSet",
        url: "x",
        name: "x",
        compose: {
          include: [
            {
              system: "http://example/cs/animal",
              filter: [{ property: "concept", op: "descendent-of", value: "mammal" }],
            },
          ],
        },
      },
      csLookup,
    );
    const codes = vs!.codes.map((c) => c.code).sort();
    expect(codes).toEqual(["cat", "dog"]);
  });

  it("regex against code", () => {
    const vs = resolveCompose(
      {
        resourceType: "ValueSet",
        url: "x",
        name: "x",
        compose: {
          include: [
            {
              system: "http://example/cs/animal",
              filter: [{ property: "code", op: "regex", value: "^[bc]" }],
            },
          ],
        },
      },
      csLookup,
    );
    const codes = vs!.codes.map((c) => c.code).sort();
    expect(codes).toEqual(["bird", "cat"]);
  });

  it("marks incomplete when an op cannot be applied", () => {
    const vs = resolveCompose(
      {
        resourceType: "ValueSet",
        url: "x",
        name: "x",
        compose: {
          include: [
            {
              system: "http://example/cs/animal",
              filter: [{ property: "concept", op: "in", value: "x" }],
            },
          ],
        },
      },
      csLookup,
    );
    expect(vs!.isComplete).toBe(false);
  });
});
