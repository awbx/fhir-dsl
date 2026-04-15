import { describe, expect, it, vi } from "vitest";
import type { CompiledQuery } from "./compiled-query.js";
import { SearchQueryBuilderImpl } from "./search-query-builder.js";

// Concrete test schema
type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string };
    Practitioner: { resourceType: "Practitioner"; id?: string };
  };
  searchParams: {
    Patient: {
      family: { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
    };
  };
  includes: {
    Patient: { general_practitioner: "Practitioner" };
  };
  profiles: Record<string, never>;
};

const noopExecutor = vi.fn(async () => ({
  resourceType: "Bundle",
  type: "searchset",
  entry: [],
}));

type FlexibleSearchParams = Record<string, { type: "date"; value: string }>;

function createBuilder(resourceType = "Patient") {
  return new SearchQueryBuilderImpl<TestSchema, string, FlexibleSearchParams>(resourceType, noopExecutor);
}

describe("SearchQueryBuilder", () => {
  describe("compile", () => {
    it("compiles a basic search query", () => {
      const query = createBuilder("Patient").compile();

      expect(query.method).toBe("GET");
      expect(query.path).toBe("Patient");
      expect(query.params).toEqual([]);
    });

    it("compiles where clauses into search params", () => {
      const query = createBuilder("Patient")
        .where("family", "eq", "Smith")
        .where("birthdate", "ge", "1990-01-01")
        .compile();

      expect(query.params).toEqual([
        { name: "family", value: "Smith" },
        { name: "birthdate", prefix: "ge", value: "1990-01-01" },
      ]);
    });

    it("does not include prefix for eq operator", () => {
      const query = createBuilder("Observation").where("status", "eq", "final").compile();

      expect(query.params).toEqual([{ name: "status", value: "final" }]);
    });

    it("compiles _include params", () => {
      const query = createBuilder("Patient")
        .include("general-practitioner" as any)
        .compile();

      expect(query.params).toContainEqual({
        name: "_include",
        value: "Patient:general-practitioner",
      });
    });

    it("compiles sort params", () => {
      const query = createBuilder("Patient")
        .sort("birthdate" as any, "desc")
        .compile();

      expect(query.params).toContainEqual({
        name: "_sort",
        value: "-birthdate",
      });
    });

    it("compiles ascending sort without prefix", () => {
      const query = createBuilder("Patient")
        .sort("name" as any, "asc")
        .compile();

      expect(query.params).toContainEqual({
        name: "_sort",
        value: "name",
      });
    });

    it("compiles multiple sorts as comma-separated", () => {
      const query = createBuilder("Patient")
        .sort("family" as any, "asc")
        .sort("birthdate" as any, "desc")
        .compile();

      expect(query.params).toContainEqual({
        name: "_sort",
        value: "family,-birthdate",
      });
    });

    it("compiles _count param", () => {
      const query = createBuilder("Patient").count(10).compile();

      expect(query.params).toContainEqual({ name: "_count", value: 10 });
    });

    it("compiles _offset param", () => {
      const query = createBuilder("Patient").offset(20).compile();

      expect(query.params).toContainEqual({ name: "_offset", value: 20 });
    });

    it("compiles profile as _profile param", () => {
      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>(
        "Observation",
        noopExecutor,
        undefined,
        "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs",
      );

      const query = builder.compile();

      expect(query.params).toContainEqual({
        name: "_profile",
        value: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs",
      });
    });

    it("combines all params in a complex query", () => {
      const query = createBuilder("Observation")
        .where("status", "eq", "final")
        .where("date", "ge", "2024-01-01")
        .include("subject" as any)
        .sort("date" as any, "desc")
        .count(50)
        .offset(100)
        .compile();

      expect(query.method).toBe("GET");
      expect(query.path).toBe("Observation");
      expect(query.params).toHaveLength(6);
    });
  });

  describe("immutability", () => {
    it("returns a new builder on each method call", () => {
      const builder1 = createBuilder("Patient");
      const builder2 = builder1.where("family", "eq", "Smith");
      const builder3 = builder2.count(10);

      expect(builder1.compile().params).toHaveLength(0);
      expect(builder2.compile().params).toHaveLength(1);
      expect(builder3.compile().params).toHaveLength(2);
    });

    it("allows forking from the same builder", () => {
      const base = createBuilder("Patient").where("active", "eq", "true");
      const fork1 = base.where("family", "eq", "Smith");
      const fork2 = base.where("family", "eq", "Doe");

      const q1 = fork1.compile();
      const q2 = fork2.compile();

      expect(q1.params).toHaveLength(2);
      expect(q2.params).toHaveLength(2);
      expect(q1.params[1]).toEqual({ name: "family", value: "Smith" });
      expect(q2.params[1]).toEqual({ name: "family", value: "Doe" });
    });
  });

  describe("execute", () => {
    it("calls the executor with the compiled query", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
          { resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } },
        ],
        total: 2,
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);

      const result = await builder.where("family", "eq", "Smith").execute();

      expect(executor).toHaveBeenCalledOnce();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({ resourceType: "Patient", id: "1" });
      expect(result.total).toBe(2);
    });

    it("separates match and include entries", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
          { resource: { resourceType: "Practitioner", id: "p1" }, search: { mode: "include" } },
        ],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, "Patient", FlexibleSearchParams>("Patient", executor);
      const result = await builder.execute();

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.resourceType).toBe("Patient");
      expect(result.included).toHaveLength(1);
      expect((result as { included: { resourceType: string }[] }).included[0]?.resourceType).toBe("Practitioner");
    });

    it("handles empty bundle", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        total: 0,
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const result = await builder.execute();

      expect(result.data).toEqual([]);
      expect(result.included).toEqual([]);
      expect(result.total).toBe(0);
    });

    it("preserves bundle links", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [],
        link: [
          { relation: "self", url: "http://example.com/Patient?family=Smith" },
          { relation: "next", url: "http://example.com/Patient?family=Smith&_page=2" },
        ],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const result = await builder.execute();

      expect(result.link).toHaveLength(2);
      expect(result.link![0]!.relation).toBe("self");
      expect(result.link![1]!.relation).toBe("next");
    });
  });
});
