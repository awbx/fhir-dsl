import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { runChat, type ChatTurn } from "#/server/claude";

const ChatRequestSchema = z.object({
	messages: z.array(
		z.object({
			role: z.union([z.literal("user"), z.literal("assistant")]),
			content: z.string().min(1).max(8_000),
		}),
	),
});

export const Route = createFileRoute("/api/chat")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let body: unknown;
				try {
					body = await request.json();
				} catch {
					return Response.json({ error: "invalid JSON" }, { status: 400 });
				}
				const parsed = ChatRequestSchema.safeParse(body);
				if (!parsed.success) {
					return Response.json({ error: "invalid request shape", issues: parsed.error.issues }, { status: 400 });
				}
				try {
					const result = await runChat(parsed.data.messages as ChatTurn[]);
					return Response.json(result);
				} catch (err) {
					const e = err as Error;
					return Response.json({ error: e.message ?? "unexpected error" }, { status: 500 });
				}
			},
		},
	},
});
