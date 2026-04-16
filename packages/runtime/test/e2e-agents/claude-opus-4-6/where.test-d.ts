import { createFhirClient } from "@fhir-dsl/core";
import { describe, expectTypeOf, it } from "vitest";
import type { TestSchema } from "./schema.js";

const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

describe("claude-opus-4-6 type-level / where() per-type modifier constraints", () => {
  it("date param accepts date/quantity prefixes but rejects string/token modifiers", () => {
    client.search("Observation").where("date", "eq", "2024-01-01");
    client.search("Observation").where("date", "ne", "2024-01-01");
    client.search("Observation").where("date", "gt", "2024-01-01");
    client.search("Observation").where("date", "ge", "2024-01-01");
    client.search("Observation").where("date", "lt", "2024-01-01");
    client.search("Observation").where("date", "le", "2024-01-01");
    client.search("Observation").where("date", "sa", "2024-01-01");
    client.search("Observation").where("date", "eb", "2024-01-01");
    client.search("Observation").where("date", "ap", "2024-01-01");

    // @ts-expect-error — date params don't accept string modifiers
    client.search("Observation").where("date", "contains", "2024");
    // @ts-expect-error — date params don't accept token modifiers
    client.search("Observation").where("date", "not", "2024-01-01");
    // @ts-expect-error — date params don't accept uri modifiers
    client.search("Observation").where("date", "below", "2024-01-01");
  });

  it("number param rejects sa/eb/ap (those are date/quantity only)", () => {
    client.search("Patient").where("risk-score", "eq", 3);
    client.search("Patient").where("risk-score", "gt", 5);

    // @ts-expect-error — number has no `sa` prefix
    client.search("Patient").where("risk-score", "sa", 3);
    // @ts-expect-error — number has no `eb` prefix
    client.search("Patient").where("risk-score", "eb", 3);
    // @ts-expect-error — number has no `ap` prefix
    client.search("Patient").where("risk-score", "ap", 3);
    // @ts-expect-error — number has no string modifiers
    client.search("Patient").where("risk-score", "contains", 3);
  });

  it("string param accepts eq/contains/exact and rejects comparison prefixes", () => {
    client.search("Patient").where("name", "eq", "Smith");
    client.search("Patient").where("name", "contains", "smi");
    client.search("Patient").where("name", "exact", "Smith");

    // @ts-expect-error — string has no `ge` prefix (regression #7 from prompt)
    client.search("Patient").where("name", "ge", "Smith");
    // @ts-expect-error — string has no `not` modifier
    client.search("Patient").where("name", "not", "Smith");
    // @ts-expect-error — string has no `of-type` modifier
    client.search("Patient").where("name", "of-type", "Smith");
  });

  it("token param accepts its modifier set and rejects comparison prefixes", () => {
    client.search("Patient").where("gender", "eq", "female");
    client.search("Patient").where("gender", "not", "male");
    client.search("Patient").where("identifier", "of-type", "sys|MR|x");
    client.search("Patient").where("identifier", "in", "http://ex");
    client.search("Patient").where("identifier", "not-in", "http://ex");
    client.search("Patient").where("identifier", "text", "mrn");
    client.search("Patient").where("identifier", "above", "sys|p");
    client.search("Patient").where("identifier", "below", "sys|r");

    // @ts-expect-error — token has no `ge` prefix
    client.search("Patient").where("gender", "ge", "male");
    // @ts-expect-error — token has no `contains` modifier
    client.search("Patient").where("gender", "contains", "male");
    // @ts-expect-error — token with enum-narrowed value rejects unknown code
    client.search("Patient").where("gender", "eq", "martian");
  });

  it("reference param accepts only eq", () => {
    client.search("Patient").where("organization", "eq", "Organization/org-1");

    // @ts-expect-error — reference has no `ge`
    client.search("Patient").where("organization", "ge", "Organization/org-1");
    // @ts-expect-error — reference has no `contains`
    client.search("Patient").where("organization", "contains", "Organization/org-1");
    // @ts-expect-error — reference has no `not`
    client.search("Patient").where("organization", "not", "Organization/org-1");
  });

  it("uri param accepts eq/above/below and rejects comparison prefixes", () => {
    client.search("Patient").where("website", "eq", "https://example.test");
    client.search("Patient").where("website", "above", "https://example.test/a");
    client.search("Patient").where("website", "below", "https://example.test");

    // @ts-expect-error — uri has no `ge`
    client.search("Patient").where("website", "ge", "https://example.test");
    // @ts-expect-error — uri has no `contains`
    client.search("Patient").where("website", "contains", "example");
  });

  it("quantity param accepts date/quantity prefixes", () => {
    client.search("Patient").where("weight", "eq", "72|kg");
    client.search("Patient").where("weight", "ap", "72|kg");
    client.search("Patient").where("weight", "ge", "72|kg");

    // @ts-expect-error — quantity has no `contains`
    client.search("Patient").where("weight", "contains", "72");
  });

  it("unknown search params are rejected at the key position", () => {
    // @ts-expect-error — `nonexistent-param` is not a key of Patient's searchParams
    client.search("Patient").where("nonexistent-param", "eq", "x");
    // @ts-expect-error — `status` belongs to Observation, not Patient
    client.search("Patient").where("status", "eq", "final");
  });

  it("unknown resource types are rejected at the RT position", () => {
    // @ts-expect-error — `Unknown` is not a key of TestSchema.resources
    client.search("Unknown");
  });

  it("sort() param key is constrained to the resource's search params", () => {
    client.search("Patient").sort("birthdate", "asc");
    client.search("Patient").sort("name", "desc");
    // @ts-expect-error — `status` is not a Patient search param
    client.search("Patient").sort("status", "desc");
    // @ts-expect-error — `bogus` is not a Patient search param
    client.search("Patient").sort("bogus", "asc");

    // Direction is constrained:
    // @ts-expect-error — only "asc" | "desc" are valid
    client.search("Patient").sort("birthdate", "sideways");
  });

  it("count()/offset() accept only numbers", () => {
    client.search("Patient").count(25);
    client.search("Patient").offset(50);
    // @ts-expect-error — count must be a number
    client.search("Patient").count("25");
    // @ts-expect-error — offset must be a number
    client.search("Patient").offset("50");
  });
});

describe("claude-opus-4-6 type-level / composite, chained, has", () => {
  it("whereComposite values are keyed by the composite components", () => {
    client.search("Observation").whereComposite("combo", { code: "1234-5", "value-quantity": "72|kg" });
    // @ts-expect-error — `nonexistent-component` is not part of `combo`
    client.search("Observation").whereComposite("combo", { code: "1234-5", "nonexistent-component": "x" });
    // @ts-expect-error — `combo2` is not a composite param on Observation
    client.search("Observation").whereComposite("combo2", { code: "x" });
  });

  it("whereChained targetParam is typed against the target resource's search params", () => {
    client.search("Observation").whereChained("subject", "Patient", "name", "exact", "Smith");
    client.search("Observation").whereChained("subject", "Patient", "birthdate", "ge", "1990-01-01");

    // @ts-expect-error — `status` is not a Patient search param
    client.search("Observation").whereChained("subject", "Patient", "status", "eq", "x");
    // @ts-expect-error — `contains` is not a date prefix
    client.search("Observation").whereChained("subject", "Patient", "birthdate", "contains", "1990");
  });

  it("has() searchParam is typed against the source resource", () => {
    client.search("Patient").has("Observation", "subject", "code", "eq", "1234-5");
    client.search("Patient").has("Observation", "subject", "date", "ge", "2024-01-01");

    // @ts-expect-error — `name` is not an Observation search param
    client.search("Patient").has("Observation", "subject", "name", "eq", "x");
    // @ts-expect-error — `contains` is not a date prefix
    client.search("Patient").has("Observation", "subject", "date", "contains", "x");
  });
});

describe("claude-opus-4-6 type-level / compile() return shape", () => {
  it("compile() returns a CompiledQuery-shaped object", () => {
    const compiled = client.search("Patient").where("gender", "eq", "female").compile();
    expectTypeOf(compiled.method).toEqualTypeOf<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">();
    expectTypeOf(compiled.path).toEqualTypeOf<string>();
    expectTypeOf(compiled.params).toBeArray();
  });
});
