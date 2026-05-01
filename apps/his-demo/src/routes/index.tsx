import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Database, FlaskConical, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "#/components/ui/button";
import { buildLauncherEntryUrl } from "#/lib/smart-config";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	return (
		<div className="space-y-12">
			<section className="space-y-4">
				<div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-mono">
					<span className="h-2 w-2 rounded-full bg-emerald-500" /> demo · uses every @fhir-dsl/* package
				</div>
				<h1 className="text-4xl font-bold tracking-tight">
					A FHIR HIS in 700 lines of TypeScript.
				</h1>
				<p className="max-w-2xl text-muted-foreground">
					Caduceus is a one-screen tour of <code className="rounded bg-muted px-1.5 py-0.5">@fhir-dsl/*</code>:
					typed search builders, FHIRPath with UCUM-aware Quantity, write-back as RFC 6902, SMART-on-FHIR
					patient launch, and a Claude chatbot wired to our MCP server. Built on TanStack Start with shadcn.
				</p>
				<div className="flex flex-wrap gap-3 pt-2">
					<Button asChild size="lg">
						<a href={buildLauncherEntryUrl()}>
							Login with SMART <ArrowRight className="ml-2 h-4 w-4" />
						</a>
					</Button>
					<Button asChild variant="outline" size="lg">
						<a href="/patients">Browse without login</a>
					</Button>
					<Button asChild variant="ghost" size="lg">
						<a href="/playground">FHIRPath playground</a>
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					"Login with SMART" hands you to the Smart Health IT launcher (R4); pick a patient, then SHI
					redirects back to <code className="font-mono">/launch</code> with a real{" "}
					<code className="font-mono">launch</code> token. The HIS itself queries an R4 HAPI server — both
					code paths are typed end-to-end.
				</p>
			</section>

			<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<FeatureCard
					icon={<Database className="h-5 w-5" />}
					title="Typed search builder"
					code={`fhir.search("Patient")\n  .where("name:contains", "eq", q)\n  .include("general-practitioner")\n  .sort("birthdate", "desc")\n  .execute();`}
					href="/patients"
				/>
				<FeatureCard
					icon={<FlaskConical className="h-5 w-5" />}
					title="FHIRPath + UCUM"
					code={`fhirpath<Observation>(\"Observation\")\n  .valueQuantity\n  .where($ => $.eq({ value: 0.005, unit: \"g\" }))\n  .exists()\n  .evaluate(obs); // [true]`}
					href="/playground"
				/>
				<FeatureCard
					icon={<ShieldCheck className="h-5 w-5" />}
					title="SMART-on-FHIR"
					code={`new SmartClient({\n  smartConfig,\n  clientId,\n  tokens,\n  tokenStore,\n}); // implements AuthProvider`}
					href={buildLauncherEntryUrl()}
				/>
				<FeatureCard
					icon={<MessageSquare className="h-5 w-5" />}
					title="Claude + MCP"
					code={`createServer({\n  resourceTypes,\n  auth: smartAuth,\n  audit,\n}).listen(httpTransport({ server }));`}
					href="#"
					hint="Press the chat button"
				/>
			</section>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	code,
	href,
	hint,
}: {
	icon: React.ReactNode;
	title: string;
	code: string;
	href: string;
	hint?: string;
}) {
	return (
		<a
			href={href}
			className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition hover:border-primary/40"
		>
			<div className="flex items-center gap-2 text-sm font-medium text-foreground">
				<span className="rounded bg-primary/10 p-1.5 text-primary">{icon}</span>
				{title}
			</div>
			<pre className="overflow-x-auto rounded bg-muted/50 p-3 text-[11px] leading-snug text-muted-foreground">
				<code>{code}</code>
			</pre>
			{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
		</a>
	);
}
