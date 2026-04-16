import { describe, expect, it, vi } from "vitest";
import { createFhirClient, FhirClient, FhirRequestError } from "./fhir-client.js";

type TestSchema = {
  resources: { Patient: { resourceType: "Patient"; id?: string } };
  searchParams: {
    Patient: {
      family: { type: "string"; value: string };
      birthdate: { type: "date"; value: string };
    };
  };
  includes: Record<string, never>;
  profiles: Record<string, never>;
};

function mockFetch(response: object, status = 200) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => response,
  })) as any;
}

describe("FhirClient", () => {
  describe("search", () => {
    it("constructs GET request with search params", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await client.search("Patient").where("family", "eq", "Smith").execute();

      expect(fetch).toHaveBeenCalledOnce();
      const [url, opts] = fetch.mock.calls[0]!;
      expect(url).toContain("Patient");
      expect(url).toContain("family=Smith");
      expect(opts.method).toBe("GET");
    });

    it("sets FHIR headers", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await client.search("Patient").execute();

      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.headers.Accept).toBe("application/fhir+json");
      expect(opts.headers["Content-Type"]).toBe("application/fhir+json");
    });

    it("sets bearer auth header", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({
        baseUrl: "https://fhir.example.com",
        auth: { type: "bearer", credentials: "my-token" },
        fetch,
      });

      await client.search("Patient").execute();

      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.headers.Authorization).toBe("Bearer my-token");
    });

    it("sets basic auth header", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({
        baseUrl: "https://fhir.example.com",
        auth: { type: "basic", credentials: "dXNlcjpwYXNz" },
        fetch,
      });

      await client.search("Patient").execute();

      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.headers.Authorization).toBe("Basic dXNlcjpwYXNz");
    });

    it("includes custom headers", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({
        baseUrl: "https://fhir.example.com",
        headers: { "X-Custom": "value" },
        fetch,
      });

      await client.search("Patient").execute();

      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.headers["X-Custom"]).toBe("value");
    });
  });

  describe("read", () => {
    it("constructs GET request with resource path", async () => {
      const patient = { resourceType: "Patient", id: "123" };
      const fetch = mockFetch(patient);
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      const result = await client.read("Patient", "123").execute();

      expect(fetch).toHaveBeenCalledOnce();
      const [url] = fetch.mock.calls[0]!;
      expect(url).toContain("Patient/123");
      expect(result).toEqual(patient);
    });
  });

  describe("transaction", () => {
    it("sends POST to root with bundle body", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "transaction-response" });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await client
        .transaction()
        .create({ resourceType: "Patient" } as any)
        .execute();

      expect(fetch).toHaveBeenCalledOnce();
      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.method).toBe("POST");
      expect(opts.body).toBeDefined();
      const body = JSON.parse(opts.body);
      expect(body.resourceType).toBe("Bundle");
      expect(body.type).toBe("transaction");
    });
  });

  describe("batch", () => {
    it("sends POST to root with batch bundle body", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "batch-response" });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await client
        .batch()
        .create({ resourceType: "Patient" } as any)
        .execute();

      expect(fetch).toHaveBeenCalledOnce();
      const [, opts] = fetch.mock.calls[0]!;
      expect(opts.method).toBe("POST");
      expect(opts.body).toBeDefined();
      const body = JSON.parse(opts.body);
      expect(body.resourceType).toBe("Bundle");
      expect(body.type).toBe("batch");
    });
  });

  describe("error handling", () => {
    it("throws FhirRequestError on non-ok response", async () => {
      const operationOutcome = {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-found" }],
      };
      const fetch = mockFetch(operationOutcome, 404);
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await expect(client.read("Patient", "999").execute()).rejects.toThrow(FhirRequestError);
    });

    it("includes status code in error", async () => {
      const fetch = mockFetch({}, 403);
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      try {
        await client.read("Patient", "999").execute();
        expect.unreachable("Should have thrown");
      } catch (e) {
        expect(e).toBeInstanceOf(FhirRequestError);
        expect((e as FhirRequestError).status).toBe(403);
      }
    });
  });

  describe("URL construction", () => {
    it("handles baseUrl with trailing slash", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com/r4/", fetch });

      await client.search("Patient").execute();

      const [url] = fetch.mock.calls[0]!;
      expect(url).toMatch(/^https:\/\/fhir\.example\.com\/r4\/Patient/);
    });

    it("handles baseUrl without trailing slash", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com/r4", fetch });

      await client.search("Patient").execute();

      const [url] = fetch.mock.calls[0]!;
      expect(url).toMatch(/^https:\/\/fhir\.example\.com\/r4\/Patient/);
    });

    it("appends search prefix to param values", async () => {
      const fetch = mockFetch({ resourceType: "Bundle", type: "searchset", entry: [] });
      const client = createFhirClient<TestSchema>({ baseUrl: "https://fhir.example.com", fetch });

      await client.search("Patient").where("birthdate", "ge", "1990-01-01").execute();

      const [url] = fetch.mock.calls[0]!;
      expect(url).toContain("birthdate=ge1990-01-01");
    });
  });

  describe("createFhirClient factory", () => {
    it("returns a FhirClient instance", () => {
      const client = createFhirClient<TestSchema>({
        baseUrl: "https://fhir.example.com",
        fetch: vi.fn() as any,
      });

      expect(client).toBeInstanceOf(FhirClient);
    });
  });
});
