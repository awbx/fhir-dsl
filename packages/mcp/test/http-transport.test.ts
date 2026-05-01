import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { type HttpTransport, httpTransport } from "../src/transports/http.js";
import type { Dispatcher, McpRequest, McpResponse } from "../src/types.js";

function makeStubDispatcher(handler?: (req: McpRequest) => McpResponse | Promise<McpResponse>): Dispatcher {
  return {
    async handleRequest(request) {
      if (handler) return handler(request);
      return {
        jsonrpc: "2.0",
        id: request.id ?? null,
        result: { echo: request.method },
      };
    },
  };
}

async function postJson(url: string, body: unknown, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

describe("httpTransport", () => {
  let active: HttpTransport | undefined;

  afterEach(async () => {
    if (active) {
      await active.stop?.();
      active = undefined;
    }
  });

  it("accepts a JSON-RPC POST and returns the dispatcher's response", async () => {
    active = httpTransport();
    await active.start(makeStubDispatcher());
    const res = await postJson(active.url(), { jsonrpc: "2.0", id: 1, method: "ping" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    expect(await res.json()).toEqual({ jsonrpc: "2.0", id: 1, result: { echo: "ping" } });
  });

  it("returns -32700 on invalid JSON", async () => {
    active = httpTransport();
    await active.start(makeStubDispatcher());
    const res = await postJson(active.url(), "{not json");
    expect(res.status).toBe(200);
    const body = (await res.json()) as McpResponse;
    expect(body.error?.code).toBe(-32700);
    expect(body.id).toBe(null);
  });

  it("returns -32600 on a non-JSON-RPC body", async () => {
    active = httpTransport();
    await active.start(makeStubDispatcher());
    const res = await postJson(active.url(), { jsonrpc: "1.0", id: 7, method: "ping" });
    const body = (await res.json()) as McpResponse;
    expect(body.error?.code).toBe(-32600);
    expect(body.id).toBe(7);
  });

  it("returns -32603 when the dispatcher throws", async () => {
    active = httpTransport();
    await active.start(
      makeStubDispatcher(() => {
        throw new Error("boom");
      }),
    );
    const res = await postJson(active.url(), { jsonrpc: "2.0", id: 9, method: "fail" });
    const body = (await res.json()) as McpResponse;
    expect(body.error?.code).toBe(-32603);
    expect(body.error?.message).toContain("boom");
  });

  it("rejects non-GET/POST methods with 405", async () => {
    active = httpTransport();
    await active.start(makeStubDispatcher());
    const res = await fetch(active.url(), { method: "DELETE" });
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toContain("POST");
  });

  it("returns 404 for paths other than the configured endpoint", async () => {
    active = httpTransport({ path: "/mcp" });
    await active.start(makeStubDispatcher());
    const base = new URL(active.url());
    const res = await fetch(`${base.origin}/something-else`);
    expect(res.status).toBe(404);
  });

  it("respects the authenticate hook", async () => {
    active = httpTransport({
      authenticate: (req) => req.headers.authorization === "Bearer secret",
    });
    await active.start(makeStubDispatcher());

    const denied = await postJson(active.url(), { jsonrpc: "2.0", id: 1, method: "ping" });
    expect(denied.status).toBe(401);

    const allowed = await postJson(
      active.url(),
      { jsonrpc: "2.0", id: 1, method: "ping" },
      {
        headers: { "Content-Type": "application/json", Authorization: "Bearer secret" },
      },
    );
    expect(allowed.status).toBe(200);
  });

  it("returns 413 when the body exceeds maxRequestBytes", async () => {
    active = httpTransport({ maxRequestBytes: 16 });
    await active.start(makeStubDispatcher());
    const huge = { jsonrpc: "2.0", id: 1, method: "x", params: { pad: "y".repeat(1000) } };
    const res = await postJson(active.url(), huge);
    expect(res.status).toBe(413);
  });

  it("emits CORS headers on preflight when cors is enabled", async () => {
    active = httpTransport({ cors: true });
    await active.start(makeStubDispatcher());
    const preflight = await fetch(active.url(), { method: "OPTIONS" });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe("*");
    expect(preflight.headers.get("access-control-allow-methods")).toContain("POST");
  });

  describe("batched JSON-RPC", () => {
    it("dispatches every entry in an array body and returns an array response", async () => {
      active = httpTransport();
      await active.start(makeStubDispatcher());
      const res = await postJson(active.url(), [
        { jsonrpc: "2.0", id: 1, method: "ping" },
        { jsonrpc: "2.0", id: 2, method: "pong" },
      ]);
      expect(res.status).toBe(200);
      const body = (await res.json()) as McpResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
      expect(body[0]).toMatchObject({ id: 1, result: { echo: "ping" } });
      expect(body[1]).toMatchObject({ id: 2, result: { echo: "pong" } });
    });

    it("rejects an empty array with -32600", async () => {
      active = httpTransport();
      await active.start(makeStubDispatcher());
      const res = await postJson(active.url(), []);
      const body = (await res.json()) as McpResponse;
      expect(body.error?.code).toBe(-32600);
    });

    it("returns -32600 for malformed entries inside a valid batch", async () => {
      active = httpTransport();
      await active.start(makeStubDispatcher());
      const res = await postJson(active.url(), [{ jsonrpc: "2.0", id: 1, method: "ping" }, { not: "a request" }]);
      const body = (await res.json()) as McpResponse[];
      expect(body[0]).toMatchObject({ id: 1, result: { echo: "ping" } });
      expect(body[1]?.error?.code).toBe(-32600);
    });
  });

  describe("text/event-stream responses", () => {
    it("returns SSE when the client requests it on POST", async () => {
      active = httpTransport();
      await active.start(makeStubDispatcher());
      const res = await postJson(
        active.url(),
        { jsonrpc: "2.0", id: 1, method: "ping" },
        { headers: { "Content-Type": "application/json", Accept: "text/event-stream" } },
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");
      const text = await res.text();
      expect(text).toContain("event: message");
      expect(text).toContain('"echo":"ping"');
    });
  });

  describe("GET /mcp server-initiated stream", () => {
    it("opens an SSE stream and sends a connected comment", async () => {
      active = httpTransport({ sseKeepaliveMs: 0 });
      await active.start(makeStubDispatcher());

      const ctrl = new AbortController();
      const res = await fetch(active.url(), {
        method: "GET",
        headers: { Accept: "text/event-stream" },
        signal: ctrl.signal,
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/event-stream");

      const reader = res.body?.getReader();
      expect(reader).toBeDefined();
      const { value } = await (reader as ReadableStreamDefaultReader<Uint8Array>).read();
      const chunk = new TextDecoder().decode(value);
      expect(chunk).toContain(": connected");

      ctrl.abort();
    });

    it("releases active SSE streams when stop() is called", async () => {
      active = httpTransport({ sseKeepaliveMs: 0 });
      await active.start(makeStubDispatcher());

      const ctrl = new AbortController();
      const res = await fetch(active.url(), {
        method: "GET",
        headers: { Accept: "text/event-stream" },
        signal: ctrl.signal,
      });

      // Read one chunk so the stream is fully open.
      const reader = res.body?.getReader();
      await (reader as ReadableStreamDefaultReader<Uint8Array>).read();

      // stop() must not hang on the active stream.
      const stopP = active.stop?.();
      await Promise.race([stopP, new Promise((_, reject) => setTimeout(() => reject(new Error("stop hung")), 2000))]);
      ctrl.abort();
      active = undefined;
    });
  });

  it("attaches to a caller-provided http.Server without owning lifecycle", async () => {
    const externalServer = createHttpServer();
    await new Promise<void>((resolve) => externalServer.listen(0, "127.0.0.1", resolve));

    active = httpTransport({ server: externalServer, path: "/mcp" });
    await active.start(makeStubDispatcher());

    const addr = externalServer.address() as AddressInfo;
    const res = await postJson(`http://127.0.0.1:${addr.port}/mcp`, {
      jsonrpc: "2.0",
      id: 1,
      method: "ping",
    });
    expect(res.status).toBe(200);

    // stop() is a no-op for caller-owned servers — we close it ourselves.
    await active.stop?.();
    active = undefined;
    await new Promise<void>((resolve) => externalServer.close(() => resolve()));
  });
});
