import type { AuditSink, Dispatcher, McpRequest, McpResponse, ResourceType, VerbCall, VerbResult } from "./types.js";
import type { FhirUpstream } from "./upstream.js";

// Phase 8.2 — dispatcher with the upstream HTTP client wired in.
// `tools/call` resolves auth, hits the FHIR server, and audits the
// outcome. Read verbs are exposed by default; write verbs require the
// caller to opt in via `writes`.

export interface DispatcherConfig {
  /** Resource types the bound IG advertises — narrows the verb surface. */
  resourceTypes: readonly ResourceType[];
  /** Whether write verbs (`create`, `update`, `patch`, `delete`) are exposed. */
  writes?: readonly Exclude<VerbCall["verb"], "read" | "vread" | "search" | "history" | "operation" | "capabilities">[];
  /**
   * Phase 8.5 — narrow which resource types are writable. When undefined,
   * any resource in `resourceTypes` is fair game; when set, write verbs
   * are rejected for any other type. Lets you expose Patient-create to an
   * agent while keeping Observation read-only.
   */
  writeResourceTypes?: readonly ResourceType[];
  /**
   * Phase 8.5 — when true, write verbs short-circuit before hitting the
   * upstream, audit-tagged as `dryRun`, and return a synthetic
   * OperationOutcome describing what would have happened. Useful for
   * agents under evaluation, regulator review, or staging environments.
   */
  dryRun?: boolean;
  /**
   * Phase 8.5 — when true, every write call must include `confirm: true`
   * in its arguments. Missing confirmations short-circuit with a
   * required-element error, matching FHIR `OperationOutcome.code:
   * "required"`. The flag flips the burden of avoiding accidental writes
   * onto the calling LLM, which is the safe default for production.
   */
  confirmWrites?: boolean;
  /**
   * Phase 8.7 — default `_count` applied to search verbs when the caller
   * doesn't specify one. Keeps response sizes bounded; agents can still
   * pass an explicit `_count` to override. Set to 0 to disable. Default: 20.
   */
  defaultSearchCount?: number;
  /**
   * Phase 8.7 — default `_summary` applied to read verbs when the caller
   * doesn't specify one. Useful values are `text`, `data`, `count`, or
   * `false`. When undefined, no summary is added — the full resource is
   * returned.
   */
  defaultReadSummary?: "text" | "data" | "count" | "false" | "true";
  /**
   * Phase 8.7 — hard cap on the JSON-encoded response body returned via
   * MCP `tools/call` content. Above this, the response body is replaced
   * with an OperationOutcome citing the cap; the original is still
   * recorded in the audit event. Set to 0 to disable. Default: 64KB.
   */
  maxResponseBytes?: number;
  /** Server identity broadcast through MCP `initialize`. */
  identity: { name: string; version: string };
  /** Audit hook invoked on every verb attempt. */
  audit: AuditSink;
  /**
   * Upstream client. Optional only so the Phase 8.1 smoke tests still
   * pass — when omitted, every tools/call short-circuits with a
   * deferred-implementation OperationOutcome.
   */
  upstream?: FhirUpstream;
}

const WRITE_VERBS = new Set<VerbCall["verb"]>(["create", "update", "patch", "delete"]);

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

        case "resources/read":
          return await handleResourceRead(request, config);

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

interface ParsedFhirUri {
  resourceType: string;
  id: string;
  versionId?: string;
}

export function parseFhirUri(uri: string): ParsedFhirUri | null {
  // Accepts:
  //   fhir://Patient/123
  //   fhir://Patient/123/_history/4
  if (!uri.startsWith("fhir://")) return null;
  const path = uri.slice("fhir://".length);
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 2) {
    const [resourceType, id] = segments;
    if (!resourceType || !id) return null;
    return { resourceType, id };
  }
  if (segments.length === 4) {
    const [resourceType, id, history, versionId] = segments;
    if (!resourceType || !id || history !== "_history" || !versionId) return null;
    return { resourceType, id, versionId };
  }
  return null;
}

async function handleResourceRead(request: McpRequest, config: DispatcherConfig): Promise<McpResponse> {
  const params = request.params ?? {};
  const uri = typeof params.uri === "string" ? params.uri : "";
  const parsed = parseFhirUri(uri);
  if (!parsed) return error(request, -32602, `Invalid resource URI: ${uri}`);

  if (!config.resourceTypes.includes(parsed.resourceType)) {
    return error(
      request,
      -32602,
      `Resource type ${parsed.resourceType} is not in the bound IG (${config.resourceTypes.join(", ")})`,
    );
  }

  const call: VerbCall = parsed.versionId
    ? { verb: "vread", resourceType: parsed.resourceType, id: parsed.id, params: { versionId: parsed.versionId } }
    : { verb: "read", resourceType: parsed.resourceType, id: parsed.id };

  const result = config.upstream
    ? await config.upstream.run(call)
    : {
        ok: false,
        outcome: {
          resourceType: "OperationOutcome",
          issue: [{ severity: "error", code: "not-supported", diagnostics: "Server is not bound to an upstream" }],
        },
      };

  await config.audit.record({
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    call,
    result,
  });

  if (!result.ok) {
    return error(request, -32000, `Failed to read ${uri}: ${describeOutcome(result.outcome)}`);
  }

  return ok(request, {
    contents: [
      {
        uri,
        mimeType: "application/fhir+json",
        text: JSON.stringify(result.body ?? {}),
      },
    ],
  });
}

function describeOutcome(outcome: unknown): string {
  if (outcome && typeof outcome === "object" && "issue" in outcome) {
    const issues = (outcome as { issue?: Array<{ diagnostics?: string }> }).issue ?? [];
    const first = issues[0]?.diagnostics;
    if (first) return first;
  }
  return "upstream error";
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

  applyTokenEconomyDefaults(call, config);

  const gateOutcome = checkWriteGates(call, args, config);
  let result: VerbResult;
  if (gateOutcome) {
    result = { ok: false, outcome: gateOutcome };
  } else if (config.dryRun && WRITE_VERBS.has(call.verb)) {
    result = { ok: true, body: dryRunResponse(call) };
  } else if (config.upstream) {
    result = await config.upstream.run(call);
  } else {
    result = {
      ok: false,
      outcome: {
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "not-supported",
            diagnostics: "Server is not bound to an upstream — pass `baseUrl` to createServer()",
          },
        ],
      },
    };
  }

  await config.audit.record({
    id: cryptoRandomId(),
    ts: new Date().toISOString(),
    call,
    result,
    ...(config.dryRun && WRITE_VERBS.has(call.verb) ? { actor: "dry-run" } : {}),
  });

  const payload = result.ok ? result.body : result.outcome;
  const text = clampResponse(JSON.stringify(payload ?? {}), call, config);
  return ok(request, {
    content: [{ type: "text", text }],
    isError: !result.ok,
  });
}

const DEFAULT_SEARCH_COUNT = 20;
const DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024;

function applyTokenEconomyDefaults(call: VerbCall, config: DispatcherConfig): void {
  if (call.verb === "search") {
    const count = config.defaultSearchCount ?? DEFAULT_SEARCH_COUNT;
    if (count > 0) {
      call.params = call.params ?? {};
      if (call.params._count === undefined) call.params._count = count;
    }
  }
  if ((call.verb === "read" || call.verb === "vread") && config.defaultReadSummary) {
    call.params = call.params ?? {};
    if (call.params._summary === undefined) call.params._summary = config.defaultReadSummary;
  }
}

function clampResponse(text: string, call: VerbCall, config: DispatcherConfig): string {
  const max = config.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  if (max <= 0) return text;
  if (text.length <= max) return text;
  const summary = {
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "warning",
        code: "too-costly",
        diagnostics: `Response from ${call.verb} ${call.resourceType}${call.id ? `/${call.id}` : ""} exceeded ${max} bytes (${text.length} bytes); body truncated. Re-run with explicit search params or _summary to narrow.`,
      },
    ],
  };
  return JSON.stringify(summary);
}

function checkWriteGates(call: VerbCall, args: Record<string, unknown>, config: DispatcherConfig): unknown | null {
  if (!WRITE_VERBS.has(call.verb)) return null;

  if (config.writeResourceTypes && !config.writeResourceTypes.includes(call.resourceType)) {
    return {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "forbidden",
          diagnostics: `Writes to ${call.resourceType} are not permitted by this server (allowed: ${config.writeResourceTypes.join(", ") || "none"})`,
        },
      ],
    };
  }

  if (config.confirmWrites && args.confirm !== true) {
    return {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: "error",
          code: "required",
          diagnostics: `Writes require an explicit \`confirm: true\` argument (this server has confirmWrites=true)`,
        },
      ],
    };
  }

  return null;
}

function dryRunResponse(call: VerbCall): unknown {
  return {
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "information",
        code: "informational",
        diagnostics: `dry-run: would have ${call.verb}d ${call.resourceType}${call.id ? `/${call.id}` : ""} (no upstream call made)`,
      },
    ],
  };
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
