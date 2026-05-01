# @fhir-dsl/mcp

[Model Context Protocol](https://modelcontextprotocol.io/) bridge — exposes a FHIR endpoint as an MCP tool surface so an LLM agent can `read`, `vread`, `search`, `history`, and (opt-in) `create` / `update` / `patch` / `delete` against a real FHIR server with full audit + auth.

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

Read-only by default; opt into writes with `writes: ["create", "update"]` plus optional `writeResourceTypes` / `confirmWrites` / `dryRun` guards.

## Transports

- **`stdioTransport()`** — newline-delimited JSON over stdin/stdout. Default for CLI MCP clients (Claude Desktop, the `claude` CLI, …) which spawn the server as a child process.
- **`httpTransport({ port, cors?, authenticate?, maxRequestBytes?, server?, sseKeepaliveMs? })`** — full [Streamable HTTP](https://modelcontextprotocol.io/docs/concepts/transports#streamable-http) implementation: POST `/mcp` accepts a single JSON-RPC body or a batched array; the response is `application/json` by default or `text/event-stream` when the client sends `Accept: text/event-stream`. GET `/mcp` opens a long-lived SSE stream for server-initiated notifications, kept alive at `sseKeepaliveMs` intervals (default 30 s). `server` mounts the transport onto a caller-owned `http.Server` instead of starting a new one.

## Auth strategies

Three pinned variants behind one `AuthStrategy` interface — every strategy resolves an outbound HTTP header set per request, so token refresh, JWT resigning, and zero-config bearer all coexist:

```ts
auth: { kind: "bearer", token: process.env.FHIR_TOKEN! }

auth: {
  kind: "backend-services",
  issuer: "https://hapi.example.org/fhir",
  clientId: "my-bot",
  privateKey: process.env.JWT_PRIVATE_KEY!,
  scope: "system/*.read",
}

auth: {
  kind: "patient-launch",
  issuer: "https://hapi.example.org/fhir",
  clientId: "my-spa",
  refreshToken: session.refreshToken,
  scope: "patient/*.read",
}
```

`@fhir-dsl/smart` is loaded lazily, so bearer-only servers never pay the `jose` cost.

## Verb surface

Ten generic verbs typed by `resourceType` discriminated union: `read`, `vread`, `search`, `history`, `create`, `update`, `patch`, `delete`, `operation`, `capabilities`. The MCP `resources/read` URI scheme is `fhir://<ResourceType>/{id}` (and `_history/<versionId>` for vread).

## Token economy

Defaults that prevent an LLM from reading 50 MB of bundle and burning your context:

- `defaultSearchCount` (default `20`) — default `_count` when the LLM omits one.
- `defaultReadSummary` — default `_summary` for read verbs (`text`, `data`, `count`, …).
- `maxResponseBytes` (default `64 * 1024`) — hard cap on JSON response bytes; oversized bodies are swapped for a `too-costly` `OperationOutcome` (the audit retains the original).

## Audit

Every verb call routes through an `AuditSink` regardless of outcome. Three implementations ship: `JsonLogAuditSink` (default — structured JSON to stderr), `MemoryAuditSink` (keep events in memory; useful for tests), `NullAuditSink` (drop events; performance benchmarks). A custom sink is just an object with `record(event: AuditEvent): void | Promise<void>` — drop-in for Splunk, Loki, OTLP, or a `FhirAuditEventSink` writing `AuditEvent` resources back to the upstream.

## Generating a server alongside the typed client

```bash
fhir-gen generate --version r4 --ig hl7.fhir.us.core@6.1.0 \
  --out ./src/fhir --mcp ./mcp-server
```

`./mcp-server/` gets a `server.ts` shim, `mcp.config.json` seeded with the IG's resource types, and a README. Launch with `FHIR_BASE_URL=… node mcp-server/server.ts`.

Or run inline (no generated types):

```bash
fhir-gen mcp https://hapi.fhir.org/baseR4 \
  --resources Patient,Observation \
  --writes create --confirm-writes \
  --auth-bearer-env FHIR_TOKEN
```

## Documentation

Full guide: [MCP Server](https://awbx.github.io/fhir-dsl/docs/guides/mcp)

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
