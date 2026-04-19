import { describe, expect, it, vi } from "vitest";
import { FhirError } from "./errors.js";
import { FhirExecutor } from "./executor.js";

function mockFetch(body: object, status = 200) {
  return vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
  })) as unknown as typeof globalThis.fetch;
}

describe("FhirExecutor", () => {
  describe("execute", () => {
    it("constructs correct URL from compiled query", async () => {
      const fetch = mockFetch({ resourceType: "Bundle" });
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.execute({
        method: "GET",
        path: "Patient",
        params: [
          { name: "family", value: "Smith" },
          { name: "birthdate", prefix: "ge", value: "1990-01-01" },
        ],
      });

      const [url] = (fetch as any).mock.calls[0]!;
      expect(url).toContain("Patient");
      expect(url).toContain("family=Smith");
      expect(url).toContain("birthdate=ge1990-01-01");
    });

    it("appends modifier to param name (FHIR :modifier)", async () => {
      const fetch = mockFetch({ resourceType: "Bundle" });
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.execute({
        method: "GET",
        path: "Patient",
        params: [
          { name: "family", modifier: "exact", value: "Smith" },
          { name: "gender", modifier: "not", value: "male" },
          { name: "birthdate", modifier: "missing", value: "true" },
        ],
      });

      const [url] = (fetch as any).mock.calls[0]!;
      expect(url).toContain("family%3Aexact=Smith");
      expect(url).toContain("gender%3Anot=male");
      expect(url).toContain("birthdate%3Amissing=true");
    });

    it("supports modifier and prefix on the same param (e.g. _has subselect)", async () => {
      const fetch = mockFetch({ resourceType: "Bundle" });
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.execute({
        method: "GET",
        path: "Observation",
        params: [{ name: "code", modifier: "in", value: "ValueSet/abc" }],
      });

      const [url] = (fetch as any).mock.calls[0]!;
      expect(url).toContain("code%3Ain=ValueSet%2Fabc");
    });

    it("sets FHIR content headers", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.execute({ method: "GET", path: "Patient", params: [] });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers.Accept).toBe("application/fhir+json");
      expect(opts.headers["Content-Type"]).toBe("application/fhir+json");
    });

    it("sets bearer auth", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({
        baseUrl: "https://fhir.example.com",
        auth: { type: "bearer", credentials: "token123" },
        fetch,
      });

      await executor.execute({ method: "GET", path: "Patient", params: [] });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers.Authorization).toBe("Bearer token123");
    });

    it("sets basic auth", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({
        baseUrl: "https://fhir.example.com",
        auth: { type: "basic", credentials: "dXNlcjpwYXNz" },
        fetch,
      });

      await executor.execute({ method: "GET", path: "Patient", params: [] });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers.Authorization).toBe("Basic dXNlcjpwYXNz");
    });

    it("merges custom headers", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({
        baseUrl: "https://fhir.example.com",
        headers: { "X-Custom": "val" },
        fetch,
      });

      await executor.execute({ method: "GET", path: "Patient", params: [] });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers["X-Custom"]).toBe("val");
    });

    it("merges query-level headers", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.execute({
        method: "GET",
        path: "Patient",
        params: [],
        headers: { "If-None-Match": 'W/"abc"' },
      });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers["If-None-Match"]).toBe('W/"abc"');
    });

    it("sends JSON body for POST", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      const body = { resourceType: "Patient", name: [{ family: "Test" }] };
      await executor.execute({ method: "POST", path: "Patient", params: [], body });

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.method).toBe("POST");
      expect(JSON.parse(opts.body)).toEqual(body);
    });

    it("throws FhirError on non-ok response", async () => {
      const outcome = {
        resourceType: "OperationOutcome",
        issue: [{ severity: "error", code: "not-found", diagnostics: "Not found" }],
      };
      const fetch = mockFetch(outcome, 404);
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await expect(executor.execute({ method: "GET", path: "Patient/999", params: [] })).rejects.toThrow(FhirError);
    });

    it("handles baseUrl with trailing slash", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com/r4/", fetch });

      await executor.execute({ method: "GET", path: "Patient", params: [] });

      const [url] = (fetch as any).mock.calls[0]!;
      expect(url).toMatch(/\/r4\/Patient/);
    });
  });

  describe("executeUrl", () => {
    it("fetches a full URL directly", async () => {
      const fetch = mockFetch({ resourceType: "Bundle" });
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await executor.executeUrl("https://fhir.example.com/Patient?_page=2");

      const [url, opts] = (fetch as any).mock.calls[0]!;
      expect(url).toBe("https://fhir.example.com/Patient?_page=2");
      expect(opts.method).toBe("GET");
    });

    it("includes auth on direct URL calls", async () => {
      const fetch = mockFetch({});
      const executor = new FhirExecutor({
        baseUrl: "https://fhir.example.com",
        auth: { type: "bearer", credentials: "tok" },
        fetch,
      });

      await executor.executeUrl("https://fhir.example.com/Patient?_page=2");

      const [, opts] = (fetch as any).mock.calls[0]!;
      expect(opts.headers.Authorization).toBe("Bearer tok");
    });

    it("throws FhirError on non-ok response", async () => {
      const fetch = mockFetch({}, 500);
      const executor = new FhirExecutor({ baseUrl: "https://fhir.example.com", fetch });

      await expect(executor.executeUrl("https://fhir.example.com/Patient")).rejects.toThrow(FhirError);
    });
  });
});
