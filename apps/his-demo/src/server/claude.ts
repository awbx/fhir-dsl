import Anthropic from "@anthropic-ai/sdk";
import type { McpResponse } from "@fhir-dsl/mcp";
import { dispatcher } from "./mcp-singleton.js";

export interface ChatTurn {
	role: "user" | "assistant";
	content: string;
}

interface AnthropicTool {
	name: string;
	description: string;
	input_schema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
}

interface McpToolDescriptor {
	name: string;
	description?: string;
	inputSchema?: AnthropicTool["input_schema"];
}

interface ToolCallTrace {
	name: string;
	arguments: Record<string, unknown>;
	result: unknown;
}

let cachedTools: AnthropicTool[] | undefined;
let cachedClient: Anthropic | undefined;

function getClient(): Anthropic {
	if (cachedClient) return cachedClient;
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set on the server");
	cachedClient = new Anthropic({ apiKey });
	return cachedClient;
}

/** Parse the dispatcher's `tools/list` response — narrows a typed `McpResponse` once at the boundary. */
function parseToolsList(res: McpResponse): McpToolDescriptor[] {
	if (res.error || res.result === undefined) return [];
	const result = res.result as { tools?: unknown };
	if (!Array.isArray(result.tools)) return [];
	const tools: McpToolDescriptor[] = [];
	for (const item of result.tools) {
		if (typeof item !== "object" || item === null) continue;
		const t = item as Record<string, unknown>;
		if (typeof t.name !== "string") continue;
		const tool: McpToolDescriptor = { name: t.name };
		if (typeof t.description === "string") tool.description = t.description;
		if (typeof t.inputSchema === "object" && t.inputSchema !== null) {
			tool.inputSchema = t.inputSchema as AnthropicTool["input_schema"];
		}
		tools.push(tool);
	}
	return tools;
}

async function listTools(): Promise<AnthropicTool[]> {
	if (cachedTools) return cachedTools;
	const res = await dispatcher.handleRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
	cachedTools = parseToolsList(res).map(
		(t): AnthropicTool => ({
			name: t.name,
			description: t.description ?? "",
			input_schema: t.inputSchema ?? { type: "object", properties: {} },
		}),
	);
	return cachedTools;
}

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
	const res = await dispatcher.handleRequest({
		jsonrpc: "2.0",
		id: Date.now(),
		method: "tools/call",
		params: { name, arguments: args },
	});
	if (res.error) return { isError: true, error: res.error };
	return res.result;
}

const SYSTEM_PROMPT = `You are a clinical assistant inside Caduceus, a fhir-dsl HIS demo.
You can query a FHIR R4 server via MCP tools (read, search, history, …). Always cite the
resource id when you reference one. When asked to find or list resources, use the search
tool with a small \`_count\` (default 10). Keep replies concise — under 150 words unless
the user explicitly asks for detail.`;

export interface ChatResult {
	text: string;
	toolCalls: ToolCallTrace[];
}

export async function runChat(messages: ChatTurn[]): Promise<ChatResult> {
	const client = getClient();
	const tools = await listTools();

	const conversation: Anthropic.MessageParam[] = messages.map((m) => ({
		role: m.role,
		content: m.content,
	}));
	const recordedToolCalls: ToolCallTrace[] = [];

	for (let step = 0; step < 8; step++) {
		const response = await client.messages.create({
			model: "claude-sonnet-4-5",
			max_tokens: 1024,
			system: SYSTEM_PROMPT,
			tools: tools.length ? tools : undefined,
			messages: conversation,
		});

		const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
		if (toolUses.length === 0) {
			const text = response.content
				.filter((b): b is Anthropic.TextBlock => b.type === "text")
				.map((b) => b.text)
				.join("\n");
			return { text, toolCalls: recordedToolCalls };
		}

		conversation.push({ role: "assistant", content: response.content });

		const toolResults: Anthropic.ToolResultBlockParam[] = [];
		for (const tu of toolUses) {
			const args = (tu.input as Record<string, unknown> | null) ?? {};
			const result = await callTool(tu.name, args);
			recordedToolCalls.push({ name: tu.name, arguments: args, result });
			const isError = typeof result === "object" && result !== null && (result as { isError?: boolean }).isError === true;
			toolResults.push({
				type: "tool_result",
				tool_use_id: tu.id,
				content: JSON.stringify(result).slice(0, 16_000),
				is_error: isError,
			});
		}
		conversation.push({ role: "user", content: toolResults });
	}

	return {
		text: "(reached the 8-step tool-use limit without a final answer — try a tighter question)",
		toolCalls: recordedToolCalls,
	};
}
