import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { Dispatcher, McpRequest, McpResponse, Transport } from "../types.js";

// Streamable HTTP transport for MCP — POST JSON-RPC to a single endpoint;
// server replies with `Content-Type: application/json`. Spec:
//   https://modelcontextprotocol.io/docs/concepts/transports#streamable-http
//
// Initial scope:
//   - POST /mcp accepts a JSON-RPC request body, returns a single response.
//   - Optional CORS for browser-hosted clients.
//   - Optional authenticate hook — return false to short-circuit with 401.
//   - The transport binds its own http.Server unless caller provides one.
//
// Out of scope here (follow-ups):
//   - GET /mcp opening an SSE stream for server-initiated notifications.
//   - text/event-stream responses for streaming tool output.
//   - Batched JSON-RPC arrays.

export interface HttpTransportOptions {
  /** TCP port. Default 0 (ephemeral — read back via the returned `url()`). */
  port?: number;
  /** Bind host. Default `127.0.0.1`. */
  host?: string;
  /** Endpoint path. Default `/mcp`. */
  path?: string;
  /** Add `Access-Control-Allow-Origin: *` and the matching preflight handler. */
  cors?: boolean;
  /** Reject requests when the hook returns false. Receives the raw IncomingMessage. */
  authenticate?: (req: IncomingMessage) => boolean | Promise<boolean>;
  /** Hard cap on request body size — protects against memory exhaustion. Default 1 MiB. */
  maxRequestBytes?: number;
  /**
   * Optional pre-built http.Server. When provided, the transport mounts its
   * route handler on the existing server instead of starting its own — handy
   * when the MCP endpoint shares a process with an unrelated HTTP service.
   */
  server?: Server;
}

export interface HttpTransport extends Transport {
  /** Resolved URL after `start()` — contains the actual port when 0 was passed. */
  url(): string;
  /** Underlying http.Server instance (created by the transport unless `options.server` was supplied). */
  server(): Server;
}

const DEFAULT_MAX_BYTES = 1 << 20;

export function httpTransport(options: HttpTransportOptions = {}): HttpTransport {
  const path = options.path ?? "/mcp";
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 0;
  const cors = options.cors === true;
  const maxBytes = options.maxRequestBytes ?? DEFAULT_MAX_BYTES;
  const ownsServer = !options.server;
  const server = options.server ?? createServer();

  let listening = false;
  let resolvedUrl: string | undefined;

  const transport: HttpTransport = {
    async start(dispatcher: Dispatcher) {
      const handler = makeRequestHandler({
        dispatcher,
        path,
        cors,
        maxBytes,
        authenticate: options.authenticate,
      });
      server.on("request", handler);

      if (ownsServer) {
        await new Promise<void>((resolve, reject) => {
          server.once("error", reject);
          server.listen(port, host, () => {
            server.removeListener("error", reject);
            resolve();
          });
        });
        listening = true;
      }

      const addr = server.address();
      resolvedUrl = formatUrl(addr, host, path);
    },
    async stop() {
      if (!ownsServer || !listening) return;
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      listening = false;
    },
    url() {
      if (!resolvedUrl) throw new Error("http transport not started yet");
      return resolvedUrl;
    },
    server() {
      return server;
    },
  };

  return transport;
}

interface HandlerConfig {
  dispatcher: Dispatcher;
  path: string;
  cors: boolean;
  maxBytes: number;
  authenticate?: HttpTransportOptions["authenticate"];
}

function makeRequestHandler(cfg: HandlerConfig): (req: IncomingMessage, res: ServerResponse) => void {
  return (req, res) => {
    void handleRequest(req, res, cfg);
  };
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, cfg: HandlerConfig): Promise<void> {
  if (cfg.cors) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  }

  // Path mismatch — let other handlers (e.g. user's own routes) try.
  if (!matchesPath(req.url, cfg.path)) {
    if (res.headersSent || res.writableEnded) return;
    res.statusCode = 404;
    res.end();
    return;
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST, OPTIONS");
    res.end();
    return;
  }

  if (cfg.authenticate) {
    const ok = await cfg.authenticate(req);
    if (!ok) {
      res.statusCode = 401;
      res.end();
      return;
    }
  }

  let body: string;
  try {
    body = await readBody(req, cfg.maxBytes, res);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      // Response already written by readBody before destroying the request.
      return;
    }
    if (!res.headersSent) {
      res.statusCode = 400;
      res.end();
    }
    return;
  }

  let request: McpRequest;
  try {
    request = JSON.parse(body) as McpRequest;
  } catch {
    sendJsonRpc(res, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: invalid JSON" },
    });
    return;
  }

  if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    sendJsonRpc(res, {
      jsonrpc: "2.0",
      id: request?.id ?? null,
      error: { code: -32600, message: "Invalid request" },
    });
    return;
  }

  let response: McpResponse;
  try {
    response = await cfg.dispatcher.handleRequest(request);
  } catch (err) {
    sendJsonRpc(res, {
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: { code: -32603, message: `Internal error: ${err instanceof Error ? err.message : String(err)}` },
    });
    return;
  }

  sendJsonRpc(res, response);
}

function sendJsonRpc(res: ServerResponse, response: McpResponse): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response));
}

function matchesPath(reqUrl: string | undefined, expected: string): boolean {
  if (!reqUrl) return false;
  const justPath = reqUrl.split("?")[0] ?? "";
  return justPath === expected;
}

class PayloadTooLargeError extends Error {}

async function readBody(req: IncomingMessage, maxBytes: number, res: ServerResponse): Promise<string> {
  return new Promise((resolve, reject) => {
    let received = 0;
    let aborted = false;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      if (aborted) return;
      received += chunk.length;
      if (received > maxBytes) {
        aborted = true;
        // Write the 413 + Connection: close header before tearing the socket down,
        // so the client sees a real response rather than an ECONNRESET.
        if (!res.headersSent) {
          res.statusCode = 413;
          res.setHeader("Connection", "close");
          res.end();
        }
        req.destroy();
        reject(new PayloadTooLargeError());
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!aborted) resolve(Buffer.concat(chunks).toString("utf-8"));
    });
    req.on("error", (err) => {
      if (!aborted) reject(err);
    });
  });
}

function formatUrl(addr: AddressInfo | string | null, fallbackHost: string, path: string): string {
  if (addr && typeof addr === "object") {
    const host = addr.address === "::" || addr.address === "0.0.0.0" ? fallbackHost : addr.address;
    const bracketed = host.includes(":") ? `[${host}]` : host;
    return `http://${bracketed}:${addr.port}${path}`;
  }
  return `http://${fallbackHost}${path}`;
}
