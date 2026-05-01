import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Wand2, Sparkles, Wrench } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "#/components/ui/sheet";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { Separator } from "#/components/ui/separator";
import { Badge } from "#/components/ui/badge";
import { queryKeys } from "#/lib/query-keys";

interface ChatTurn {
	role: "user" | "assistant";
	content: string;
}

interface ToolCall {
	name: string;
	arguments: Record<string, unknown>;
	result: unknown;
}

interface AuditEvent {
	at: string;
	call: { verb: string; resourceType?: string; id?: string };
	outcome: "ok" | "error" | "denied";
	durationMs?: number;
}

interface ChatResponse {
	text: string;
	toolCalls: ToolCall[];
}

interface ChatErrorResponse {
	error: string;
}

const SUGGESTED = [
	"List 3 patients named Smith.",
	"Find the most recent BP observations for any patient.",
	"What MedicationRequest resources exist for patient 12345?",
];

export function ChatDrawer() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<ChatTurn[]>([]);
	const [input, setInput] = useState("");
	const [pending, setPending] = useState(false);
	const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);

	useEffect(() => {
		const handler = (e: Event) => {
			const target = e.target as HTMLElement | null;
			if (target?.closest("[data-chatbot-trigger]")) setOpen(true);
		};
		document.addEventListener("click", handler);
		return () => document.removeEventListener("click", handler);
	}, []);

	const audit = useQuery<{ events: AuditEvent[] }>({
		queryKey: queryKeys.mcp.audit,
		queryFn: () => fetch("/api/mcp/audit").then((r) => r.json()),
		refetchInterval: open ? 2000 : false,
		enabled: open,
	});

	async function send(text: string) {
		if (!text.trim() || pending) return;
		const next: ChatTurn[] = [...messages, { role: "user", content: text }];
		setMessages(next);
		setInput("");
		setPending(true);
		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messages: next }),
			});
			if (!res.ok) {
				const err: ChatErrorResponse = await res.json().catch(() => ({ error: "unknown" }));
				setMessages([...next, { role: "assistant", content: `_error: ${err.error}_` }]);
				return;
			}
			const data: ChatResponse = await res.json();
			setMessages([...next, { role: "assistant", content: data.text }]);
			setToolCalls(data.toolCalls);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			setMessages([...next, { role: "assistant", content: `_error: ${message}_` }]);
		} finally {
			setPending(false);
		}
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-2xl">
				<SheetHeader className="border-b">
					<SheetTitle className="flex items-center gap-2">
						<Sparkles className="h-4 w-4 text-primary" />
						Caduceus assistant
					</SheetTitle>
					<SheetDescription>
						Claude · MCP tools backed by <code className="font-mono text-xs">@fhir-dsl/mcp</code>. Audit
						events stream live from the in-process server.
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
					{messages.length === 0 ? (
						<div className="space-y-3">
							<p className="text-sm text-muted-foreground">Try one of these:</p>
							<div className="flex flex-col gap-2">
								{SUGGESTED.map((s) => (
									<button
										type="button"
										key={s}
										onClick={() => send(s)}
										className="rounded border border-border bg-muted/30 px-3 py-2 text-left text-sm hover:bg-muted"
									>
										{s}
									</button>
								))}
							</div>
						</div>
					) : null}

					{messages.map((m, i) => (
						<div key={i} className={m.role === "user" ? "ml-12" : "mr-12"}>
							<div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{m.role}
							</div>
							<div
								className={`rounded-lg p-3 text-sm ${
									m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
								}`}
							>
								{m.content}
							</div>
						</div>
					))}

					{pending ? (
						<div className="mr-12">
							<div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">assistant</div>
							<div className="rounded-lg bg-muted p-3 text-sm">
								<span className="inline-flex items-center gap-2">
									<span className="h-2 w-2 animate-pulse rounded-full bg-foreground/60" />
									thinking…
								</span>
							</div>
						</div>
					) : null}

					{toolCalls.length > 0 ? (
						<>
							<Separator />
							<div className="space-y-2">
								<div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									<Wand2 className="h-3 w-3" /> Tool calls (last turn)
								</div>
								{toolCalls.map((tc, i) => (
									<details key={i} className="rounded border border-border bg-muted/30 px-3 py-2">
										<summary className="flex cursor-pointer items-center gap-2 text-xs">
											<Wrench className="h-3 w-3" />
											<code className="font-mono">{tc.name}</code>
											<span className="text-muted-foreground">{JSON.stringify(tc.arguments).slice(0, 80)}</span>
										</summary>
										<pre className="mt-2 max-h-48 overflow-auto rounded bg-background p-2 text-[10px]">
											{JSON.stringify(tc.result, null, 2)}
										</pre>
									</details>
								))}
							</div>
						</>
					) : null}

					{audit.data?.events.length ? (
						<>
							<Separator />
							<div className="space-y-2">
								<div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
									MCP audit ({audit.data.events.length})
								</div>
								<div className="space-y-1 font-mono text-[10px]">
									{audit.data.events.slice(-8).map((e, i) => (
										<div key={i} className="flex items-center justify-between gap-2 rounded bg-muted/30 px-2 py-1">
											<span>
												<Badge variant="outline" className="text-[9px]">
													{e.outcome}
												</Badge>{" "}
												{e.call.verb} {e.call.resourceType ?? ""}
												{e.call.id ? `/${e.call.id}` : ""}
											</span>
											<span className="text-muted-foreground">{e.durationMs ?? 0}ms</span>
										</div>
									))}
								</div>
							</div>
						</>
					) : null}
				</div>

				<div className="border-t p-3">
					<div className="flex gap-2">
						<Textarea
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask Claude…"
							className="min-h-12 resize-none"
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									send(input);
								}
							}}
						/>
						<Button onClick={() => send(input)} disabled={pending}>
							<Send className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
