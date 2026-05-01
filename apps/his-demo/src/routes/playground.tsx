import { createFileRoute } from "@tanstack/react-router";
import Editor from "@monaco-editor/react";
import { useMemo, useState } from "react";
import { Play, RefreshCw } from "lucide-react";
import { fhirpath } from "@fhir-dsl/fhirpath";
import { isFhirDslError } from "@fhir-dsl/utils";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Badge } from "#/components/ui/badge";
import { SAMPLES, SNIPPETS, type SampleName } from "#/lib/playground-samples";

export const Route = createFileRoute("/playground")({ component: Playground });

type RunResult =
	| { ok: true; value: unknown }
	| { ok: false; error: { kind?: string; message: string } };

type SandboxedFn = (fhirpathFn: typeof fhirpath, resource: unknown) => unknown;

function Playground() {
	const sampleNames = Object.keys(SAMPLES) as SampleName[];
	const snippetNames = Object.keys(SNIPPETS);
	const [sampleName, setSampleName] = useState<SampleName>(sampleNames[0]!);
	const [code, setCode] = useState(SNIPPETS[snippetNames[0]!]!);
	const [result, setResult] = useState<RunResult | undefined>();

	const resource = SAMPLES[sampleName];

	function run() {
		try {
			// Build a function with `fhirpath` and `resource` in scope. The cast
			// here is the boundary between user-supplied source and our typed code.
			const fn: SandboxedFn = new Function("fhirpath", "resource", `"use strict"; ${code}`) as SandboxedFn;
			const value = fn(fhirpath, resource);
			setResult({ ok: true, value });
		} catch (err) {
			if (isFhirDslError(err)) {
				setResult({ ok: false, error: { kind: err.kind, message: err.message } });
			} else {
				const message = err instanceof Error ? err.message : String(err);
				setResult({ ok: false, error: { message } });
			}
		}
	}

	const stringified = useMemo(
		() => (result?.ok ? JSON.stringify(result.value, null, 2) : ""),
		[result],
	);

	return (
		<div className="space-y-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">FHIRPath playground</h1>
				<p className="max-w-3xl text-sm text-muted-foreground">
					Write a snippet using the typed{" "}
					<code className="font-mono text-xs">fhirpath()</code> builder. We compile + evaluate it against
					the selected sample resource. Errors thrown by the evaluator (UCUM offset, missing terminology
					resolver, …) are caught with{" "}
					<code className="font-mono text-xs">isFhirDslError</code> and surfaced with their{" "}
					<code className="font-mono text-xs">kind</code>.
				</p>
			</header>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Snippets</CardTitle>
					<CardDescription>
						Click to load a curated example. Each demonstrates a different surface.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					{snippetNames.map((name) => (
						<Button
							key={name}
							variant="outline"
							size="sm"
							onClick={() => {
								setCode(SNIPPETS[name]!);
								setResult(undefined);
							}}
						>
							{name}
						</Button>
					))}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Editor</CardTitle>
						<CardDescription>
							<code className="font-mono text-xs">fhirpath</code> and{" "}
							<code className="font-mono text-xs">resource</code> are in scope. Return any value to
							display it.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="overflow-hidden rounded border border-border">
							<Editor
								height="320px"
								defaultLanguage="javascript"
								theme="vs-dark"
								value={code}
								onChange={(v) => setCode(v ?? "")}
								options={{
									minimap: { enabled: false },
									fontSize: 13,
									tabSize: 2,
									lineNumbers: "on",
									scrollBeyondLastLine: false,
								}}
							/>
						</div>
						<div className="flex items-center justify-between gap-2">
							<select
								className="rounded border border-input bg-transparent px-3 py-1.5 text-sm"
								value={sampleName}
								onChange={(e) => setSampleName(e.target.value as SampleName)}
							>
								{sampleNames.map((n) => (
									<option key={n} value={n}>
										{n}
									</option>
								))}
							</select>
							<Button onClick={run}>
								<Play className="mr-1 h-4 w-4" /> Run
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="text-base">Result</CardTitle>
								<CardDescription>
									{result?.ok === true ? (
										<Badge>ok</Badge>
									) : result?.ok === false ? (
										<Badge variant="destructive">{result.error?.kind ?? "error"}</Badge>
									) : (
										<span>run a snippet</span>
									)}
								</CardDescription>
							</div>
							<Button variant="ghost" size="sm" onClick={() => setResult(undefined)}>
								<RefreshCw className="h-3.5 w-3.5" />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						{result === undefined ? (
							<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
								— no run yet —
							</div>
						) : result.ok ? (
							<pre className="max-h-[320px] overflow-auto rounded bg-muted/30 p-3 text-[11px]">
								{stringified}
							</pre>
						) : (
							<div className="space-y-2 rounded border border-destructive/30 bg-destructive/5 p-3 text-sm">
								<div className="font-medium text-destructive">
									{result.error?.kind ?? "Error"}
								</div>
								<div className="text-muted-foreground">{result.error?.message}</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Selected sample</CardTitle>
					<CardDescription>
						Read-only view of the resource currently piped into <code className="font-mono text-xs">resource</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="json">
						<TabsList>
							<TabsTrigger value="json">JSON</TabsTrigger>
							<TabsTrigger value="meta">Meta</TabsTrigger>
						</TabsList>
						<TabsContent value="json">
							<pre className="max-h-80 overflow-auto rounded bg-muted/30 p-3 text-[11px]">
								{JSON.stringify(resource, null, 2)}
							</pre>
						</TabsContent>
						<TabsContent value="meta">
							<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
								<dt className="text-muted-foreground">resourceType</dt>
								<dd className="font-mono">{resource.resourceType}</dd>
								<dt className="text-muted-foreground">id</dt>
								<dd className="font-mono">{resource.id ?? "—"}</dd>
								<dt className="text-muted-foreground">profile</dt>
								<dd className="font-mono break-all">
									{(resource.meta?.profile ?? []).join(", ") || "(none)"}
								</dd>
							</dl>
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
