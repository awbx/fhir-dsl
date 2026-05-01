import { createServer, MemoryAuditSink, type AuditEvent, type AuthStrategy } from "@fhir-dsl/mcp";
import type { McpRequest, McpResponse } from "@fhir-dsl/mcp";

/**
 * Server-only MCP singleton. Lives for the lifetime of the Nitro process.
 * One server === one upstream FHIR endpoint, scoped to a curated resource-types
 * list for the demo. The chatbot (`api/chat.ts`) talks to the dispatcher
 * directly; the `api/mcp.ts` route exposes the same dispatcher over HTTP for
 * external MCP clients to inspect.
 */

const audit = new MemoryAuditSink();

// Auth: read bearer from BEARER_TOKEN env var on cold start. The full SMART
// patient-launch session-cookie wiring is documented in the README — for the
// demo's chatbot path, an explicit env var keeps secrets out of cookies.
const bearerToken = process.env.FHIR_BEARER_TOKEN;
const auth: AuthStrategy | undefined = bearerToken
	? { kind: "bearer", token: bearerToken }
	: undefined;

const server = createServer({
	name: "caduceus-fhir-dsl-demo",
	version: "0.1.0",
	baseUrl: process.env.FHIR_BASE_URL ?? "https://hapi.fhir.org/baseR4",
	resourceTypes: ["Patient", "Observation", "Condition", "Encounter", "Practitioner", "MedicationRequest"],
	...(auth ? { auth } : {}),
	audit,
	defaultSearchCount: 10,
	maxResponseBytes: 32 * 1024,
});

export const dispatcher = server.dispatcher;
export const auditSink = audit;

export async function dispatchJsonRpc(raw: unknown): Promise<McpResponse> {
	const req = raw as McpRequest;
	return dispatcher.handleRequest(req);
}

export function recentAuditEvents(limit = 50): AuditEvent[] {
	const events = audit.events;
	return events.slice(Math.max(0, events.length - limit));
}
