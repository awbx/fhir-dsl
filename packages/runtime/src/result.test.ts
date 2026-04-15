import { describe, expect, it } from "vitest";
import { unwrapBundle } from "./result.js";

describe("unwrapBundle", () => {
  it("extracts match entries as data", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      total: 2,
      entry: [
        { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
        { resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } },
      ],
    };

    const result = unwrapBundle(bundle as any);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.id).toBe("1");
    expect(result.total).toBe(2);
  });

  it("separates include entries", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      entry: [
        { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
        { resource: { resourceType: "Practitioner", id: "p1" }, search: { mode: "include" } },
      ],
    };

    const result = unwrapBundle(bundle as any);

    expect(result.data).toHaveLength(1);
    expect(result.included).toHaveLength(1);
    expect((result.included[0] as any).resourceType).toBe("Practitioner");
  });

  it("handles empty bundle", () => {
    const bundle = { resourceType: "Bundle" as const, type: "searchset" as const };

    const result = unwrapBundle(bundle as any);

    expect(result.data).toEqual([]);
    expect(result.included).toEqual([]);
    expect(result.hasNext).toBe(false);
  });

  it("detects next link", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      entry: [],
      link: [
        { relation: "self", url: "http://example.com/Patient" },
        { relation: "next", url: "http://example.com/Patient?_page=2" },
      ],
    };

    const result = unwrapBundle(bundle as any);

    expect(result.hasNext).toBe(true);
    expect(result.nextUrl).toBe("http://example.com/Patient?_page=2");
  });

  it("sets hasNext false when no next link", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      entry: [],
      link: [{ relation: "self", url: "http://example.com/Patient" }],
    };

    const result = unwrapBundle(bundle as any);

    expect(result.hasNext).toBe(false);
    expect(result.nextUrl).toBeUndefined();
  });

  it("skips entries without resource", () => {
    const bundle = {
      resourceType: "Bundle" as const,
      type: "searchset" as const,
      entry: [
        { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
        { search: { mode: "match" } },
      ],
    };

    const result = unwrapBundle(bundle as any);

    expect(result.data).toHaveLength(1);
  });

  it("preserves raw bundle", () => {
    const bundle = { resourceType: "Bundle" as const, type: "searchset" as const, entry: [] };
    const result = unwrapBundle(bundle as any);

    expect(result.raw).toBe(bundle);
  });
});
