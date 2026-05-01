import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";
import type { Dispatcher, McpRequest, McpResponse, Transport } from "../types.js";

// Streamable HTTP transport for MCP. Spec:
//   https://modelcontextprotocol.io/docs/concepts/transports#streamable-http
//
// Surface:
//   - POST /mcp accepts a single JSON-RPC body or a batched array; returns
//     either application/json (default) or text/event-stream when the client
//     asks for it via the Accept header.
//   - GET /mcp opens an SSE stream for server-initiated notifications. The
//     dispatcher today only emits responses to POSTed requests, so the GET
//     stream is keepalive-only at the moment — the framing is in place so
//     adding producers later isn't an observable change.
//   - Optional CORS for browser-hosted clients.
//   - Optional authenticate hook — return false to short-circuit with 401.
//   - The transport binds its own http.Server unless caller provides one.

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
   * Interval (ms) for keepalive comments on long-lived SSE streams. Keeps
   * intermediaries from idling the connection out. Default 30s; 0 disables.
   */
  sseKeepaliveMs?: number;
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
const DEFAULT_SSE_KEEPALIVE_MS = 30_000;

export function httpTransport(options: HttpTransportOptions = {}): HttpTransport {
  const path = options.path ?? "/mcp";
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 0;
  const cors = options.cors === true;
  const maxBytes = options.maxRequestBytes ?? DEFAULT_MAX_BYTES;
  const keepaliveMs = options.sseKeepaliveMs ?? DEFAULT_SSE_KEEPALIVE_MS;
  const ownsServer = !options.server;
  const server = options.server ?? createServer();

  let listening = false;
  let resolvedUrl: string | undefined;
  // Track active SSE streams so stop() can release them cleanly.
  const sseStreams = new Set<ServerResponse>();

  const transport: HttpTransport = {
    async start(dispatcher: Dispatcher) {
      const handler = makeRequestHandler({
        dispatcher,
        path,
        cors,
        maxBytes,
        keepaliveMs,
        authenticate: options.authenticate,
        sseStreams,
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
      // Close any in-flight SSE streams first — otherwise server.close()
      // hangs waiting for them.
      for (const res of sseStreams) {
        try {
          res.end();
        } catch {
          /* ignore */
        }
      }
      sseStreams.clear();
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
  keepaliveMs: number;
  authenticate?: HttpTransportOptions["authenticate"];
  sseStreams: Set<ServerResponse>;
}

function makeRequestHandler(cfg: HandlerConfig): (req: IncomingMessage, res: ServerResponse) => void {
  return (req, res) => {
    void handleRequest(req, res, cfg);
  };
}

async function handleRequest(req: IncomingMessage, res: ServerResponse, cfg: HandlerConfig): Promise<void> {
  if (cfg.cors) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Mcp-Session-Id");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

  if (req.method === "GET") {
    // Spec: GET on the streamable HTTP endpoint opens an SSE stream for
    // server-initiated notifications. Auth applies here too.
    if (cfg.authenticate) {
      const ok = await cfg.authenticate(req);
      if (!ok) {
        res.statusCode = 401;
        res.end();
        return;
      }
    }
    openServerStream(res, cfg);
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, POST, OPTIONS");
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    sendJsonRpc(res, req, cfg, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error: invalid JSON" },
    });
    return;
  }

  // §Streamable HTTP: client may POST a single message or a batched array.
  const requests = Array.isArray(parsed) ? (parsed as unknown[]) : [parsed];

  if (Array.isArray(parsed) && requests.length === 0) {
    // Empty array is malformed per JSON-RPC §2.7.
    sendJsonRpc(res, req, cfg, {
      jsonrpc: "2.0",
      id: null,
      error: { code: -32600, message: "Invalid request: empty batch" },
    });
    return;
  }

  const responses: McpResponse[] = [];
  for (const item of requests) {
    responses.push(await dispatchOne(item, cfg.dispatcher));
  }

  if (Array.isArray(parsed)) {
    sendJsonRpc(res, req, cfg, responses);
  } else {
    sendJsonRpc(res, req, cfg, responses[0] ?? { jsonrpc: "2.0", id: null });
  }
}

async function dispatchOne(raw: unknown, dispatcher: Dispatcher): Promise<McpResponse> {
  if (
    raw == null ||
    typeof raw !== "object" ||
    (raw as McpRequest).jsonrpc !== "2.0" ||
    typeof (raw as McpRequest).method !== "string"
  ) {
    return {
      jsonrpc: "2.0",
      id: (raw as { id?: McpResponse["id"] } | null)?.id ?? null,
      error: { code: -32600, message: "Invalid request" },
    };
  }
  const request = raw as McpRequest;
  try {
    return await dispatcher.handleRequest(request);
  } catch (err) {
    return {
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: { code: -32603, message: `Internal error: ${err instanceof Error ? err.message : String(err)}` },
    };
  }
}

function clientWantsSse(req: IncomingMessage): boolean {
  const accept = req.headers.accept;
  if (!accept) return false;
  return accept.split(",").some((entry) => entry.trim().toLowerCase().startsWith("text/event-stream"));
}

function sendJsonRpc(
  res: ServerResponse,
  req: IncomingMessage,
  cfg: HandlerConfig,
  response: McpResponse | McpResponse[],
): void {
  if (clientWantsSse(req)) {
    sendSseResponse(res, cfg, response);
    return;
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(response));
}

function sendSseResponse(res: ServerResponse, cfg: HandlerConfig, response: McpResponse | McpResponse[]): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  // Disable proxy buffering (nginx-friendly).
  res.setHeader("X-Accel-Buffering", "no");

  const messages = Array.isArray(response) ? response : [response];
  for (const msg of messages) {
    res.write(`event: message\ndata: ${JSON.stringify(msg)}\n\n`);
  }
  // Spec: the response stream closes after the final response to the
  // originating request is sent. The dispatcher today produces exactly one
  // reply per request, so we close immediately.
  res.end();
  cfg.sseStreams.delete(res);
}

function openServerStream(res: ServerResponse, cfg: HandlerConfig): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  // Initial connection-confirmation comment.
  res.write(": connected\n\n");

  cfg.sseStreams.add(res);

  let keepalive: NodeJS.Timeout | undefined;
  if (cfg.keepaliveMs > 0) {
    keepalive = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(keepalive);
      }
    }, cfg.keepaliveMs);
    keepalive.unref?.();
  }

  const cleanup = () => {
    if (keepalive) clearInterval(keepalive);
    cfg.sseStreams.delete(res);
  };

  res.on("close", cleanup);
  res.on("error", cleanup);
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
