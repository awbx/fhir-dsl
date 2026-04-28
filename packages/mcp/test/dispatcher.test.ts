import { describe, expect, it, vi } from "vitest";
import { MemoryAuditSink } from "../src/audit.js";
import { createServer } from "../src/server.js";
import type { McpRequest } from "../src/types.js";

function makeServer(
  opts: { writes?: readonly ("create" | "update" | "patch" | "delete")[]; fetchFn?: typeof globalThis.fetch } = {},
) {
  const audit = new MemoryAuditSink();
  const server = createServer({
    name: "test-server",
    version: "1.0.0",
    baseUrl: "https://example.test/baseR4",
    resourceTypes: ["Patient", "Observation"],
    audit,
    writes: opts.writes,
    fetch: opts.fetchFn,
  });
  return { server, audit };
}

const req = (method: string, params?: Record<string, unknown>, id: number = 1): McpRequest => ({
  jsonrpc: "2.0",
  id,
  method,
  ...(params ? { params } : {}),
});

describe("dispatcher.initialize", () => {
  it("returns server info and the MCP protocol version", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("initialize"));
    expect(res.error).toBeUndefined();
    expect(res.result).toMatchObject({
      protocolVersion: expect.any(String),
      serverInfo: { name: "test-server", version: "1.0.0" },
    });
  });
});

describe("dispatcher.tools/list", () => {
  it("lists read verbs by default and excludes write verbs", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("tools/list"));
    const names = (res.result as { tools: Array<{ name: string }> }).tools.map((t) => t.name);
    expect(names).toEqual(
      expect.arrayContaining([
        "fhir.read",
        "fhir.vread",
        "fhir.search",
        "fhir.history",
        "fhir.operation",
        "fhir.capabilities",
      ]),
    );
    expect(names).not.toContain("fhir.create");
    expect(names).not.toContain("fhir.update");
  });

  it("includes opted-in write verbs only", async () => {
    const { server } = makeServer({ writes: ["create", "update"] });
    const res = await server.dispatcher.handleRequest(req("tools/list"));
    const names = (res.result as { tools: Array<{ name: string }> }).tools.map((t) => t.name);
    expect(names).toContain("fhir.create");
    expect(names).toContain("fhir.update");
    expect(names).not.toContain("fhir.delete");
    expect(names).not.toContain("fhir.patch");
  });

  it("constrains the resourceType param to the IG-bound resource list", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("tools/list"));
    const read = (
      res.result as {
        tools: Array<{ name: string; inputSchema: { properties: { resourceType: { enum: string[] } } } }>;
      }
    ).tools.find((t) => t.name === "fhir.read");
    expect(read?.inputSchema.properties.resourceType.enum).toEqual(["Patient", "Observation"]);
  });
});

describe("dispatcher.resources/list", () => {
  it("emits one fhir:// URI template per resourceType", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("resources/list"));
    const uris = (res.result as { resources: Array<{ uri: string }> }).resources.map((r) => r.uri);
    expect(uris).toEqual(["fhir://Patient/{id}", "fhir://Observation/{id}"]);
  });
});

describe("dispatcher.tools/call", () => {
  it("calls the upstream FHIR server, returns the body, and audits success", async () => {
    const fetchFn = vi.fn(
      async () =>
        new Response(JSON.stringify({ resourceType: "Patient", id: "abc" }), {
          status: 200,
          headers: { "content-type": "application/fhir+json" },
        }),
    );
    const { server, audit } = makeServer({ fetchFn });
    const res = await server.dispatcher.handleRequest(
      req("tools/call", { name: "fhir.read", arguments: { resourceType: "Patient", id: "abc" } }),
    );
    expect(res.error).toBeUndefined();
    const result = res.result as { content: Array<{ text: string }>; isError: boolean };
    expect(result.isError).toBe(false);
    const body = JSON.parse(result.content[0]!.text);
    expect(body).toMatchObject({ resourceType: "Patient", id: "abc" });

    expect(audit.events).toHaveLength(1);
    expect(audit.events[0]?.result.ok).toBe(true);
  });

  it("returns an OperationOutcome and audits the failure when upstream errors", async () => {
    const fetchFn = vi.fn(async () => new Response("Not Found", { status: 404 }));
    const { server, audit } = makeServer({ fetchFn });
    const res = await server.dispatcher.handleRequest(
      req("tools/call", { name: "fhir.read", arguments: { resourceType: "Patient", id: "missing" } }),
    );
    const result = res.result as { content: Array<{ text: string }>; isError: boolean };
    expect(result.isError).toBe(true);
    expect(audit.events[0]?.result.ok).toBe(false);
  });

  it("rejects unknown tool names", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("tools/call", { name: "nonsense" }));
    expect(res.error?.code).toBe(-32602);
  });
});

describe("dispatcher unknown methods", () => {
  it("returns a JSON-RPC method-not-found error", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("nonsense/method"));
    expect(res.error?.code).toBe(-32601);
  });

  it("answers ping with an empty result", async () => {
    const { server } = makeServer();
    const res = await server.dispatcher.handleRequest(req("ping"));
    expect(res.result).toEqual({});
  });
});
