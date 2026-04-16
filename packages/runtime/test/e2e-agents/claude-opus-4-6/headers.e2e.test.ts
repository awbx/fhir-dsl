import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { bundleOf, patientAlice } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / headers & auth", () => {
  let mock: MockFetch;
  beforeEach(() => {
    mock = new MockFetch();
  });

  it("every executor request sets Accept + Content-Type to application/fhir+json", async () => {
    mock.enqueueJson(bundleOf());
    mock.enqueueJson(patientAlice);

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });

    await client.search("Patient").execute();
    await client.read("Patient", "pat-alice").execute();

    for (const req of mock.requests) {
      expect(req.headers["accept"]).toBe("application/fhir+json");
      expect(req.headers["content-type"]).toBe("application/fhir+json");
    }
  });

  it("bearer auth sets `Authorization: Bearer <creds>`", async () => {
    mock.enqueueJson(bundleOf());

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
      auth: { type: "bearer", credentials: "sk-live-1234" },
    });

    await client.search("Patient").execute();
    expect(mock.requests[0]!.headers["authorization"]).toBe("Bearer sk-live-1234");
  });

  it("basic auth sets `Authorization: Basic <creds>` verbatim (no re-encoding)", async () => {
    mock.enqueueJson(bundleOf());

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
      auth: { type: "basic", credentials: "dXNlcjpwYXNz" },
    });

    await client.search("Patient").execute();
    expect(mock.requests[0]!.headers["authorization"]).toBe("Basic dXNlcjpwYXNz");
  });

  it("config.headers are merged into every request", async () => {
    mock.enqueueJson(bundleOf());
    mock.enqueueJson(patientAlice);

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
      headers: { "x-tenant": "demo", "x-trace-id": "t-42" },
    });

    await client.search("Patient").execute();
    await client.read("Patient", "pat-alice").execute();

    for (const req of mock.requests) {
      expect(req.headers["x-tenant"]).toBe("demo");
      expect(req.headers["x-trace-id"]).toBe("t-42");
    }
  });

  it("works with per-operation HTTP methods: GET for search, GET for read, POST for transaction", async () => {
    mock.enqueueJson(bundleOf());
    mock.enqueueJson(patientAlice);
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "transaction-response",
      entry: [{ response: { status: "201" } }],
    });

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });

    await client.search("Patient").execute();
    await client.read("Patient", "pat-alice").execute();
    await client
      .transaction()
      .create({ resourceType: "Patient", name: [{ family: "X" }] })
      .execute();

    expect(mock.requests.map((r) => r.method)).toEqual(["GET", "GET", "POST"]);
  });

  it("trailing slash handling: baseUrl without trailing slash still hits `/fhir/Patient`", async () => {
    mock.enqueueJson(bundleOf());

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });

    await client.search("Patient").execute();
    const url = new URL(mock.requests[0]!.url);
    expect(url.pathname).toBe("/fhir/Patient");
  });

  it("trailing slash handling: baseUrl with trailing slash also hits `/fhir/Patient`", async () => {
    mock.enqueueJson(bundleOf());

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir/",
      fetch: mock.fetch,
    });

    await client.search("Patient").execute();
    const url = new URL(mock.requests[0]!.url);
    expect(url.pathname).toBe("/fhir/Patient");
  });
});
