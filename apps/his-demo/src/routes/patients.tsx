import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@fhir-dsl/tanstack-query";
import { Search, User, Calendar } from "lucide-react";
import { useDeferredValue, useState } from "react";
import type { SmartClient } from "@fhir-dsl/smart";
import { Badge } from "#/components/ui/badge";
import { Input } from "#/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
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
import { SMART_CONFIG } from "#/lib/smart-config";

interface PatientsSearch {
	q?: string;
	gender?: "male" | "female" | "other" | "unknown";
	from?: string;
}

export const Route = createFileRoute("/patients")({
	validateSearch: (search: Record<string, unknown>): PatientsSearch => ({
		q: typeof search.q === "string" ? search.q : undefined,
		gender:
			search.gender === "male" || search.gender === "female" || search.gender === "other" || search.gender === "unknown"
				? search.gender
				: undefined,
		from: typeof search.from === "string" ? search.from : undefined,
	}),
	component: PatientsList,
});

function PatientsList() {
	const search = Route.useSearch();
	const navigate = Route.useNavigate();
	const { client, smartClient } = useFhirClient();
	const [qLocal, setQLocal] = useState(search.q ?? "");
	const q = useDeferredValue(qLocal);

	const builder = (() => {
		let qb = client.search("Patient").count(20).sort("birthdate", "desc");
		if (q && q.length >= 2) qb = qb.where("name", "contains", q);
		if (search.gender) qb = qb.where("gender", "eq", search.gender);
		if (search.from) qb = qb.where("birthdate", "ge", search.from);
		return qb;
	})();

	const query = useQuery(queryOptions(builder));

	return (
		<div className="space-y-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
				<p className="text-sm text-muted-foreground">
					Typed search builder against{" "}
					<code className="font-mono text-xs">{SMART_CONFIG.fhirBaseUrl}</code>. Each filter below
					auto-runs a new <code className="font-mono text-xs">.where()</code>; the wire URL is built from
					the typed param list.
				</p>
			</header>

			{smartClient ? <LaunchContextCard smartClient={smartClient} /> : null}

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<Search className="h-4 w-4" /> Filters
					</CardTitle>
					<CardDescription>
						Edits to filters update the URL via TanStack Router search params, so each result is
						bookmarkable.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-3">
					<div className="space-y-1">
						<label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="q">
							name :contains
						</label>
						<Input
							id="q"
							placeholder="Smith…"
							value={qLocal}
							onChange={(e) => {
								setQLocal(e.target.value);
								void navigate({
									search: (prev: PatientsSearch) => ({ ...prev, q: e.target.value || undefined }),
								});
							}}
						/>
					</div>
					<div className="space-y-1">
						<label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="gender">
							gender
						</label>
						<select
							id="gender"
							className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
							value={search.gender ?? ""}
							onChange={(e) =>
								void navigate({
									search: (prev: PatientsSearch) => ({
										...prev,
										gender: (e.target.value || undefined) as PatientsSearch["gender"],
									}),
								})
							}
						>
							<option value="">any</option>
							<option value="female">female</option>
							<option value="male">male</option>
							<option value="other">other</option>
							<option value="unknown">unknown</option>
						</select>
					</div>
					<div className="space-y-1">
						<label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor="from">
							birthdate ≥
						</label>
						<Input
							id="from"
							type="date"
							value={search.from ?? ""}
							onChange={(e) =>
								void navigate({
									search: (prev: PatientsSearch) => ({ ...prev, from: e.target.value || undefined }),
								})
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">Results</CardTitle>
					<CardDescription>
						{query.data?.total !== undefined
							? `${query.data.total} matching · showing ${query.data.data.length}`
							: "loading…"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{query.isLoading ? (
						<div className="space-y-2">
							{[0, 1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-10 w-full" />
							))}
						</div>
					) : query.error ? (
						<ErrorBlock err={query.error} />
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Gender</TableHead>
									<TableHead>Born</TableHead>
									<TableHead>ID</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{query.data?.data.map((p) => {
									const name = p.name?.[0];
									const display = name ? `${name.family ?? ""}, ${(name.given ?? []).join(" ")}` : "(no name)";
									return (
										<TableRow key={p.id} className="cursor-pointer">
											<TableCell className="font-medium">
												<Link to="/patients/$id" params={{ id: p.id ?? "" }} className="flex items-center gap-2">
													<User className="h-3.5 w-3.5 text-muted-foreground" />
													{display}
												</Link>
											</TableCell>
											<TableCell>
												<Badge variant="outline">{p.gender ?? "unknown"}</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground">
												<span className="flex items-center gap-1">
													<Calendar className="h-3.5 w-3.5" />
													{p.birthDate ?? "—"}
												</span>
											</TableCell>
											<TableCell>
												<code className="font-mono text-xs text-muted-foreground">{p.id}</code>
											</TableCell>
										</TableRow>
									);
								})}
								{query.data && query.data.data.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
											No matches.
										</TableCell>
									</TableRow>
								) : null}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function LaunchContextCard({ smartClient }: { smartClient: SmartClient }) {
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base">SMART launch context</CardTitle>
				<CardDescription>
					Pulled from <code className="font-mono text-xs">smartClient.patientId</code> /{" "}
					<code className="font-mono text-xs">.encounterId</code> / parsed scopes.
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2 text-sm sm:grid-cols-3">
				<KV label="patient" value={smartClient.patientId ?? "—"} />
				<KV label="encounter" value={smartClient.encounterId ?? "—"} />
				<KV label="scope" value={smartClient.scope} className="sm:col-span-3" />
			</CardContent>
		</Card>
	);
}

function KV({ label, value, className }: { label: string; value: string; className?: string }) {
	return (
		<div className={`rounded border border-border bg-muted/30 px-3 py-2 ${className ?? ""}`}>
			<div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
			<div className="font-mono text-xs break-all">{value}</div>
		</div>
	);
}
