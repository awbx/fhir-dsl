import { createFileRoute } from "@tanstack/react-router";
import { dispatchJsonRpc } from "#/server/mcp-singleton";

/**
 * POST /api/mcp — JSON-RPC entry point. Accepts a single MCP request or a
 * batched array. Mirrors the wire shape of `httpTransport()` so external MCP
 * clients can hit this endpoint directly. The dispatcher singleton is shared
 * with `/api/chat.ts`, so audit events from chatbot tool calls show up here
 * via `/api/mcp/audit`.
 */
export const Route = createFileRoute("/api/mcp")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return Response.json(
						{ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
						{ status: 400 },
					);
				}
				if (Array.isArray(body)) {
					const responses = await Promise.all(body.map((b) => dispatchJsonRpc(b)));
					return Response.json(responses);
				}
				const response = await dispatchJsonRpc(body);
				return Response.json(response);
			},
			OPTIONS: async () => {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
					},
				});
			},
		},
	},
});
