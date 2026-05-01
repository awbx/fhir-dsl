import { describe, it, expect } from "vitest";
import type { McpResponse } from "@fhir-dsl/mcp";
import { dispatcher, recentAuditEvents } from "./mcp-singleton.js";

interface ToolDescriptor {
	name: string;
	description?: string;
	inputSchema?: { type: string; properties: Record<string, unknown> };
}

function parseToolsList(res: McpResponse): ToolDescriptor[] {
	if (res.error || res.result === undefined) return [];
	const result = res.result as { tools?: unknown };
	if (!Array.isArray(result.tools)) return [];
	const tools: ToolDescriptor[] = [];
	for (const item of result.tools) {
		if (typeof item !== "object" || item === null) continue;
		const t = item as Record<string, unknown>;
		if (typeof t.name !== "string") continue;
		const tool: ToolDescriptor = { name: t.name };
		if (typeof t.description === "string") tool.description = t.description;
		if (typeof t.inputSchema === "object" && t.inputSchema !== null) {
			tool.inputSchema = t.inputSchema as ToolDescriptor["inputSchema"];
		}
		tools.push(tool);
	}
	return tools;
}

describe("mcp singleton", () => {
	it("responds to tools/list with a non-empty array", async () => {
		const res = await dispatcher.handleRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
		expect(res.error).toBeUndefined();
		const tools = parseToolsList(res);
		expect(tools.length).toBeGreaterThan(0);
	});

	it("each tool has a name and an input_schema", async () => {
		const res = await dispatcher.handleRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" });
		const tools = parseToolsList(res);
		for (const tool of tools) {
			expect(tool.name.length).toBeGreaterThan(0);
			expect(tool.inputSchema).toBeDefined();
		}
	});

	it("recentAuditEvents API is stable", async () => {
		const before = recentAuditEvents().length;
		await dispatcher.handleRequest({ jsonrpc: "2.0", id: 3, method: "initialize" });
		const after = recentAuditEvents().length;
		expect(after).toBeGreaterThanOrEqual(before);
	});
});
