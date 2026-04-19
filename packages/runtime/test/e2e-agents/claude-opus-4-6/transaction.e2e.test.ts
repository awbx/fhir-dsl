import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { observationBodyWeight, patientAlice, patientBob } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / transaction", () => {
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

  it("compile() produces a transaction Bundle with correct method+url per entry", () => {
    const tx = client()
      .transaction()
      .create({ resourceType: "Patient", name: [{ family: "New" }] })
      .update(patientAlice)
      .delete("Observation", "obs-1");

    const bundle = tx.compile();
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("transaction");
    expect(bundle.entry).toHaveLength(3);
    // POST entry carries an auto-generated urn:uuid fullUrl (BUG-011 fix).
    expect(bundle.entry![0]!.fullUrl).toMatch(/^urn:uuid:[0-9a-f-]+$/i);
    expect(bundle.entry![0]!.resource).toEqual({ resourceType: "Patient", name: [{ family: "New" }] });
    expect(bundle.entry![0]!.request).toEqual({ method: "POST", url: "Patient" });
    expect(bundle.entry![1]).toEqual({
      resource: patientAlice,
      request: { method: "PUT", url: `Patient/${patientAlice.id}` },
    });
    expect(bundle.entry![2]).toEqual({ request: { method: "DELETE", url: "Observation/obs-1" } });
  });

  it("execute() POSTs the Bundle to baseUrl root with FHIR headers", async () => {
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "transaction-response",
      entry: [
        { response: { status: "201 Created" } },
        { response: { status: "200 OK" } },
        { response: { status: "204 No Content" } },
      ],
    });

    const tx = client().transaction().create(patientBob).update(patientAlice).delete("Observation", "obs-stale");

    const compiled = tx.compile();
    const response = await tx.execute();

    expect(response.resourceType).toBe("Bundle");
    expect(response.type).toBe("transaction-response");

    const req = mock.requests[0]!;
    expect(req.method).toBe("POST");
    expect(req.url).toMatch(/\/fhir\/?$/);
    expect(req.headers.accept).toBe("application/fhir+json");
    expect(req.headers["content-type"]).toBe("application/fhir+json");
    expect(req.body).not.toBeNull();
    expect(JSON.parse(req.body!)).toEqual(compiled);
  });

  it("update() throws synchronously when resource has no id", () => {
    const tx = client().transaction();
    expect(() => tx.update({ resourceType: "Patient", name: [{ family: "NoId" }] } as any)).toThrow(/id/i);
  });

  it("transaction builder is chainable and immutable", () => {
    const base = client().transaction().create(patientBob);
    const branchA = base.delete("Observation", "obs-a");
    const branchB = base.delete("Observation", "obs-b");

    const a = branchA.compile();
    const b = branchB.compile();
    expect(a.entry?.[1]?.request?.url).toBe("Observation/obs-a");
    expect(b.entry?.[1]?.request?.url).toBe("Observation/obs-b");
  });

  it("allows a transaction to include multi-resource create and delete in one POST", async () => {
    mock.enqueueJson({
      resourceType: "Bundle",
      type: "transaction-response",
      entry: [{ response: { status: "201 Created" } }, { response: { status: "201 Created" } }],
    });

    await client().transaction().create(patientBob).create(observationBodyWeight).execute();

    const req = mock.requests[0]!;
    const sent = JSON.parse(req.body!);
    expect(sent.entry).toHaveLength(2);
    expect(sent.entry[0].request).toEqual({ method: "POST", url: "Patient" });
    expect(sent.entry[1].request).toEqual({ method: "POST", url: "Observation" });
  });
});
