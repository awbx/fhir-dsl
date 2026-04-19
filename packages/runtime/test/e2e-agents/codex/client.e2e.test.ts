import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { bundleOf, observation1, organization1, patient1, practitioner1, vipPatient } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

function makeClient(
  mock: MockFetch,
  extra?: ConstructorParameters<typeof URL>[0] extends never
    ? never
    : {
        auth?: { type: "bearer" | "basic"; credentials: string };
        headers?: Record<string, string>;
      },
) {
  return createFhirClient<TestSchema>({
    baseUrl: "https://example.test/fhir",
    fetch: mock.fetch,
    ...extra,
  });
}

describe("codex client e2e", () => {
  let mock: MockFetch;

  beforeEach(() => {
    mock = new MockFetch();
  });

  it("compiles every where() param family with exact FHIR query syntax", () => {
    const client = makeClient(mock);

    const query = client
      .search("Patient")
      .where("name", "contains", "smith")
      .where("birthdate", "ge", "1990-01-01")
      .where("gender", "not", "male")
      .where("identifier", "of-type", "sys|abc")
      .where("organization", "eq", "Organization/org-1")
      .where("website", "below", "https://example.test")
      .where("risk-score", "le", 4)
      .where("weight", "ap", "72|kg")
      .sort("birthdate", "desc")
      .count(25)
      .offset(50)
      .compile();

    expect(query).toEqual({
      method: "GET",
      path: "Patient",
      params: [
        { name: "name", modifier: "contains", value: "smith" },
        { name: "birthdate", prefix: "ge", value: "1990-01-01" },
        { name: "gender", modifier: "not", value: "male" },
        { name: "identifier", modifier: "of-type", value: "sys|abc" },
        { name: "organization", value: "Organization/org-1" },
        { name: "website", modifier: "below", value: "https://example.test" },
        { name: "risk-score", prefix: "le", value: 4 },
        { name: "weight", prefix: "ap", value: "72|kg" },
        { name: "_sort", value: "-birthdate" },
        { name: "_count", value: 25 },
        { name: "_offset", value: 50 },
      ],
    });
  });

  it("executes searches, compiles include/revinclude/composite/chained/has params, and splits included resources", async () => {
    mock.enqueueJson(
      bundleOf(
        { resource: observation1, search: { mode: "match" } },
        { resource: patient1, search: { mode: "include" } },
        { resource: practitioner1, search: { mode: "include" } },
      ),
    );
    mock.enqueueJson(
      bundleOf(
        { resource: patient1, search: { mode: "match" } },
        { resource: organization1, search: { mode: "include" } },
        { resource: practitioner1, search: { mode: "include" } },
        { resource: observation1, search: { mode: "include" } },
      ),
    );

    const client = makeClient(mock, {
      auth: { type: "bearer", credentials: "secret-token" },
      headers: { "x-suite": "codex" },
    });

    const observationResult = await client
      .search("Observation")
      .where("status", "eq", "final")
      .whereComposite("combo", { code: "1234-5", "value-quantity": "72|kg" })
      .include("subject")
      .include("performer")
      .whereChained("subject", "Patient", "name", "exact", "Smith")
      .execute();

    const patientResult = await client
      .search("Patient")
      .where("gender", "eq", "male")
      .include("organization")
      .include("general-practitioner")
      .revinclude("Observation", "subject")
      .has("Observation", "subject", "code", "eq", "1234-5")
      .execute();

    expect(observationResult.data).toEqual([observation1]);
    expect(observationResult.included).toEqual([patient1, practitioner1]);
    expect(patientResult.data).toEqual([patient1]);
    expect(patientResult.included).toEqual([organization1, practitioner1, observation1]);

    expect(mock.requests).toHaveLength(2);

    const observationRequest = mock.requests[0]!;
    const observationUrl = new URL(observationRequest.url);
    expect(observationUrl.pathname).toBe("/fhir/Observation");
    expect(observationUrl.searchParams.get("status")).toBe("final");
    expect(observationUrl.searchParams.get("combo")).toBe("1234-5$72|kg");
    expect(observationUrl.searchParams.getAll("_include")).toEqual(["Observation:subject", "Observation:performer"]);
    expect(observationUrl.searchParams.get("subject:Patient.name:exact")).toBe("Smith");

    const patientRequest = mock.requests[1]!;
    const patientUrl = new URL(patientRequest.url);
    expect(patientUrl.pathname).toBe("/fhir/Patient");
    expect(patientUrl.searchParams.get("gender")).toBe("male");
    expect(patientUrl.searchParams.getAll("_include")).toEqual([
      "Patient:organization",
      "Patient:general-practitioner",
    ]);
    expect(patientUrl.searchParams.get("_revinclude")).toBe("Observation:subject");
    expect(patientUrl.searchParams.get("_has:Observation:subject:code")).toBe("1234-5");
    expect(patientRequest.method).toBe("GET");
    expect(patientRequest.headers.accept).toBe("application/fhir+json");
    expect(patientRequest.headers["content-type"]).toBe("application/fhir+json");
    expect(patientRequest.headers.authorization).toBe("Bearer secret-token");
    expect(patientRequest.headers["x-suite"]).toBe("codex");
  });

  it("supports profile-based search typing at runtime", async () => {
    mock.enqueueJson(bundleOf({ resource: vipPatient, search: { mode: "match" } }));

    const client = makeClient(mock);
    const result = await client.search("Patient", "vip").execute();

    expect(result.data[0]).toEqual(vipPatient);
    expect(result.included).toEqual([]);
  });

  it("streams a single page without refetching it", async () => {
    mock.enqueueJson(bundleOf({ resource: patient1, search: { mode: "match" } }));

    const client = makeClient(mock);
    const seen: string[] = [];

    for await (const resource of client.search("Patient").stream()) {
      seen.push(resource.id ?? "");
    }

    expect(seen).toEqual(["pat-1"]);
    expect(mock.requests).toHaveLength(1);
    expect(mock.requests[0]?.url).toBe("https://example.test/fhir/Patient");
  });

  it("streams multiple pages via absolute next links and uses only Accept on URL fetches", async () => {
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: patient1, search: { mode: "match" } }],
      link: [{ relation: "next", url: "https://cdn.example.test/page-2?_count=1" }],
    });
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: vipPatient, search: { mode: "match" } }],
    });

    const client = makeClient(mock, {
      auth: { type: "basic", credentials: "dXNlcjpwYXNz" },
      headers: { "x-extra": "yes" },
    });

    const seen: string[] = [];
    for await (const resource of client.search("Patient").count(1).stream()) {
      seen.push(resource.id ?? "");
    }

    expect(seen).toEqual(["pat-1", "vip-1"]);
    expect(mock.requests).toHaveLength(2);
    expect(mock.requests[1]?.url).toBe("https://cdn.example.test/page-2?_count=1");
    expect(mock.requests[1]?.headers.accept).toBe("application/fhir+json");
    expect(mock.requests[1]?.headers.authorization).toBe("Basic dXNlcjpwYXNz");
    expect(mock.requests[1]?.headers["x-extra"]).toBe("yes");
    expect(mock.requests[1]?.headers["content-type"]).toBeUndefined();
  });

  it("stops streaming when aborted", async () => {
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: patient1, search: { mode: "match" } }],
      link: [{ relation: "next", url: "https://cdn.example.test/page-2" }],
    });
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: vipPatient, search: { mode: "match" } }],
    });

    const client = makeClient(mock);
    const controller = new AbortController();
    const seen: string[] = [];

    await expect(async () => {
      for await (const resource of client.search("Patient").stream({ signal: controller.signal })) {
        seen.push(resource.id ?? "");
        controller.abort();
      }
    }).rejects.toThrow();

    expect(seen).toEqual(["pat-1"]);
    expect(mock.requests).toHaveLength(2);
  });

  it("reads a typed resource by id", async () => {
    mock.enqueueJson(patient1);

    const client = makeClient(mock);
    const result = await client.read("Patient", "pat-1").execute();

    expect(result).toEqual(patient1);
    expect(mock.requests[0]?.url).toBe("https://example.test/fhir/Patient/pat-1");
    expect(mock.requests[0]?.method).toBe("GET");
  });

  it("builds and executes transaction bundles", async () => {
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "transaction-response",
      entry: [
        { response: { status: "201 Created" } },
        { response: { status: "200 OK" } },
        { response: { status: "204 No Content" } },
      ],
    });

    const client = makeClient(mock);
    const tx = client
      .transaction()
      .create(patient1)
      .update({ ...patient1, id: "pat-1" })
      .delete("Observation", "obs-1");

    expect(tx.compile()).toEqual({
      resourceType: "Bundle",
      type: "transaction",
      entry: [
        { resource: patient1, request: { method: "POST", url: "Patient" } },
        { resource: { ...patient1, id: "pat-1" }, request: { method: "PUT", url: "Patient/pat-1" } },
        { request: { method: "DELETE", url: "Observation/obs-1" } },
      ],
    });

    const response = await tx.execute();

    expect(response.resourceType).toBe("Bundle");
    expect(mock.requests[0]?.url).toBe("https://example.test/fhir/");
    expect(mock.requests[0]?.method).toBe("POST");
    expect(mock.requests[0]?.headers.accept).toBe("application/fhir+json");
    expect(mock.requests[0]?.headers["content-type"]).toBe("application/fhir+json");
    expect(JSON.parse(mock.requests[0]?.bodyText ?? "{}")).toEqual(tx.compile());
  });

  it("throws synchronously when updating a transaction resource without an id", () => {
    const client = makeClient(mock);

    expect(() =>
      client.transaction().update({
        resourceType: "Patient",
        name: [{ family: "Missing", given: ["Id"] }],
      }),
    ).toThrow("Resource must have an id for update operations");
  });

  it("throws FhirRequestError with parsed OperationOutcome for non-2xx responses", async () => {
    mock.enqueueJson(
      {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "processing", diagnostics: "Bad search" }],
      },
      { status: 422, statusText: "Unprocessable Entity" },
    );

    const client = makeClient(mock);

    await expect(client.search("Patient").execute()).rejects.toMatchObject({
      name: "FhirRequestError",
      status: 422,
      statusText: "Unprocessable Entity",
      operationOutcome: {
        issue: [{ diagnostics: "Bad search" }],
      },
    });
  });

  it("sets operationOutcome to null when an error body is not JSON", async () => {
    mock.enqueueText("gateway exploded", { status: 502, statusText: "Bad Gateway" });

    const client = makeClient(mock);

    await expect(client.read("Patient", "pat-1").execute()).rejects.toMatchObject({
      status: 502,
      statusText: "Bad Gateway",
      operationOutcome: null,
    });
  });
});
