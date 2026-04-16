import { createFhirClient, FhirRequestError } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / errors", () => {
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

  it("throws FhirRequestError on non-2xx with parsed OperationOutcome on `operationOutcome`", async () => {
    const oo = {
      resourceType: "OperationOutcome",
      issue: [{ severity: "error", code: "processing", diagnostics: "invalid filter" }],
    };
    mock.enqueueJson(oo, { status: 422, statusText: "Unprocessable Entity" });

    const promise = client().search("Patient").where("gender", "eq", "female").execute();

    await expect(promise).rejects.toBeInstanceOf(FhirRequestError);
    await expect(promise).rejects.toMatchObject({
      status: 422,
      statusText: "Unprocessable Entity",
      operationOutcome: oo,
    });
  });

  it("operationOutcome is null when error body is not JSON (no parse-error leaks out)", async () => {
    mock.enqueueText("bad gateway", { status: 502, statusText: "Bad Gateway" });

    const err = await client()
      .read("Patient", "pat-1")
      .execute()
      .then(
        () => null,
        (e: unknown) => e,
      );

    expect(err).toBeInstanceOf(FhirRequestError);
    expect((err as FhirRequestError).status).toBe(502);
    expect((err as FhirRequestError).statusText).toBe("Bad Gateway");
    expect((err as FhirRequestError).operationOutcome).toBeNull();
  });

  it("error path preserves status code for 4xx and 5xx alike", async () => {
    for (const status of [400, 401, 403, 404, 409, 410, 500, 503] as const) {
      mock.enqueueJson({ resourceType: "OperationOutcome", issue: [] }, { status, statusText: `HTTP ${status}` });
      await expect(client().search("Patient").execute()).rejects.toMatchObject({
        name: "FhirRequestError",
        status,
      });
    }
  });

  it("read() error path also throws FhirRequestError (not just search)", async () => {
    mock.enqueueJson(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "not-found" }] },
      { status: 404, statusText: "Not Found" },
    );
    await expect(client().read("Patient", "missing").execute()).rejects.toBeInstanceOf(FhirRequestError);
  });

  it("transaction() error path also throws FhirRequestError", async () => {
    mock.enqueueJson(
      { resourceType: "OperationOutcome", issue: [{ severity: "error", code: "transient" }] },
      { status: 503, statusText: "Service Unavailable" },
    );

    await expect(
      client()
        .transaction()
        .create({ resourceType: "Patient", name: [{ family: "Fails" }] })
        .execute(),
    ).rejects.toBeInstanceOf(FhirRequestError);
  });

  it("FhirRequestError is a real Error subclass with usable name & message", async () => {
    mock.enqueueJson({ resourceType: "OperationOutcome", issue: [] }, { status: 418, statusText: "I'm a teapot" });

    try {
      await client().search("Patient").execute();
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).name).toBe("FhirRequestError");
      expect(typeof (e as Error).message).toBe("string");
      expect((e as Error).message.length).toBeGreaterThan(0);
    }
  });
});
