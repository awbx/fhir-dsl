import { describe, expect, it } from "vitest";
import { extensionByUrl, extensionsByUrl, findSlice, findSliceByPath, readPath } from "../src/slice.js";

describe("extensionByUrl", () => {
  const exts = [
    { url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race", valueCodeableConcept: { text: "race" } },
    { url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity", valueCodeableConcept: { text: "eth" } },
  ];

  it("returns the first extension whose url matches", () => {
    const race = extensionByUrl(exts, "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race");
    expect(race?.valueCodeableConcept?.text).toBe("race");
  });

  it("returns undefined when no extension matches", () => {
    expect(extensionByUrl(exts, "http://nope")).toBeUndefined();
  });

  it("returns undefined when items is undefined", () => {
    expect(extensionByUrl(undefined, "http://anything")).toBeUndefined();
  });
});

describe("extensionsByUrl", () => {
  it("returns every matching extension", () => {
    const items = [
      { url: "http://x", valueString: "a" },
      { url: "http://y", valueString: "b" },
      { url: "http://x", valueString: "c" },
    ];
    expect(extensionsByUrl(items, "http://x").map((e) => e.valueString)).toEqual(["a", "c"]);
  });

  it("returns an empty array when items is undefined or empty", () => {
    expect(extensionsByUrl(undefined, "http://x")).toEqual([]);
    expect(extensionsByUrl([], "http://x")).toEqual([]);
  });
});

describe("findSlice", () => {
  it("returns the first matching item", () => {
    const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(findSlice(items, (i) => i.id === "b")).toEqual({ id: "b" });
  });

  it("returns undefined when nothing matches", () => {
    expect(findSlice([{ id: "a" }], (i) => i.id === "z")).toBeUndefined();
    expect(findSlice(undefined, () => true)).toBeUndefined();
  });
});

describe("readPath", () => {
  it("reads top-level keys", () => {
    expect(readPath({ url: "http://x" }, "url")).toBe("http://x");
  });

  it("reads dotted nested paths", () => {
    expect(readPath({ a: { b: { c: 42 } } }, "a.b.c")).toBe(42);
  });

  it("returns undefined when a segment is missing", () => {
    expect(readPath({ a: 1 }, "a.b")).toBeUndefined();
    expect(readPath({}, "a.b")).toBeUndefined();
    expect(readPath(null, "a")).toBeUndefined();
  });

  it("descends into the first array element when given a path through an array", () => {
    const obj = { coding: [{ code: "x" }, { code: "y" }] };
    expect(readPath(obj, "coding.code")).toBe("x");
  });

  it("returns the input unchanged for an empty path", () => {
    const obj = { a: 1 };
    expect(readPath(obj, "")).toBe(obj);
  });
});

describe("findSliceByPath", () => {
  it("finds a slice via FHIRPath-style discriminator", () => {
    const components = [
      { code: { coding: [{ code: "8480-6" }] }, valueQuantity: { value: 120 } },
      { code: { coding: [{ code: "8462-4" }] }, valueQuantity: { value: 80 } },
    ];
    const systolic = findSliceByPath(components, "code.coding.code", "8480-6");
    expect(systolic?.valueQuantity?.value).toBe(120);
  });

  it("returns undefined when nothing matches", () => {
    expect(findSliceByPath([{ url: "http://a" }], "url", "http://b")).toBeUndefined();
  });
});
