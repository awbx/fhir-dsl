import { createFhirClient, type SearchParamFor } from "@fhir-dsl/core";
import type { Bundle, Resource } from "@fhir-dsl/types";
import { describe, expectTypeOf, it } from "vitest";
import type { TestSchema, VipPatient } from "./schema.js";

describe("codex client type flow", () => {
  it("narrows where() values and operators by search-param type", () => {
    const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

    client.search("Patient").where("name", "contains", "smith");
    client.search("Patient").where("birthdate", "ge", "1990-01-01");
    client.search("Patient").where("gender", "eq", "male");
    client.search("Patient").where("risk-score", "le", 3);
    client.search("Patient").where("weight", "ap", "72|kg");
    client.search("Patient").where("organization", "eq", "Organization/org-1");
    client.search("Patient").where("website", "above", "https://example.test");

    // @ts-expect-error invalid operator for string param
    client.search("Patient").where("name", "ge", "smith");
    // @ts-expect-error invalid operator for date param
    client.search("Patient").where("birthdate", "contains", "1990-01-01");
    // @ts-expect-error invalid terminology-narrowed token value
    client.search("Patient").where("gender", "eq", "banana");
    // @ts-expect-error invalid operator for reference param
    client.search("Patient").where("organization", "contains", "Organization/org-1");
    // @ts-expect-error invalid operator for number param
    client.search("Patient").where("risk-score", "contains", 3);
    // @ts-expect-error invalid operator for uri param
    client.search("Patient").where("website", "contains", "https://example.test");
  });

  it("types composite, include, revinclude, chained, has, and sort operations", () => {
    const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

    client
      .search("Observation")
      .whereComposite("combo", { code: "1234-5", "value-quantity": "72|kg" })
      .include("subject")
      .include("performer")
      .whereChained("subject", "Patient", "name", "exact", "Smith")
      .has("Observation", "subject", "code", "eq", "1234-5")
      .sort("status", "desc");

    // @ts-expect-error invalid composite component value
    client.search("Observation").whereComposite("combo", { code: 123, "value-quantity": "72|kg" });
    // @ts-expect-error invalid include for Observation
    client.search("Observation").include("organization");
    // @ts-expect-error invalid chained target param operator
    client.search("Observation").whereChained("subject", "Patient", "name", "ge", "Smith");
    // @ts-expect-error invalid _has target value
    client.search("Patient").has("Observation", "subject", "code", "eq", "banana");
    // @ts-expect-error invalid sort key
    client.search("Patient").sort("unknown", "asc");
  });

  it("types execute() results for primary resources, includes, and profiles", () => {
    const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

    const patientResult = client.search("Patient").execute();
    const includeResult = client.search("Observation").include("subject").include("performer").execute();
    const revincludeResult = client.search("Patient").revinclude("Observation", "subject").execute();
    const vipResult = client.search("Patient", "vip").execute();
    const readResult = client.read("Patient", "pat-1").execute();

    type PatientData = Awaited<typeof patientResult>["data"];
    type IncludedData = Awaited<typeof includeResult>["included"];
    type RevIncludedData = Awaited<typeof revincludeResult>["included"];
    type VipData = Awaited<typeof vipResult>["data"];
    type ReadData = Awaited<typeof readResult>;

    expectTypeOf<PatientData[number]["resourceType"]>().toEqualTypeOf<"Patient">();
    expectTypeOf<IncludedData[number]["resourceType"]>().toEqualTypeOf<"Patient" | "Practitioner">();
    expectTypeOf<RevIncludedData[number]["resourceType"]>().toEqualTypeOf<"Observation">();
    expectTypeOf<VipData[number]>().toExtend<VipPatient>();
    expectTypeOf<ReadData["resourceType"]>().toEqualTypeOf<"Patient">();
  });

  it("exposes narrowed search-param values through SearchParamFor", () => {
    type GenderValue = SearchParamFor<TestSchema, "Patient">["gender"]["value"];
    type StatusValue = SearchParamFor<TestSchema, "Observation">["status"]["value"];

    expectTypeOf<GenderValue>().toEqualTypeOf<"male" | "female" | "other" | "unknown">();
    expectTypeOf<StatusValue>().toEqualTypeOf<"registered" | "preliminary" | "final">();
  });

  it("keeps stream() and transaction() typed", () => {
    const client = createFhirClient<TestSchema>({ baseUrl: "https://example.test/fhir" });

    expectTypeOf(client.search("Patient").stream()).toExtend<AsyncIterable<TestSchema["resources"]["Patient"]>>();

    const tx = client.transaction().create({
      resourceType: "Patient",
      name: [{ family: "Smith", given: ["John"] }],
    });

    expectTypeOf<ReturnType<typeof tx.compile>>().toExtend<Bundle>();
    expectTypeOf<ReturnType<typeof tx.execute>>().toEqualTypeOf<Promise<Bundle>>();

    // @ts-expect-error transaction create should reject resources outside the schema
    client.transaction().create({ resourceType: "Condition" } as Resource);
  });
});
