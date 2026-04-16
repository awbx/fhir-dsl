import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { patientAlice } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / read", () => {
  let mock: MockFetch;
  beforeEach(() => {
    mock = new MockFetch();
  });

  it("GET /<RT>/<id> and returns the parsed body", async () => {
    mock.enqueueJson(patientAlice);

    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });

    const result = await client.read("Patient", "pat-alice").execute();

    expect(result).toEqual(patientAlice);
    const req = mock.requests[0]!;
    expect(req.method).toBe("GET");
    expect(req.url).toBe("https://example.test/fhir/Patient/pat-alice");
    expect(req.body).toBeNull();
  });

  it("compile() returns method:GET, path:RT/id, no params", () => {
    const client = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });

    const compiled = client.read("Patient", "pat-alice").compile();
    expect(compiled.method).toBe("GET");
    expect(compiled.path).toBe("Patient/pat-alice");
    expect(compiled.params).toEqual([]);
    expect(compiled.body).toBeUndefined();
  });
});
