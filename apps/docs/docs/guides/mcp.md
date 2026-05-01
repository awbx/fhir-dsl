---
id: mcp
title: MCP Server (LLM bridge)
sidebar_label: MCP Server
---

# MCP Server (LLM bridge)

`@fhir-dsl/mcp` exposes a FHIR endpoint as a [Model Context Protocol](https://modelcontextprotocol.io/) tool surface, so an LLM agent can `read`, `search`, `vread`, `history`, and (opt-in) `create`/`update`/`delete` against a real FHIR server with full audit + auth.

One server === one upstream FHIR endpoint, scoped to one IG (the IG pin lives at generate time; the runtime just receives the resource-types list).

## Install

```bash
npm install @fhir-dsl/mcp
# Auth strategies that need it:
npm install @fhir-dsl/smart jose   # required only for backend-services / patient-launch auth
```

`@fhir-dsl/smart` and `jose` are optional peer dependencies — bearer-token-only deployments never load them.

## Minimal example

```ts
import { createServer, stdioTransport } from "@fhir-dsl/mcp";

const server = createServer({
  name: "us-core-mcp",
  version: "1.0.0",
  baseUrl: "https://hapi.fhir.org/baseR4",
  resourceTypes: ["Patient", "Observation", "Encounter"],
  auth: { kind: "bearer", token: process.env.FHIR_TOKEN! },
});

await server.listen(stdioTransport());
```

That's a fully functional MCP server: read-only, audited to stderr, ready to plug into Claude Desktop, Cursor, or any other MCP client.

## Transports

### `stdioTransport()`

Newline-delimited JSON over stdin/stdout. Default for CLI MCP clients (Claude Desktop, the `claude` CLI, etc.) which spawn the server as a child process.

```ts
import { stdioTransport } from "@fhir-dsl/mcp";
await server.listen(stdioTransport());
```

Options: `input` and `output` streams (defaults to `process.stdin` / `process.stdout`). The transport idles indefinitely; the host process kills it on shutdown.

### `httpTransport()`

Streamable HTTP transport for hosted deployments — POST a JSON-RPC body to a single endpoint, get a `Content-Type: application/json` response. Spec: [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http).

```ts
import { createServer, httpTransport } from "@fhir-dsl/mcp";

const transport = httpTransport({
  port: 8080,
  cors: true,
  authenticate: (req) =>
    req.headers.authorization === `Bearer ${process.env.MCP_TOKEN}`,
});

await server.listen(transport);
console.log(`MCP listening on ${transport.url()}`);
```

Options:

| Option | Default | What it does |
|---|---|---|
| `port` | `0` (ephemeral) | TCP port. Read the actual port back via `transport.url()` after `start()`. |
| `host` | `127.0.0.1` | Bind host. |
| `path` | `/mcp` | Endpoint path. |
| `cors` | `false` | Adds `Access-Control-Allow-Origin: *` and a preflight handler. |
| `authenticate` | none | `(req) => boolean \| Promise<boolean>`. Return `false` to short-circuit with `401`. |
| `maxRequestBytes` | `1 << 20` (1 MiB) | Hard cap on request body size; over-cap requests get `413`. |
| `server` | none | Pre-built `http.Server` to mount onto, instead of starting a new one. Useful when MCP shares a process with an unrelated HTTP service. |
| `sseKeepaliveMs` | `30000` | Comment-line keepalive interval for long-lived SSE streams (proxies often kill idle connections at 60 s). |

Calling `transport.url()` before `start()` throws; call it afterwards to get the resolved URL (with the actual port if you passed `0`).

#### Mounting onto an existing server

```ts
import { createServer as createHttpServer } from "node:http";
import { httpTransport } from "@fhir-dsl/mcp";

const httpServer = createHttpServer((req, res) => {
  // Your existing routes go here. The transport only handles `/mcp`.
});
httpServer.listen(8080);

const transport = httpTransport({ server: httpServer, path: "/mcp" });
await server.listen(transport);
```

When `options.server` is provided, the transport never calls `listen()` or `close()` — the caller owns the lifecycle.

#### Streamable HTTP coverage

The transport implements the full [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) shape:

- **POST `/mcp`** accepts a single JSON-RPC message or a batched array; the response is `application/json` by default, or `text/event-stream` when the client sends `Accept: text/event-stream` (one event per response, then the stream closes).
- **GET `/mcp`** opens a long-lived SSE stream for server-initiated notifications, kept alive by comment lines at `sseKeepaliveMs` intervals.
- **`stop()`** ends every in-flight SSE stream before closing the underlying `http.Server` so the process can exit cleanly.

## Auth strategies

Three pinned variants behind one `AuthStrategy` interface. Every strategy resolves an outbound HTTP header set per request, so token refresh, JWT resigning, and zero-config bearer all coexist.

```ts
// Bearer (dev / static tokens):
auth: { kind: "bearer", token: process.env.FHIR_TOKEN! }

// SMART v2 backend-services (signed JWT — RS384 or ES384):
auth: {
  kind: "backend-services",
  issuer: "https://hapi.example.org/fhir",
  clientId: "my-bot",
  privateKey: process.env.JWT_PRIVATE_KEY!,
  scope: "system/*.read",
}

// SMART v2 patient launch (refresh-token flow with auto-rotation):
auth: {
  kind: "patient-launch",
  issuer: "https://hapi.example.org/fhir",
  clientId: "my-spa",
  refreshToken: session.refreshToken,
  scope: "patient/*.read",
}
```

`@fhir-dsl/smart` is loaded lazily, so bearer-only servers never pay the `jose` cost.

## Write gating

Writes are off by default. Enable them surgically:

```ts
createServer({
  // ... base config
  writes: ["create", "update"],          // which verbs to expose
  writeResourceTypes: ["Observation"],   // narrow further to specific resources
  confirmWrites: true,                   // require {confirm: true} per call
  dryRun: false,                         // set true to short-circuit with synthetic OperationOutcome
});
```

A typical safe setup for an LLM that should only ever create observations: `writes: ["create"], writeResourceTypes: ["Observation"], confirmWrites: true`.

## Token economy

Defaults that prevent an LLM from reading 50 MB of bundle and burning your context:

| Option | Default | What it does |
|---|---|---|
| `defaultSearchCount` | `20` | Default `_count` when the LLM omits one. `0` disables. |
| `defaultReadSummary` | none | Default `_summary` for read verbs (`text`, `data`, `count`, etc.). |
| `maxResponseBytes` | `64 * 1024` | Hard cap on JSON response bytes. Oversized bodies are swapped for a `too-costly` `OperationOutcome`; the audit retains the original. `0` disables. |

## Audit

Every verb call routes through an `AuditSink` regardless of outcome. Three implementations ship:

- `JsonLogAuditSink` (default) — structured JSON to stderr.
- `MemoryAuditSink` — keep events in memory; useful for tests and integration smoke.
- `NullAuditSink` — drop events; for performance benchmarks.

```ts
import { MemoryAuditSink, createServer } from "@fhir-dsl/mcp";

const audit = new MemoryAuditSink();
const server = createServer({ /* ... */, audit });

// later in tests:
expect(audit.events.map((e) => e.call.verb)).toContain("read");
```

A custom sink is just an object with `record(event: AuditEvent): void | Promise<void>` — drop-in for Splunk, Loki, OTLP, or a `FhirAuditEventSink` writing `AuditEvent` resources back to the upstream.

## Generating a server alongside the typed client

```bash
fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir --mcp ./mcp-server
```

`./mcp-server/` gets a `server.ts` shim, `mcp.config.json` seeded with the IG's resource types, and a README. Launch it with `FHIR_BASE_URL=… node mcp-server/server.ts`.

## Or run inline (no generated types)

```bash
fhir-gen mcp https://hapi.fhir.org/baseR4 \
  --resources Patient,Observation \
  --writes create --confirm-writes \
  --auth-bearer-env FHIR_TOKEN
```
