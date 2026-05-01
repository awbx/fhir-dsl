import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mutationOptions, queryOptions } from "@fhir-dsl/tanstack-query";
import { fhirpath } from "@fhir-dsl/fhirpath";
import { useState } from "react";
import { ArrowLeft, FilePenLine } from "lucide-react";
import type { Patient, Observation } from "#/fhir/r4";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { ErrorBlock } from "#/components/error-block";
import { useFhirClient } from "#/lib/use-fhir-client";

export const Route = createFileRoute("/patients/$id")({ component: PatientDetail });

function PatientDetail() {
	const { id } = Route.useParams();
	const { client } = useFhirClient();

	const patient = useQuery(queryOptions(client.read("Patient", id)));

	return (
		<div className="space-y-6">
			<Link to="/patients" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
				<ArrowLeft className="h-3.5 w-3.5" /> Back to patients
			</Link>

			{patient.isLoading ? (
				<Skeleton className="h-32 w-full" />
			) : patient.error ? (
				<ErrorBlock err={patient.error} />
			) : patient.data ? (
				<>
					<PatientHeader patient={patient.data} />
					<Tabs defaultValue="overview">
						<TabsList>
							<TabsTrigger value="overview">Overview</TabsTrigger>
							<TabsTrigger value="vitals">Vitals</TabsTrigger>
							<TabsTrigger value="conditions">Conditions</TabsTrigger>
							<TabsTrigger value="writeback">Write-back</TabsTrigger>
						</TabsList>
						<TabsContent value="overview" className="pt-4">
							<OverviewTab patient={patient.data} />
						</TabsContent>
						<TabsContent value="vitals" className="pt-4">
							<VitalsTab patientId={id} />
						</TabsContent>
						<TabsContent value="conditions" className="pt-4">
							<ConditionsTab patientId={id} />
						</TabsContent>
						<TabsContent value="writeback" className="pt-4">
							<WriteBackTab patient={patient.data} patientId={id} />
						</TabsContent>
					</Tabs>
				</>
			) : null}
		</div>
	);
}

function PatientHeader({ patient }: { patient: Patient }) {
	const name = patient.name?.[0];
	const display = name ? `${name.family ?? ""}, ${(name.given ?? []).join(" ")}` : "(no name)";
	return (
		<div className="space-y-2">
			<h1 className="text-2xl font-semibold">{display}</h1>
			<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				<Badge variant="outline">{patient.gender ?? "unknown"}</Badge>
				<span>·</span>
				<span>Born {patient.birthDate ?? "—"}</span>
				<span>·</span>
				<code className="font-mono text-xs">{patient.id}</code>
			</div>
		</div>
	);
}

function OverviewTab({ patient }: { patient: Patient }) {
	const officialGiven = fhirpath<Patient>("Patient")
		.name.where(($) => $.use.eq("official"))
		.given.evaluate(patient);

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Identifiers</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					{patient.identifier?.map((idr, i) => (
						<div key={i} className="flex items-center justify-between rounded border border-border bg-muted/30 px-3 py-2">
							<code className="font-mono text-xs text-muted-foreground">{idr.system ?? "(no system)"}</code>
							<span className="font-medium">{idr.value ?? "—"}</span>
						</div>
					)) ?? <div className="text-muted-foreground">none</div>}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Official given names</CardTitle>
					<CardDescription>
						via{" "}
						<code className="font-mono text-xs">
							fhirpath&lt;Patient&gt;("Patient").name.where($ =&gt; $.use.eq("official")).given.evaluate(p)
						</code>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{officialGiven.length === 0 ? (
						<p className="text-sm text-muted-foreground">No official-use names — fallback to first entry.</p>
					) : (
						<ul className="flex flex-wrap gap-2">
							{officialGiven.map((g, i) => (
								<li key={i}>
									<Badge>{String(g)}</Badge>
								</li>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function VitalsTab({ patientId }: { patientId: string }) {
	const { client } = useFhirClient();
	const obs = useQuery(
		queryOptions(
			client
				.search("Observation")
				.where("subject", "eq", `Patient/${patientId}`)
				.where("category", "eq", "vital-signs")
				.sort("date", "desc")
				.count(50),
		),
	);

	if (obs.isLoading) return <Skeleton className="h-64 w-full" />;
	if (obs.error) return <ErrorBlock err={obs.error} />;

	const observations = (obs.data?.data ?? []) as Observation[];
	const bp = projectBloodPressure(observations);

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Blood pressure</CardTitle>
					<CardDescription>
						Components projected via FHIRPath:{" "}
						<code className="font-mono text-xs">
							component.where($ =&gt; $.code.coding.code.eq("8480-6")).valueQuantity
						</code>
					</CardDescription>
				</CardHeader>
				<CardContent>
					{bp.length === 0 ? (
						<p className="text-sm text-muted-foreground">No BP observations on file.</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Systolic</TableHead>
									<TableHead>Diastolic</TableHead>
									<TableHead>Unit</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{bp.map((row, i) => (
									<TableRow key={i}>
										<TableCell className="text-sm text-muted-foreground">{row.date ?? "—"}</TableCell>
										<TableCell className="font-medium">{row.systolic ?? "—"}</TableCell>
										<TableCell className="font-medium">{row.diastolic ?? "—"}</TableCell>
										<TableCell className="text-muted-foreground">{row.unit ?? "—"}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">All observations</CardTitle>
					<CardDescription>{observations.length} entries · sorted by date desc</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Code</TableHead>
								<TableHead>Value</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{observations.map((o) => (
								<TableRow key={o.id}>
									<TableCell className="text-sm text-muted-foreground">{o.effectiveDateTime ?? "—"}</TableCell>
									<TableCell>
										<code className="font-mono text-xs">{o.code?.coding?.[0]?.code ?? "—"}</code>{" "}
										<span className="text-muted-foreground">{o.code?.coding?.[0]?.display ?? ""}</span>
									</TableCell>
									<TableCell>
										{o.valueQuantity
											? `${o.valueQuantity.value ?? ""} ${o.valueQuantity.unit ?? ""}`
											: o.valueString ?? "—"}
									</TableCell>
									<TableCell>
										<Badge variant="outline">{o.status}</Badge>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}

interface BPRow {
	date?: string;
	systolic?: number;
	diastolic?: number;
	unit?: string;
}

function projectBloodPressure(observations: Observation[]): BPRow[] {
	const rows: BPRow[] = [];
	for (const o of observations) {
		const components = o.component ?? [];
		const sysComponent = components.find((c) => c.code?.coding?.some((cc) => cc.code === "8480-6"));
		const diaComponent = components.find((c) => c.code?.coding?.some((cc) => cc.code === "8462-4"));
		if (sysComponent || diaComponent) {
			const row: BPRow = {};
			if (o.effectiveDateTime !== undefined) row.date = o.effectiveDateTime;
			const sys = sysComponent?.valueQuantity?.value;
			if (typeof sys === "number") row.systolic = sys;
			const dia = diaComponent?.valueQuantity?.value;
			if (typeof dia === "number") row.diastolic = dia;
			const unit = sysComponent?.valueQuantity?.unit ?? diaComponent?.valueQuantity?.unit;
			if (unit !== undefined) row.unit = unit;
			rows.push(row);
		}
	}
	return rows;
}

function ConditionsTab({ patientId }: { patientId: string }) {
	const { client } = useFhirClient();
	const q = useQuery(
		queryOptions(
			client
				.search("Condition")
				.where("subject", "eq", `Patient/${patientId}`)
				.sort("recorded-date", "desc")
				.count(50),
		),
	);

	if (q.isLoading) return <Skeleton className="h-64 w-full" />;
	if (q.error) return <ErrorBlock err={q.error} />;

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">Conditions</CardTitle>
				<CardDescription>{q.data?.total ?? q.data?.data.length ?? 0} on file</CardDescription>
			</CardHeader>
			<CardContent>
				{(q.data?.data ?? []).length === 0 ? (
					<p className="text-sm text-muted-foreground">No conditions on file.</p>
				) : (
					<ul className="space-y-2">
						{q.data?.data.map((c) => (
							<li key={c.id} className="rounded border border-border bg-muted/30 px-3 py-2">
								<div className="flex items-center gap-2">
									<Badge variant="outline">{c.clinicalStatus?.coding?.[0]?.code ?? "—"}</Badge>
									<span className="font-medium">{c.code?.coding?.[0]?.display ?? c.code?.text ?? "—"}</span>
								</div>
								<div className="mt-1 text-xs text-muted-foreground">
									recorded {c.recordedDate ?? "—"} · {c.code?.coding?.[0]?.code}
								</div>
							</li>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

function WriteBackTab({ patient, patientId }: { patient: Patient; patientId: string }) {
	const { client } = useFhirClient();
	const queryClient = useQueryClient();
	const [givenInput, setGivenInput] = useState((patient.name?.[0]?.given ?? []).join(" "));
	const [open, setOpen] = useState(false);

	const path = fhirpath<Patient>("Patient")
		.name.where(($) => $.use.eq("official"))
		.given;

	const newGiven = givenInput.split(/\s+/).filter(Boolean);
	const previewResource = path.setValue(patient, newGiven);
	const previewPatch = path.createPatch(patient, newGiven);

	const mutation = useMutation(
		mutationOptions((next: Patient & { id: string }) => client.update(next), {
			onSuccess: () => {
				void queryClient.invalidateQueries({ queryKey: ["fhir", "GET", `Patient/${patientId}`] });
				setOpen(false);
			},
		}),
	);

	function submit() {
		if (!previewResource.id) return;
		mutation.mutate(previewResource as Patient & { id: string });
	}

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="flex items-center gap-2 text-base">
					<FilePenLine className="h-4 w-4" /> Write-back: official given names
				</CardTitle>
				<CardDescription>
					Edit the official-use given name array. The new resource and the equivalent RFC 6902 JSON Patch
					are computed via{" "}
					<code className="font-mono text-xs">setValue</code> /{" "}
					<code className="font-mono text-xs">createPatch</code> against the same typed path.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="given">Given names (space-separated)</Label>
					<Input id="given" value={givenInput} onChange={(e) => setGivenInput(e.target.value)} />
				</div>

				<div className="grid gap-3 lg:grid-cols-2">
					<div className="space-y-1">
						<div className="text-xs uppercase tracking-wide text-muted-foreground">Updated resource</div>
						<pre className="max-h-64 overflow-auto rounded bg-muted/30 p-3 text-[11px]">
							{JSON.stringify({ ...previewResource, identifier: undefined }, null, 2)}
						</pre>
					</div>
					<div className="space-y-1">
						<div className="text-xs uppercase tracking-wide text-muted-foreground">RFC 6902 patch</div>
						<pre className="max-h-64 overflow-auto rounded bg-muted/30 p-3 text-[11px]">
							{JSON.stringify(previewPatch, null, 2)}
						</pre>
					</div>
				</div>

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button>Send PUT to server</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Confirm write</DialogTitle>
							<DialogDescription>
								This will PUT the modified Patient back to the FHIR server. Public HAPI may sandbox this
								or accept it depending on credentials.
							</DialogDescription>
						</DialogHeader>
						{mutation.isError ? <ErrorBlock err={mutation.error} /> : null}
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button onClick={submit} disabled={mutation.isPending}>
								{mutation.isPending ? "Saving…" : "Confirm"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
