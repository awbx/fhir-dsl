import { describe, expect, it, vi } from "vitest";
import { SearchQueryBuilderImpl } from "./search-query-builder.js";

type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string; name?: string; birthDate?: string };
  };
  searchParams: {
    Patient: {
      name: { type: "string"; value: string };
    };
  };
  includes: Record<string, never>;
  revIncludes: Record<string, never>;
  profiles: Record<string, never>;
};

type FlexibleSearchParams = { name: { type: "string"; value: string } };

const noopExecutor = vi.fn(async () => ({
  resourceType: "Bundle",
  type: "searchset",
  entry: [],
}));

function createBuilder() {
  return new SearchQueryBuilderImpl<TestSchema, "Patient", FlexibleSearchParams>("Patient", noopExecutor);
}

describe("SearchQueryBuilder.select()", () => {
  it("emits _elements search param when fields are selected", () => {
    const query = createBuilder().select(["id", "name"]).compile();

    expect(query.params).toContainEqual({ name: "_elements", value: "id,name" });
  });

  it("does not emit _elements when select is not called", () => {
    const query = createBuilder().compile();

    expect(query.params.some((p) => p.name === "_elements")).toBe(false);
  });

  it("replaces prior selection when called twice (idempotent)", () => {
    const query = createBuilder().select(["id"]).select(["name", "birthDate"]).compile();

    const elements = query.params.filter((p) => p.name === "_elements");
    expect(elements).toHaveLength(1);
    expect(elements[0]).toEqual({ name: "_elements", value: "name,birthDate" });
  });

  it("composes with where() in any order", () => {
    const q1 = createBuilder().where("name", "eq", "Smith").select(["id", "name"]).compile();
    const q2 = createBuilder().select(["id", "name"]).where("name", "eq", "Smith").compile();

    const names1 = q1.params.map((p) => p.name);
    const names2 = q2.params.map((p) => p.name);
    expect(names1).toContain("name");
    expect(names1).toContain("_elements");
    expect(names2).toContain("name");
    expect(names2).toContain("_elements");
  });

  it("skips _elements when given an empty array", () => {
    const query = createBuilder().select([]).compile();

    expect(query.params.some((p) => p.name === "_elements")).toBe(false);
  });
});
