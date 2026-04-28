import { describe, expect, it, vi } from "vitest";
import type { AuthResolver } from "../src/auth.js";
import { FhirUpstream } from "../src/upstream.js";

const noAuth: AuthResolver = { authorize: async () => ({}) };

function makeUpstream(fetchFn: typeof globalThis.fetch, baseUrl = "https://example.test/baseR4") {
  return new FhirUpstream({ baseUrl, auth: noAuth, fetch: fetchFn });
}

function ok(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/fhir+json" } });
}

describe("FhirUpstream.run", () => {
  it("issues a GET to /<type>/<id> for read", async () => {
    const fetchFn = vi.fn(async () => ok({ resourceType: "Patient", id: "abc" }));
    const result = await makeUpstream(fetchFn).run({ verb: "read", resourceType: "Patient", id: "abc" });
    expect(result.ok).toBe(true);
    expect(fetchFn).toHaveBeenCalledWith(
      "https://example.test/baseR4/Patient/abc",
      expect.objectContaining({ headers: expect.objectContaining({ Accept: "application/fhir+json" }) }),
    );
    expect(result.body).toMatchObject({ resourceType: "Patient", id: "abc" });
  });

  it("builds vread URLs with versionId from params", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    await makeUpstream(fetchFn).run({
      verb: "vread",
      resourceType: "Patient",
      id: "abc",
      params: { versionId: "5" },
    });
    expect(fetchFn).toHaveBeenCalledWith("https://example.test/baseR4/Patient/abc/_history/5", expect.anything());
  });

  it("encodes search params as a query string", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    await makeUpstream(fetchFn).run({
      verb: "search",
      resourceType: "Patient",
      params: { name: "smith", _count: 5, identifier: ["a", "b"] },
    });
    const url = (fetchFn.mock.calls[0]?.[0] ?? "") as string;
    expect(url).toContain("/Patient?");
    expect(url).toContain("name=smith");
    expect(url).toContain("_count=5");
    expect(url).toContain("identifier=a");
    expect(url).toContain("identifier=b");
  });

  it("posts a body for create with the fhir+json content type", async () => {
    const fetchFn = vi.fn(async () => ok({ resourceType: "Patient", id: "new" }, 201));
    await makeUpstream(fetchFn).run({
      verb: "create",
      resourceType: "Patient",
      params: { resourceType: "Patient", name: [{ given: ["Ada"] }] },
    });
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.method).toBe("POST");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/fhir+json");
    expect(JSON.parse(init?.body as string)).toMatchObject({ resourceType: "Patient" });
  });

  it("uses PATCH with json-patch+json content type for patch", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    await makeUpstream(fetchFn).run({
      verb: "patch",
      resourceType: "Patient",
      id: "abc",
      patch: [{ op: "replace", path: "/active", value: false }],
    });
    const init = fetchFn.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.method).toBe("PATCH");
    expect((init?.headers as Record<string, string>)["Content-Type"]).toBe("application/json-patch+json");
  });

  it("targets /metadata for capabilities", async () => {
    const fetchFn = vi.fn(async () => ok({ resourceType: "CapabilityStatement" }));
    await makeUpstream(fetchFn).run({ verb: "capabilities", resourceType: "" });
    expect(fetchFn).toHaveBeenCalledWith("https://example.test/baseR4/metadata", expect.anything());
  });

  it("targets a type-level operation when resourceType is set", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    await makeUpstream(fetchFn).run({
      verb: "operation",
      resourceType: "Patient",
      operation: "$everything",
    });
    expect(fetchFn).toHaveBeenCalledWith("https://example.test/baseR4/Patient/$everything", expect.anything());
  });

  it("targets an instance-level operation when id is set", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    await makeUpstream(fetchFn).run({
      verb: "operation",
      resourceType: "Patient",
      id: "abc",
      operation: "everything",
    });
    expect(fetchFn).toHaveBeenCalledWith("https://example.test/baseR4/Patient/abc/$everything", expect.anything());
  });

  it("returns an OperationOutcome when the upstream responds non-2xx", async () => {
    const fetchFn = vi.fn(async () => new Response("Not Found", { status: 404 }));
    const result = await makeUpstream(fetchFn).run({ verb: "read", resourceType: "Patient", id: "missing" });
    expect(result.ok).toBe(false);
    expect((result.outcome as { resourceType: string }).resourceType).toBe("OperationOutcome");
  });

  it("returns an OperationOutcome when fetch itself throws", async () => {
    const fetchFn = vi.fn(async () => {
      throw new Error("network down");
    });
    const result = await makeUpstream(fetchFn).run({ verb: "read", resourceType: "Patient", id: "abc" });
    expect(result.ok).toBe(false);
    const outcome = result.outcome as { issue: Array<{ diagnostics: string }> };
    expect(outcome.issue[0]?.diagnostics).toContain("network down");
  });

  it("propagates auth headers from the resolver", async () => {
    const fetchFn = vi.fn(async () => ok({}));
    const upstream = new FhirUpstream({
      baseUrl: "https://example.test/baseR4",
      auth: { authorize: async () => ({ Authorization: "Bearer t" }) },
      fetch: fetchFn,
    });
    await upstream.run({ verb: "read", resourceType: "Patient", id: "abc" });
    const headers = (fetchFn.mock.calls[0]?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer t");
  });
});
