import type { AuditSink, Dispatcher, McpRequest, McpResponse, ResourceType, VerbCall } from "./types.js";

// Phase 8.1 — dispatcher shell. The real verb runners (read/search/etc.)
// land in 8.2 with the upstream HTTP client wired in. Right now the
// dispatcher answers `initialize`, `tools/list`, `tools/call` (with a
// stub that audits and returns an "implementation pending" payload),
// and `resources/list`. Enough for the MCP handshake plus a smoke test.

export interface DispatcherConfig {
  /** Resource types the bound IG advertises — narrows the verb surface. */
  resourceTypes: readonly ResourceType[];
  /** Whether write verbs (`create`, `update`, `patch`, `delete`) are exposed. */
  writes?: readonly Exclude<VerbCall["verb"], "read" | "vread" | "search" | "history" | "operation" | "capabilities">[];
  /** Server identity broadcast through MCP `initialize`. */
  identity: { name: string; version: string };
  /** Audit hook invoked on every verb attempt. */
  audit: AuditSink;
}

const READ_VERBS = ["read", "vread", "search", "history", "operation", "capabilities"] as const;

const PROTOCOL_VERSION = "2025-06-18";

export function createDispatcher(config: DispatcherConfig): Dispatcher {
  const writeVerbs = config.writes ?? [];
  const exposedVerbs = [...READ_VERBS, ...writeVerbs];

  return {
    async handleRequest(request: McpRequest): Promise<McpResponse> {
      switch (request.method) {
        case "initialize":
          return ok(request, {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {}, resources: {} },
            serverInfo: config.identity,
          });

        case "tools/list":
          return ok(request, { tools: listTools(exposedVerbs, config.resourceTypes) });

        case "tools/call":
          return await handleToolCall(request, config);

        case "resources/list":
          return ok(request, { resources: listResources(config.resourceTypes) });

        case "ping":
          return ok(request, {});

        default:
          return error(request, -32601, `Method not found: ${request.method}`);
      }
    },
  };
}

function listTools(
  verbs: readonly VerbCall["verb"][],
  resourceTypes: readonly ResourceType[],
): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
  const tools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> = [];
  for (const verb of verbs) {
    tools.push({
      name: `fhir.${verb}`,
      description: descriptionFor(verb),
      inputSchema: inputSchemaFor(verb, resourceTypes),
    });
  }
  return tools;
}

function descriptionFor(verb: VerbCall["verb"]): string {
  switch (verb) {
    case "read":
      return "Fetch a single FHIR resource by id.";
    case "vread":
      return "Fetch a specific historical version of a FHIR resource.";
    case "search":
      return "Search for FHIR resources matching the given parameters.";
    case "history":
      return "Return the version history of a FHIR resource.";
    case "create":
      return "Create a new FHIR resource on the upstream server.";
    case "update":
      return "Update an existing FHIR resource by id (full replace).";
    case "patch":
      return "Apply a JSON Patch to a FHIR resource by id.";
    case "delete":
      return "Delete a FHIR resource by id.";
    case "operation":
      return "Invoke a FHIR Operation (e.g. $everything).";
    case "capabilities":
      return "Return the upstream server's CapabilityStatement.";
  }
}

function inputSchemaFor(verb: VerbCall["verb"], resourceTypes: readonly ResourceType[]): Record<string, unknown> {
  const resourceTypeProp = {
    type: "string",
    enum: [...resourceTypes],
    description: "FHIR resource type",
  };
  switch (verb) {
    case "read":
    case "vread":
    case "delete":
    case "history":
      return {
        type: "object",
        required: ["resourceType", "id"],
        properties: { resourceType: resourceTypeProp, id: { type: "string" } },
      };
    case "search":
      return {
        type: "object",
        required: ["resourceType"],
        properties: {
          resourceType: resourceTypeProp,
          params: { type: "object", additionalProperties: true, description: "FHIR search params" },
        },
      };
    case "create":
    case "update":
      return {
        type: "object",
        required: ["resourceType", "params"],
        properties: { resourceType: resourceTypeProp, id: { type: "string" }, params: { type: "object" } },
      };
    case "patch":
      return {
        type: "object",
        required: ["resourceType", "id", "patch"],
        properties: { resourceType: resourceTypeProp, id: { type: "string" }, patch: {} },
      };
    case "operation":
      return {
        type: "object",
        required: ["operation"],
        properties: {
          resourceType: resourceTypeProp,
          id: { type: "string" },
          operation: { type: "string", description: "Operation name (with leading $)" },
          params: { type: "object" },
        },
      };
    case "capabilities":
      return { type: "object", properties: {} };
  }
}

function listResources(
  resourceTypes: readonly ResourceType[],
): Array<{ uri: string; name: string; description: string; mimeType: string }> {
  return resourceTypes.map((rt) => ({
    uri: `fhir://${rt}/{id}`,
    name: `${rt} (by id)`,
    description: `Fetch a ${rt} resource by id from the bound FHIR server.`,
    mimeType: "application/fhir+json",
  }));
}

async function handleToolCall(request: McpRequest, config: DispatcherConfig): Promise<McpResponse> {
  const params = request.params ?? {};
  const name = typeof params.name === "string" ? params.name : "";
  const args = (params.arguments ?? {}) as Record<string, unknown>;
  const verb = name.startsWith("fhir.") ? (name.slice(5) as VerbCall["verb"]) : null;
  if (!verb) return error(request, -32602, `Unknown tool: ${name}`);

  const call: VerbCall = {
    verb,
    resourceType: typeof args.resourceType === "string" ? args.resourceType : "",
  };
  if (typeof args.id === "string") call.id = args.id;
  if (typeof args.params === "object" && args.params !== null) {
    call.params = args.params as Record<string, unknown>;
  }
  if (args.patch !== undefined) call.patch = args.patch;
  if (typeof args.operation === "string") call.operation = args.operation;

  // Phase 8.1 placeholder — Phase 8.2 replaces this with the real
  // upstream HTTP call. We still audit the attempt so the wiring is
  // observable from day one.
  const result = {
    ok: false,
    outcome: {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "not-supported",
          diagnostics: `Verb ${verb} not yet wired (phase 8.2 work)`,
        },
      ],
    },
  };

  await config.audit.record({
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    call,
    result,
  });

  return ok(request, {
    content: [{ type: "text", text: JSON.stringify(result.outcome) }],
    isError: true,
  });
}

function ok(req: McpRequest, result: unknown): McpResponse {
  return { jsonrpc: "2.0", id: req.id ?? null, result };
}

function error(req: McpRequest, code: number, message: string): McpResponse {
  return { jsonrpc: "2.0", id: req.id ?? null, error: { code, message } };
}

function cryptoRandomId(): string {
  // Avoid pulling in Node-only `crypto` for cross-runtime support; the
  // ID space (2^53 - 1) is plenty for audit records.
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 2 ** 31).toString(36)}`;
}
