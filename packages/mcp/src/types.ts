// Phase 8.1 — locked-design surface for `@fhir-dsl/mcp`.
//
// Per the design pinned in FHIR_COMPLIANCE_PLAN.md:
//   - ~10 generic verbs typed by discriminated union over `resourceType`
//   - read-only by default; writes opt in via `--writes <list>`
//   - all three auth strategies behind a pluggable interface from day one
//   - both stdio and Streamable HTTP transports
//   - pluggable AuditSink (default = structured JSON log)
//   - one server instance == one upstream + one IG (pinned at generate time)
//
// This file ships the *types* — concrete verb runners, transports, and
// generator wiring land in subsequent sub-phases.

export type ResourceType = string;

export type GenericVerb =
  | "read"
  | "vread"
  | "search"
  | "history"
  | "create"
  | "update"
  | "patch"
  | "delete"
  | "operation"
  | "capabilities";

/**
 * The concrete params + return shape for one verb on one resource type.
 * The generator narrows `ResourceTypeT` to a discriminated union
 * (`"Patient" | "Observation" | …`) so an LLM tool surface can describe
 * exactly which resource each call applies to.
 */
export interface VerbCall<V extends GenericVerb = GenericVerb, T extends ResourceType = ResourceType> {
  verb: V;
  resourceType: T;
  /** Resource id for `read`, `vread`, `update`, `patch`, `delete`, `history`. */
  id?: string;
  /** Search parameters for `search`; query body for `update`/`create`. */
  params?: Record<string, unknown>;
  /** JSON Patch document for `patch`. */
  patch?: unknown;
  /** Operation name for `operation` (e.g. `$everything`). */
  operation?: string;
}

export interface VerbResult<R = unknown> {
  ok: boolean;
  body?: R;
  /** When `ok` is false, an OperationOutcome-shaped error. */
  outcome?: unknown;
  /** Wall-clock latency for the upstream call, captured for audit. */
  latencyMs?: number;
}

/**
 * Auth strategies — three pinned variants. Each strategy resolves an
 * outbound HTTP header set per request, allowing token refresh, JWT
 * resigning, or zero-config bearer to coexist behind one interface.
 */
export type AuthStrategy = BackendServicesAuth | PatientLaunchAuth | BearerAuth;

export interface BackendServicesAuth {
  kind: "backend-services";
  /** Issuer URL of the FHIR server's token endpoint. */
  tokenUrl: string;
  /** Client id registered for backend-services. */
  clientId: string;
  /** PEM-encoded private key for JWT assertions (RS256/ES256). */
  privateKey: string;
  /** OAuth2 scopes; `system/*.read` is the safe default. */
  scope?: string;
}

export interface PatientLaunchAuth {
  kind: "patient-launch";
  /** Authorisation server token endpoint. */
  tokenUrl: string;
  /** Public client id from the SMART app registration. */
  clientId: string;
  /** Scopes requested for the patient session (e.g. `patient/*.read`). */
  scope?: string;
  /**
   * The current refresh token. Issuers that require PKCE-S256 are handled
   * inside `@fhir-dsl/smart`; this strategy is purely for the *runtime*
   * token-exchange step driven by an MCP request.
   */
  refreshToken: string;
}

export interface BearerAuth {
  kind: "bearer";
  /** Static bearer token (or a thunk that produces one). */
  token: string | (() => string | Promise<string>);
}

/**
 * Sink for every verb call attempt — the pluggable hook the design
 * locked. Default implementation lives in `audit.ts` and dumps
 * structured JSON to stderr; production deployments can swap in a
 * Splunk/Loki/CloudWatch writer.
 */
export interface AuditSink {
  record(event: AuditEvent): void | Promise<void>;
}

export interface AuditEvent {
  /** Stable event id (uuid). */
  id: string;
  /** Wall-clock ISO timestamp. */
  ts: string;
  /** Verb call that triggered the event. */
  call: VerbCall;
  /** Result of the call (ok or outcome). */
  result: VerbResult;
  /** Subject — who initiated the call (LLM / user / system). */
  actor?: string;
  /** Free-form correlation id propagated from MCP client. */
  correlationId?: string;
}

/**
 * Transport binding — the MCP protocol is bidirectional JSON-RPC. We
 * support stdio (default) and Streamable HTTP. The transport is a thin
 * adapter that hands incoming requests to a `Dispatcher` and writes
 * responses back.
 */
export interface Transport {
  start(dispatcher: Dispatcher): Promise<void> | void;
  stop?(): Promise<void> | void;
}

/**
 * The dispatcher shape transports talk to. We keep it deliberately
 * generic — Phase 8.2 fills in the concrete tool/resource list.
 */
export interface Dispatcher {
  handleRequest(request: McpRequest): Promise<McpResponse>;
}

export interface McpRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpResponse {
  jsonrpc: "2.0";
  id?: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * The user-facing factory result. Returned by `createServer(config)` —
 * exposes the dispatcher (for tests / programmatic use) and a
 * `listen(transport)` shorthand.
 */
export interface McpServer {
  dispatcher: Dispatcher;
  listen(transport: Transport): Promise<void>;
}
