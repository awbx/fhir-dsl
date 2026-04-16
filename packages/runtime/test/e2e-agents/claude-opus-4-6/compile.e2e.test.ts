import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / compile", () => {
  let mock: MockFetch;
  beforeEach(() => {
    mock = new MockFetch();
  });

  function client() {
    return createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });
  }

  describe("per-type prefix/modifier encoding in CompiledQuery", () => {
    it("date — every legal prefix appears verbatim", () => {
      const compiled = client()
        .search("Observation")
        .where("date", "eq", "2024-01-01")
        .where("date", "ne", "2024-01-02")
        .where("date", "gt", "2024-02-01")
        .where("date", "ge", "2024-03-01")
        .where("date", "lt", "2024-04-01")
        .where("date", "le", "2024-05-01")
        .where("date", "sa", "2024-06-01")
        .where("date", "eb", "2024-07-01")
        .where("date", "ap", "2024-08-01")
        .compile();

      expect(compiled.params).toEqual([
        { name: "date", value: "2024-01-01" },
        { name: "date", prefix: "ne", value: "2024-01-02" },
        { name: "date", prefix: "gt", value: "2024-02-01" },
        { name: "date", prefix: "ge", value: "2024-03-01" },
        { name: "date", prefix: "lt", value: "2024-04-01" },
        { name: "date", prefix: "le", value: "2024-05-01" },
        { name: "date", prefix: "sa", value: "2024-06-01" },
        { name: "date", prefix: "eb", value: "2024-07-01" },
        { name: "date", prefix: "ap", value: "2024-08-01" },
      ]);
    });

    it("quantity — prefix set matches date, carries unit|system", () => {
      const compiled = client()
        .search("Patient")
        .where("weight", "ge", "60|http://unitsofmeasure.org|kg")
        .where("weight", "ap", "72|kg")
        .compile();

      expect(compiled.params).toEqual([
        { name: "weight", prefix: "ge", value: "60|http://unitsofmeasure.org|kg" },
        { name: "weight", prefix: "ap", value: "72|kg" },
      ]);
    });

    it("number — no sa/eb/ap, numeric value preserved as number", () => {
      const compiled = client()
        .search("Patient")
        .where("risk-score", "eq", 3)
        .where("risk-score", "gt", 5)
        .where("risk-score", "le", 10)
        .compile();

      expect(compiled.params).toEqual([
        { name: "risk-score", value: 3 },
        { name: "risk-score", prefix: "gt", value: 5 },
        { name: "risk-score", prefix: "le", value: 10 },
      ]);
    });

    it("string — eq/contains/exact", () => {
      const compiled = client()
        .search("Patient")
        .where("name", "eq", "Smith")
        .where("name", "contains", "smi")
        .where("given", "exact", "Alice")
        .compile();

      expect(compiled.params).toEqual([
        { name: "name", value: "Smith" },
        { name: "name", prefix: "contains", value: "smi" },
        { name: "given", prefix: "exact", value: "Alice" },
      ]);
    });

    it("token — every modifier", () => {
      const compiled = client()
        .search("Patient")
        .where("gender", "eq", "female")
        .where("gender", "not", "male")
        .where("identifier", "of-type", "http://ex|MR|abc")
        .where("identifier", "in", "http://ex/ValueSet/ids")
        .where("identifier", "not-in", "http://ex/ValueSet/bad")
        .where("identifier", "text", "mrn-abc")
        .where("identifier", "above", "http://ex|parent")
        .where("identifier", "below", "http://ex|root")
        .compile();

      expect(compiled.params).toEqual([
        { name: "gender", value: "female" },
        { name: "gender", prefix: "not", value: "male" },
        { name: "identifier", prefix: "of-type", value: "http://ex|MR|abc" },
        { name: "identifier", prefix: "in", value: "http://ex/ValueSet/ids" },
        { name: "identifier", prefix: "not-in", value: "http://ex/ValueSet/bad" },
        { name: "identifier", prefix: "text", value: "mrn-abc" },
        { name: "identifier", prefix: "above", value: "http://ex|parent" },
        { name: "identifier", prefix: "below", value: "http://ex|root" },
      ]);
    });

    it("reference — only eq, no prefix emitted", () => {
      const compiled = client()
        .search("Patient")
        .where("organization", "eq", "Organization/org-acme")
        .where("general-practitioner", "eq", "Practitioner/prc-1")
        .compile();

      expect(compiled.params).toEqual([
        { name: "organization", value: "Organization/org-acme" },
        { name: "general-practitioner", value: "Practitioner/prc-1" },
      ]);
    });

    it("uri — eq/above/below", () => {
      const compiled = client()
        .search("Patient")
        .where("website", "eq", "https://example.test")
        .where("website", "above", "https://example.test/sub")
        .where("website", "below", "https://example.test")
        .compile();

      expect(compiled.params).toEqual([
        { name: "website", value: "https://example.test" },
        { name: "website", prefix: "above", value: "https://example.test/sub" },
        { name: "website", prefix: "below", value: "https://example.test" },
      ]);
    });
  });

  describe("composite, chained, has", () => {
    it("whereComposite joins component values with $ in canonical order", () => {
      const compiled = client()
        .search("Observation")
        .whereComposite("combo", { code: "1234-5", "value-quantity": "72|kg" })
        .compile();

      const combo = compiled.params.find((p) => p.name === "combo");
      expect(combo).toBeDefined();
      expect(combo?.value).toBe("1234-5$72|kg");
    });

    it("whereChained emits FHIR chained param `ref:Target.param`", () => {
      const compiled = client()
        .search("Observation")
        .whereChained("subject", "Patient", "name", "exact", "Smith")
        .compile();

      expect(compiled.params).toEqual([{ name: "subject:Patient.name", prefix: "exact", value: "Smith" }]);
    });

    it("has emits FHIR reverse-chain `_has:Source:ref:param`", () => {
      const compiled = client().search("Patient").has("Observation", "subject", "code", "eq", "1234-5").compile();

      expect(compiled.params).toEqual([{ name: "_has:Observation:subject:code", value: "1234-5" }]);
    });

    it("has preserves non-eq op as prefix on the _has param", () => {
      const compiled = client().search("Patient").has("Observation", "subject", "date", "ge", "2024-01-01").compile();

      expect(compiled.params).toEqual([{ name: "_has:Observation:subject:date", prefix: "ge", value: "2024-01-01" }]);
    });
  });

  describe("include/revinclude/sort/count/offset", () => {
    it("include appends `_include: RT:param`, one entry per call", () => {
      const compiled = client().search("Patient").include("organization").include("general-practitioner").compile();

      const includes = compiled.params.filter((p) => p.name === "_include").map((p) => p.value);
      expect(includes).toEqual(["Patient:organization", "Patient:general-practitioner"]);
    });

    it("revinclude appends `_revinclude: Source:refParam`", () => {
      const compiled = client()
        .search("Patient")
        .revinclude("Observation", "subject")
        .revinclude("Condition", "subject")
        .compile();

      const revincludes = compiled.params.filter((p) => p.name === "_revinclude").map((p) => p.value);
      expect(revincludes).toEqual(["Observation:subject", "Condition:subject"]);
    });

    it("sort emits `-name` prefix for desc, bare name for asc (multi-column joined with `,`)", () => {
      const compiled = client().search("Patient").sort("birthdate", "asc").sort("name", "desc").compile();

      const sorts = compiled.params.filter((p) => p.name === "_sort").map((p) => p.value);
      // Per FHIR: multiple sort keys are joined with commas into a single _sort param
      expect(sorts).toEqual(["birthdate,-name"]);
    });

    it("single sort emits a single `_sort` param with no comma", () => {
      const compiled = client().search("Patient").sort("birthdate", "desc").compile();
      const sorts = compiled.params.filter((p) => p.name === "_sort").map((p) => p.value);
      expect(sorts).toEqual(["-birthdate"]);
    });

    it("count + offset emit as numeric _count / _offset params", () => {
      const compiled = client().search("Patient").count(25).offset(50).compile();
      expect(compiled.params).toContainEqual({ name: "_count", value: 25 });
      expect(compiled.params).toContainEqual({ name: "_offset", value: 50 });
    });
  });

  it("compile() returns method:GET, path:<resourceType>, no body", () => {
    const compiled = client().search("Patient").where("gender", "eq", "female").compile();
    expect(compiled.method).toBe("GET");
    expect(compiled.path).toBe("Patient");
    expect(compiled.body).toBeUndefined();
  });

  it("builders are immutable — branching produces independent CompiledQueries", () => {
    const base = client().search("Patient").where("gender", "eq", "female");
    const a = base.where("birthdate", "ge", "1990-01-01").compile();
    const b = base.where("name", "contains", "smith").compile();

    expect(a.params.some((p) => p.name === "birthdate")).toBe(true);
    expect(a.params.some((p) => p.name === "name")).toBe(false);
    expect(b.params.some((p) => p.name === "name")).toBe(true);
    expect(b.params.some((p) => p.name === "birthdate")).toBe(false);
  });
});
