import { JsonLogAuditSink } from "./audit.js";
import { createAuthResolver } from "./auth.js";
import { createDispatcher, type DispatcherConfig } from "./dispatcher.js";
import type { AuditSink, AuthStrategy, McpServer, ResourceType, Transport, VerbCall } from "./types.js";
import { FhirUpstream } from "./upstream.js";

// Phase 8.1 — `createServer(config)` is the user-facing entry point.
// One server === one upstream FHIR endpoint, scoped to one IG (the IG
// pin lives at generate time; here we just receive the resourceTypes
// list).

export interface ServerConfig {
  /** Identifier broadcast through MCP `initialize`. */
  name?: string;
  /** Server version reported alongside the name. */
  version?: string;
  /** Upstream FHIR server base URL (e.g. https://hapi.fhir.org/baseR4). */
  baseUrl: string;
  /** Resource types exposed as tool surface — typically narrowed by the IG. */
  resourceTypes: readonly ResourceType[];
  /** Auth strategy for outbound calls (Phase 8.2 wires it in). */
  auth?: AuthStrategy;
  /** Audit sink — defaults to JSON-on-stderr. */
  audit?: AuditSink;
  /** Whitelist of write verbs to expose. Empty (default) = read-only. */
  writes?: readonly Exclude<VerbCall["verb"], "read" | "vread" | "search" | "history" | "operation" | "capabilities">[];
  /** Override the global `fetch` — handy for tests and custom transports. */
  fetch?: typeof globalThis.fetch;
}

export function createServer(config: ServerConfig): McpServer {
  const auth = createAuthResolver(config.auth);
  const upstream = new FhirUpstream({
    baseUrl: config.baseUrl,
    auth,
    ...(config.fetch ? { fetch: config.fetch } : {}),
  });

  const dispatcherConfig: DispatcherConfig = {
    resourceTypes: config.resourceTypes,
    identity: {
      name: config.name ?? "fhir-dsl-mcp",
      version: config.version ?? "0.0.0",
    },
    audit: config.audit ?? new JsonLogAuditSink(),
    upstream,
  };
  if (config.writes) dispatcherConfig.writes = config.writes;
  const dispatcher = createDispatcher(dispatcherConfig);

  return {
    dispatcher,
    async listen(transport: Transport) {
      await transport.start(dispatcher);
    },
  };
}
