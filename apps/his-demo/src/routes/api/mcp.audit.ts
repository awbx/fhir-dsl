import { createFileRoute } from "@tanstack/react-router";
import { recentAuditEvents } from "#/server/mcp-singleton";

/**
 * GET /api/mcp/audit — surfaces the last 50 audit events from the
 * MemoryAuditSink. The chatbot UI polls this to render a tool-call timeline.
 */
export const Route = createFileRoute("/api/mcp/audit")({
	server: {
		handlers: {
			GET: async () => {
				const events = recentAuditEvents(50);
				return Response.json({ events });
			},
		},
	},
});
