import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import {
  bundleOf,
  conditionHypertension,
  observationBodyWeight,
  organizationAcme,
  patientAlice,
  patientBob,
  practitioner1,
  vipPatient,
} from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / execute — URL serialization & result parsing", () => {
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

  it("prefix+value are concatenated in the URL (NOT separated) per FHIR spec", async () => {
    mock.enqueueJson(bundleOf());
    await client().search("Observation").where("date", "ge", "2024-01-01").where("date", "lt", "2024-12-31").execute();

    const url = new URL(mock.requests[0]!.url);
    const dateValues = url.searchParams.getAll("date");
    expect(dateValues).toEqual(["ge2024-01-01", "lt2024-12-31"]);
    expect(url.searchParams.getAll("date")).not.toContain("ge");
  });

  it("eq op emits a bare value with no prefix concatenation", async () => {
    mock.enqueueJson(bundleOf());
    await client().search("Patient").where("gender", "eq", "female").execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("gender")).toBe("female");
  });

  it("all per-type ops serialize to URL with prefix concatenation", async () => {
    mock.enqueueJson(bundleOf());
    await client()
      .search("Patient")
      .where("name", "contains", "smith")
      .where("gender", "not", "male")
      .where("identifier", "of-type", "sys|MR|abc")
      .where("website", "below", "https://example.test")
      .where("risk-score", "le", 4)
      .where("weight", "ap", "72|kg")
      .where("organization", "eq", "Organization/org-acme")
      .execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("name")).toBe("containssmith");
    expect(url.searchParams.get("gender")).toBe("notmale");
    expect(url.searchParams.get("identifier")).toBe("of-typesys|MR|abc");
    expect(url.searchParams.get("website")).toBe("belowhttps://example.test");
    expect(url.searchParams.get("risk-score")).toBe("le4");
    expect(url.searchParams.get("weight")).toBe("ap72|kg");
    expect(url.searchParams.get("organization")).toBe("Organization/org-acme");
  });

  it("splits Bundle.entry by search.mode into data (match) and included (include)", async () => {
    mock.enqueueJson(
      bundleOf(
        { resource: patientAlice, mode: "match" },
        { resource: patientBob, mode: "match" },
        { resource: organizationAcme, mode: "include" },
        { resource: practitioner1, mode: "include" },
      ),
    );

    const result = await client().search("Patient").include("organization").include("general-practitioner").execute();

    expect(result.data).toEqual([patientAlice, patientBob]);
    expect(result.included).toEqual([organizationAcme, practitioner1]);
  });

  it("returns [] for included when no includes/revincludes are configured", async () => {
    mock.enqueueJson(bundleOf({ resource: patientAlice, mode: "match" }));
    const result = await client().search("Patient").execute();
    expect(result.data).toEqual([patientAlice]);
    expect(result.included).toEqual([]);
  });

  it("revinclude results land in `included`, not `data`", async () => {
    mock.enqueueJson(
      bundleOf(
        { resource: patientAlice, mode: "match" },
        { resource: observationBodyWeight, mode: "include" },
        { resource: conditionHypertension, mode: "include" },
      ),
    );

    const result = await client()
      .search("Patient")
      .revinclude("Observation", "subject")
      .revinclude("Condition", "subject")
      .execute();

    expect(result.data).toEqual([patientAlice]);
    expect(result.included).toEqual([observationBodyWeight, conditionHypertension]);
  });

  it("exposes Bundle.link and raw Bundle on SearchResult", async () => {
    const bundle = bundleOf({ resource: patientAlice, mode: "match" });
    bundle.link = [
      { relation: "self", url: "https://example.test/fhir/Patient?gender=female" },
      { relation: "next", url: "https://example.test/fhir/Patient?_token=abc" },
    ];
    bundle.total = 42;
    mock.enqueueJson(bundle);

    const result = await client().search("Patient").execute();

    expect(result.total).toBe(42);
    expect(result.link).toEqual(bundle.link);
    expect(result.raw).toEqual(bundle);
  });

  it("whereChained serializes chain to URL exactly", async () => {
    mock.enqueueJson(bundleOf());
    await client().search("Observation").whereChained("subject", "Patient", "name", "exact", "Smith").execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("subject:Patient.name")).toBe("exactSmith");
  });

  it("has() serializes reverse-chain to URL exactly", async () => {
    mock.enqueueJson(bundleOf());
    await client().search("Patient").has("Observation", "subject", "code", "eq", "1234-5").execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("_has:Observation:subject:code")).toBe("1234-5");
  });

  it("whereComposite joins values with `$` in the URL", async () => {
    mock.enqueueJson(bundleOf());
    await client()
      .search("Observation")
      .whereComposite("combo", { code: "1234-5", "value-quantity": "72|kg" })
      .execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("combo")).toBe("1234-5$72|kg");
  });

  it("include/revinclude serialize as repeated `_include`/`_revinclude` params", async () => {
    mock.enqueueJson(bundleOf());
    await client()
      .search("Patient")
      .include("organization")
      .include("general-practitioner")
      .revinclude("Observation", "subject")
      .execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.getAll("_include")).toEqual(["Patient:organization", "Patient:general-practitioner"]);
    expect(url.searchParams.getAll("_revinclude")).toEqual(["Observation:subject"]);
  });

  it("sort/count/offset serialize as _sort/_count/_offset", async () => {
    mock.enqueueJson(bundleOf());
    await client().search("Patient").sort("birthdate", "desc").count(25).offset(50).execute();

    const url = new URL(mock.requests[0]!.url);
    expect(url.searchParams.get("_sort")).toBe("-birthdate");
    expect(url.searchParams.get("_count")).toBe("25");
    expect(url.searchParams.get("_offset")).toBe("50");
  });

  it("search with profile returns the profile-typed resource at runtime", async () => {
    mock.enqueueJson(bundleOf({ resource: vipPatient, mode: "match" }));

    const result = await client().search("Patient", "vip").execute();

    expect(result.data).toEqual([vipPatient]);
    expect(result.data[0]?.meta?.profile).toContain("https://example.test/StructureDefinition/vip-patient");
  });
});
