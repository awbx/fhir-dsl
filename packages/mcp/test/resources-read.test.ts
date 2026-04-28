import { describe, expect, it, vi } from "vitest";
import { MemoryAuditSink } from "../src/audit.js";
import { parseFhirUri } from "../src/dispatcher.js";
import { createServer } from "../src/server.js";
import type { McpRequest } from "../src/types.js";

const req = (method: string, params?: Record<string, unknown>): McpRequest => ({
  jsonrpc: "2.0",
  id: 1,
  method,
  ...(params ? { params } : {}),
});

describe("parseFhirUri", () => {
  it("parses a type/id URI", () => {
    expect(parseFhirUri("fhir://Patient/abc")).toEqual({ resourceType: "Patient", id: "abc" });
  });

  it("parses a type/id/_history/versionId URI", () => {
    expect(parseFhirUri("fhir://Patient/abc/_history/5")).toEqual({
      resourceType: "Patient",
      id: "abc",
      versionId: "5",
    });
  });

  it("rejects malformed URIs", () => {
    expect(parseFhirUri("https://example/Patient/abc")).toBeNull();
    expect(parseFhirUri("fhir://Patient")).toBeNull();
    expect(parseFhirUri("fhir://Patient/")).toBeNull();
    expect(parseFhirUri("fhir://Patient/abc/_history")).toBeNull();
    expect(parseFhirUri("fhir://Patient/abc/_history/5/_history/6")).toBeNull();
  });
});

describe("dispatcher.resources/read", () => {
  const fetchOk = (body: unknown) =>
    vi.fn(
      async () =>
        new Response(JSON.stringify(body), {
          status: 200,
          headers: { "content-type": "application/fhir+json" },
        }),
    );

  it("fetches the resource via the upstream and returns it as content", async () => {
    const fetchFn = fetchOk({ resourceType: "Patient", id: "abc", active: true });
    const audit = new MemoryAuditSink();
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      audit,
      fetch: fetchFn,
    });

    const res = await server.dispatcher.handleRequest(req("resources/read", { uri: "fhir://Patient/abc" }));
    expect(res.error).toBeUndefined();
    const result = res.result as { contents: Array<{ uri: string; mimeType: string; text: string }> };
    expect(result.contents[0]?.uri).toBe("fhir://Patient/abc");
    expect(result.contents[0]?.mimeType).toBe("application/fhir+json");
    expect(JSON.parse(result.contents[0]!.text)).toMatchObject({ id: "abc", active: true });
    expect(audit.events).toHaveLength(1);
    expect(audit.events[0]?.call.verb).toBe("read");
  });

  it("routes to vread when the URI carries a versionId", async () => {
    const fetchFn = fetchOk({ resourceType: "Patient", id: "abc", meta: { versionId: "5" } });
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    await server.dispatcher.handleRequest(req("resources/read", { uri: "fhir://Patient/abc/_history/5" }));
    expect(fetchFn).toHaveBeenCalledWith("https://example.test/baseR4/Patient/abc/_history/5", expect.anything());
  });

  it("rejects URIs whose resourceType is not in the bound IG", async () => {
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchOk({}),
    });
    const res = await server.dispatcher.handleRequest(req("resources/read", { uri: "fhir://Encounter/abc" }));
    expect(res.error?.code).toBe(-32602);
    expect(res.error?.message).toContain("Encounter");
  });

  it("returns a JSON-RPC error when the upstream errors", async () => {
    const fetchFn = vi.fn(async () => new Response("Not Found", { status: 404 }));
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });
    const res = await server.dispatcher.handleRequest(req("resources/read", { uri: "fhir://Patient/missing" }));
    expect(res.error?.code).toBe(-32000);
    expect(res.error?.message).toContain("Failed to read");
  });

  it("rejects malformed URIs with InvalidParams", async () => {
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchOk({}),
    });
    const res = await server.dispatcher.handleRequest(req("resources/read", { uri: "https://example/Patient/abc" }));
    expect(res.error?.code).toBe(-32602);
  });
});
