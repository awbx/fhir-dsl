import { describe, expect, it, vi } from "vitest";
import { SearchQueryBuilderImpl } from "./search-query-builder.js";

// Concrete test schema
type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string };
    Practitioner: { resourceType: "Practitioner"; id?: string };
    Observation: { resourceType: "Observation"; id?: string };
  };
  searchParams: {
    Patient: {
      family: { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
    };
    Observation: {
      code: { type: "token"; value: string };
      date: { type: "date"; value: string };
      subject: { type: "reference"; value: string };
      "code-value-quantity": {
        type: "composite";
        value: string;
        components: {
          code: { type: "token"; value: string };
          "value-quantity": { type: "quantity"; value: string };
        };
      };
    };
  };
  includes: {
    Patient: { general_practitioner: "Practitioner" };
    Observation: { subject: "Patient" };
  };
  revIncludes: {
    Patient: { Observation: "subject" };
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

    it("emits string modifier on name (not value) — :exact, :contains", () => {
      const query = createBuilder("Patient")
        .where("family", "exact" as any, "Smith")
        .where("name", "contains" as any, "ohn")
        .compile();

      expect(query.params).toEqual([
        { name: "family", modifier: "exact", value: "Smith" },
        { name: "name", modifier: "contains", value: "ohn" },
      ]);
    });

    it("emits token modifiers on name (:not, :in, :above, :below, :of-type, :text)", () => {
      const query = createBuilder("Patient")
        .where("gender", "not" as any, "male")
        .where("identifier", "of-type" as any, "MR|123")
        .where("language", "in" as any, "ValueSet/abc")
        .where("language", "above" as any, "http://snomed.info/sct|123")
        .compile();

      expect(query.params).toContainEqual({ name: "gender", modifier: "not", value: "male" });
      expect(query.params).toContainEqual({ name: "identifier", modifier: "of-type", value: "MR|123" });
      expect(query.params).toContainEqual({ name: "language", modifier: "in", value: "ValueSet/abc" });
      expect(query.params).toContainEqual({ name: "language", modifier: "above", value: "http://snomed.info/sct|123" });
    });

    it("keeps date prefix (gt/ge/lt/le/sa/eb/ap/ne) on value", () => {
      const query = createBuilder("Patient")
        .where("birthdate", "gt", "2000-01-01")
        .where("birthdate", "ne", "2010-01-01")
        .compile();

      expect(query.params).toEqual([
        { name: "birthdate", prefix: "gt", value: "2000-01-01" },
        { name: "birthdate", prefix: "ne", value: "2010-01-01" },
      ]);
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

  describe("whereChain multi-hop (Phase 6)", () => {
    it("compiles a single-hop chain", () => {
      const query = createBuilder("Observation")
        .whereChain([["subject", "Patient"]], "name", "eq", "Smith")
        .compile();

      expect(query.params).toContainEqual({ name: "subject:Patient.name", value: "Smith" });
    });

    it("compiles a two-hop chain with prefix on terminal date param", () => {
      const query = createBuilder("Observation")
        .whereChain(
          [
            ["subject", "Patient"],
            ["organization", "Organization"],
          ],
          "name",
          "eq",
          "Acme",
        )
        .compile();

      expect(query.params).toContainEqual({
        name: "subject:Patient.organization:Organization.name",
        value: "Acme",
      });
    });

    it("compiles a three-hop chain with terminal modifier", () => {
      const query = createBuilder("Observation")
        .whereChain(
          [
            ["subject", "Patient"],
            ["organization", "Organization"],
            ["partOf", "Organization"],
          ],
          "name",
          "exact" as any,
          "Top",
        )
        .compile();

      expect(query.params).toContainEqual({
        name: "subject:Patient.organization:Organization.partOf:Organization.name",
        modifier: "exact",
        value: "Top",
      });
    });

    it("throws when hops is empty", () => {
      expect(() => createBuilder("Observation").whereChain([] as any, "name", "eq", "x")).toThrow(/at least one hop/);
    });
  });

  describe("iterate on _include / _revinclude (Phase 5)", () => {
    it("emits _include:iterate when include({ iterate: true })", () => {
      const query = createBuilder("Observation")
        .include("subject" as any, { iterate: true })
        .compile();

      expect(query.params).toContainEqual({
        name: "_include",
        modifier: "iterate",
        value: "Observation:subject",
      });
    });

    it("emits plain _include when iterate is false or omitted", () => {
      const query = createBuilder("Observation")
        .include("subject" as any)
        .include("performer" as any, { iterate: false })
        .compile();

      const includes = query.params.filter((p) => p.name === "_include");
      expect(includes).toEqual([
        { name: "_include", value: "Observation:subject" },
        { name: "_include", value: "Observation:performer" },
      ]);
    });

    it("emits _revinclude:iterate when revinclude({ iterate: true })", () => {
      const query = createBuilder("Patient")
        .revinclude("Observation" as any, "subject" as any, { iterate: true })
        .compile();

      expect(query.params).toContainEqual({
        name: "_revinclude",
        modifier: "iterate",
        value: "Observation:subject",
      });
    });
  });

  describe("POST _search (Phase 4)", () => {
    it("emits POST [type]/_search with form-encoded body when usePost() is set", () => {
      const query = createBuilder("Patient")
        .where("family", "eq", "Smith")
        .where("birthdate", "ge", "1990-01-01")
        .usePost()
        .compile();

      expect(query.method).toBe("POST");
      expect(query.path).toBe("Patient/_search");
      expect(query.params).toEqual([]);
      expect(query.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
      expect(typeof query.body).toBe("string");

      const parsed = new URLSearchParams(query.body as string);
      expect(parsed.get("family")).toBe("Smith");
      expect(parsed.get("birthdate")).toBe("ge1990-01-01");
    });

    it("preserves modifier-on-name (e.g. family:exact) in POST body", () => {
      const query = createBuilder("Patient")
        .where("family", "exact" as any, "Smith")
        .usePost()
        .compile();

      const parsed = new URLSearchParams(query.body as string);
      expect(parsed.get("family:exact")).toBe("Smith");
    });

    it("auto-switches to POST when serialized params exceed the threshold", () => {
      let builder = createBuilder("Patient");
      for (let i = 0; i < 200; i++) {
        builder = builder.where(`p${i}` as any, "eq", `value-with-some-length-${i}`) as typeof builder;
      }
      const query = builder.compile();

      expect(query.method).toBe("POST");
      expect(query.path).toBe("Patient/_search");
    });

    it("stays on GET when params are short", () => {
      const query = createBuilder("Patient").where("family", "eq", "Smith").compile();

      expect(query.method).toBe("GET");
      expect(query.path).toBe("Patient");
    });
  });

  describe("OR via comma (Phase 3)", () => {
    it("compiles where with array value as comma-joined", () => {
      const query = createBuilder("Patient")
        .where("gender" as any, "eq", ["male", "female"])
        .compile();

      expect(query.params).toContainEqual({ name: "gender", value: "male,female" });
    });

    it("compiles whereIn as comma-joined eq", () => {
      const query = createBuilder("Patient")
        .whereIn("subject" as any, ["Patient/1", "Patient/2", "Patient/3"])
        .compile();

      expect(query.params).toContainEqual({ name: "subject", value: "Patient/1,Patient/2,Patient/3" });
    });

    it("throws when array value is combined with a non-eq op", () => {
      expect(() => createBuilder("Patient").where("birthdate", "ge" as any, ["2020", "2021"] as any)).toThrow(
        /array values require the/,
      );
    });

    it("preserves single-value where behavior alongside array overload", () => {
      const query = createBuilder("Patient")
        .where("gender" as any, "eq", "male")
        .where("status" as any, "eq", ["active", "completed"])
        .compile();

      expect(query.params).toEqual([
        { name: "gender", value: "male" },
        { name: "status", value: "active,completed" },
      ]);
    });
  });

  describe("meta params (Phase 2)", () => {
    it("compiles whereMissing(true/false) as :missing modifier", () => {
      const query = createBuilder("Patient").whereMissing("family", true).whereMissing("birthdate", false).compile();

      expect(query.params).toContainEqual({ name: "family", modifier: "missing", value: "true" });
      expect(query.params).toContainEqual({ name: "birthdate", modifier: "missing", value: "false" });
    });

    it("compiles whereId as a single _id param with comma-joined ids", () => {
      const query = createBuilder("Patient").whereId("a", "b", "c").compile();

      expect(query.params).toContainEqual({ name: "_id", value: "a,b,c" });
    });

    it("compiles whereLastUpdated with prefix and without prefix (eq)", () => {
      const query = createBuilder("Patient")
        .whereLastUpdated("ge", "2024-01-01")
        .whereLastUpdated("eq", "2024-06-01")
        .compile();

      expect(query.params).toContainEqual({ name: "_lastUpdated", prefix: "ge", value: "2024-01-01" });
      expect(query.params).toContainEqual({ name: "_lastUpdated", value: "2024-06-01" });
    });

    it("compiles withTag, withSecurity, fromSource as _tag/_security/_source", () => {
      const query = createBuilder("Patient")
        .withTag("http://example.org/tag|a")
        .withTag("b")
        .withSecurity("http://example.org/sec|N")
        .fromSource("http://example.org/source")
        .compile();

      expect(query.params).toContainEqual({ name: "_tag", value: "http://example.org/tag|a" });
      expect(query.params).toContainEqual({ name: "_tag", value: "b" });
      expect(query.params).toContainEqual({ name: "_security", value: "http://example.org/sec|N" });
      expect(query.params).toContainEqual({ name: "_source", value: "http://example.org/source" });
    });

    it("compiles result-shaping params: summary/total/contained/containedType", () => {
      const query = createBuilder("Patient")
        .summary("count")
        .total("accurate")
        .contained("both")
        .containedType("contained")
        .compile();

      expect(query.params).toContainEqual({ name: "_summary", value: "count" });
      expect(query.params).toContainEqual({ name: "_total", value: "accurate" });
      expect(query.params).toContainEqual({ name: "_contained", value: "both" });
      expect(query.params).toContainEqual({ name: "_containedType", value: "contained" });
    });
  });

  describe("revinclude", () => {
    it("compiles _revinclude params", () => {
      const query = createBuilder("Patient")
        .revinclude("Observation" as any, "subject" as any)
        .compile();

      expect(query.params).toContainEqual({
        name: "_revinclude",
        value: "Observation:subject",
      });
    });

    it("supports multiple revincludes", () => {
      const query = createBuilder("Patient")
        .revinclude("Observation" as any, "subject" as any)
        .revinclude("Account" as any, "patient" as any)
        .compile();

      const revIncludes = query.params.filter((p) => p.name === "_revinclude");
      expect(revIncludes).toHaveLength(2);
      expect(revIncludes[0]).toEqual({ name: "_revinclude", value: "Observation:subject" });
      expect(revIncludes[1]).toEqual({ name: "_revinclude", value: "Account:patient" });
    });
  });

  describe("whereChained", () => {
    it("compiles chained parameter", () => {
      const query = createBuilder("Observation")
        .whereChained("subject" as any, "Patient" as any, "name" as any, "eq", "Smith")
        .compile();

      expect(query.params).toContainEqual({
        name: "subject:Patient.name",
        value: "Smith",
      });
    });

    it("compiles chained parameter with prefix", () => {
      const query = createBuilder("Observation")
        .whereChained("subject" as any, "Patient" as any, "birthdate" as any, "ge", "1990-01-01")
        .compile();

      expect(query.params).toContainEqual({
        name: "subject:Patient.birthdate",
        prefix: "ge",
        value: "1990-01-01",
      });
    });

    it("combines chained params with regular where clauses", () => {
      const query = createBuilder("Observation")
        .where("status" as any, "eq", "final")
        .whereChained("subject" as any, "Patient" as any, "name" as any, "eq", "Smith")
        .compile();

      expect(query.params).toHaveLength(2);
      expect(query.params[0]).toEqual({ name: "status", value: "final" });
      expect(query.params[1]).toEqual({ name: "subject:Patient.name", value: "Smith" });
    });
  });

  describe("has", () => {
    it("compiles _has parameter", () => {
      const query = createBuilder("Patient")
        .has("Observation" as any, "subject" as any, "code" as any, "eq", "1234")
        .compile();

      expect(query.params).toContainEqual({
        name: "_has:Observation:subject:code",
        value: "1234",
      });
    });

    it("compiles _has with prefix operator", () => {
      const query = createBuilder("Patient")
        .has("Observation" as any, "subject" as any, "date" as any, "ge", "2024-01-01")
        .compile();

      expect(query.params).toContainEqual({
        name: "_has:Observation:subject:date",
        prefix: "ge",
        value: "2024-01-01",
      });
    });
  });

  describe("whereComposite", () => {
    it("compiles composite parameter with $-separated values", () => {
      const builder = new SearchQueryBuilderImpl<TestSchema, "Observation", TestSchema["searchParams"]["Observation"]>(
        "Observation",
        noopExecutor,
      );

      const query = builder
        .whereComposite("code-value-quantity", {
          code: "http://loinc.org|8480-6",
          "value-quantity": "60",
        })
        .compile();

      expect(query.params).toContainEqual({
        name: "code-value-quantity",
        value: "http://loinc.org|8480-6$60",
      });
    });

    it("combines composite with regular where clauses", () => {
      const builder = new SearchQueryBuilderImpl<TestSchema, "Observation", TestSchema["searchParams"]["Observation"]>(
        "Observation",
        noopExecutor,
      );

      const query = builder
        .where("date", "ge", "2024-01-01")
        .whereComposite("code-value-quantity", {
          code: "http://loinc.org|8480-6",
          "value-quantity": "60",
        })
        .compile();

      expect(query.params).toHaveLength(2);
      expect(query.params[0]).toEqual({ name: "date", prefix: "ge", value: "2024-01-01" });
      expect(query.params[1]).toEqual({ name: "code-value-quantity", value: "http://loinc.org|8480-6$60" });
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

  describe("stream", () => {
    it("yields individual resources from a single page", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
          { resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } },
        ],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const results: any[] = [];

      for await (const item of builder.stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({ resourceType: "Patient", id: "1" });
      expect(results[1]).toEqual({ resourceType: "Patient", id: "2" });
    });

    it("follows next links across pages", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } }],
        link: [{ relation: "next", url: "http://example.com/Patient?_page=2" }],
      }));

      const urlExecutor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } },
          { resource: { resourceType: "Patient", id: "3" }, search: { mode: "match" } },
        ],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>(
        "Patient",
        executor,
        undefined,
        undefined,
        urlExecutor,
      );
      const results: any[] = [];

      for await (const item of builder.stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(3);
      expect(results.map((r) => r.id)).toEqual(["1", "2", "3"]);
      expect(urlExecutor).toHaveBeenCalledWith("http://example.com/Patient?_page=2");
    });

    it("skips included resources", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [
          { resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } },
          { resource: { resourceType: "Practitioner", id: "p1" }, search: { mode: "include" } },
        ],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const results: any[] = [];

      for await (const item of builder.stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(1);
      expect(results[0]?.resourceType).toBe("Patient");
    });

    it("handles empty bundle", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const results: any[] = [];

      for await (const item of builder.stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(0);
    });

    it("stops when no urlExecutor is provided even if next link exists", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } }],
        link: [{ relation: "next", url: "http://example.com/Patient?_page=2" }],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>("Patient", executor);
      const results: any[] = [];

      for await (const item of builder.stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(1);
    });

    it("supports cancellation via AbortSignal", async () => {
      const controller = new AbortController();

      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } }],
        link: [{ relation: "next", url: "http://example.com/Patient?_page=2" }],
      }));

      const urlExecutor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } }],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, Record<string, any>>(
        "Patient",
        executor,
        undefined,
        undefined,
        urlExecutor,
      );

      controller.abort();

      const results: any[] = [];
      await expect(async () => {
        for await (const item of builder.stream({ signal: controller.signal })) {
          results.push(item);
        }
      }).rejects.toThrow();
    });

    it("preserves stream through chained methods", async () => {
      const executor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "1" }, search: { mode: "match" } }],
        link: [{ relation: "next", url: "http://example.com/Patient?_page=2" }],
      }));

      const urlExecutor = vi.fn(async () => ({
        resourceType: "Bundle",
        type: "searchset",
        entry: [{ resource: { resourceType: "Patient", id: "2" }, search: { mode: "match" } }],
      }));

      const builder = new SearchQueryBuilderImpl<TestSchema, string, FlexibleSearchParams>(
        "Patient",
        executor,
        undefined,
        undefined,
        urlExecutor,
      );

      const results: any[] = [];
      for await (const item of builder.where("birthdate", "ge", "1990-01-01").count(10).stream()) {
        results.push(item);
      }

      expect(results).toHaveLength(2);
      expect(urlExecutor).toHaveBeenCalledOnce();
    });
  });
});
