import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
	buildAuthorizeUrl,
	codeChallengeS256,
	discoverSmartConfiguration,
	generateCodeVerifier,
	generateState,
} from "@fhir-dsl/smart";
import { SMART_CONFIG, buildLauncherEntryUrl, getRedirectUri } from "#/lib/smart-config";
import { formatError } from "#/lib/error-toast";

interface LaunchSearch {
	iss?: string;
	launch?: string;
}

export const Route = createFileRoute("/launch")({
	validateSearch: (search: Record<string, unknown>): LaunchSearch => ({
		iss: typeof search.iss === "string" ? search.iss : undefined,
		launch: typeof search.launch === "string" ? search.launch : undefined,
	}),
	component: LaunchPage,
});

function LaunchPage() {
	const { iss, launch } = Route.useSearch();
	const [error, setError] = useState<string | undefined>();
	const [step, setStep] = useState("checking launch context…");

	useEffect(() => {
		// EHR-launch contract: the launcher MUST hand us an `iss` (and usually a
		// `launch` token). If we got here cold (e.g. someone bookmarked /launch),
		// hop to the SHI launcher so the user lands here properly.
		if (!iss) {
			setStep("no iss in URL — redirecting to the SMART launcher…");
			window.location.href = buildLauncherEntryUrl();
			return;
		}
		(async () => {
			try {
				setStep("discovering smart-configuration…");
				const smartConfig = await discoverSmartConfiguration(iss);

				setStep("generating PKCE verifier + state…");
				const codeVerifier = generateCodeVerifier();
				const state = generateState();
				const codeChallenge = await codeChallengeS256(codeVerifier);

				sessionStorage.setItem(
					"fhir-dsl:smart:pending",
					JSON.stringify({ codeVerifier, state, smartConfig, issuer: iss }),
				);

				setStep("redirecting to authorize endpoint…");
				const authorizeUrl = buildAuthorizeUrl({
					smartConfig,
					clientId: SMART_CONFIG.clientId,
					redirectUri: getRedirectUri(),
					scope: SMART_CONFIG.scope,
					state,
					codeChallenge,
					aud: iss,
					...(launch ? { launch } : {}),
				});
				window.location.href = authorizeUrl;
			} catch (err) {
				const f = formatError(err);
				setError(`${f.title}: ${f.description}`);
			}
		})();
	}, [iss, launch]);

	return (
		<div className="mx-auto max-w-md space-y-4 rounded-lg border border-border p-6">
			<h1 className="text-xl font-semibold">SMART login</h1>
			<p className="text-sm text-muted-foreground">{step}</p>
			{error ? (
				<div className="space-y-2 rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
					<div>{error}</div>
					<a className="block underline" href={buildLauncherEntryUrl()}>
						Restart from the launcher
					</a>
				</div>
			) : (
				<div className="h-1 w-full overflow-hidden rounded bg-muted">
					<div className="h-full w-1/3 animate-pulse rounded bg-primary" />
				</div>
			)}
			<dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs font-mono text-muted-foreground">
				<dt>iss</dt>
				<dd className="break-all">{iss ?? "(none — redirecting)"}</dd>
				<dt>launch</dt>
				<dd className="break-all">{launch ?? "(none)"}</dd>
				<dt>client_id</dt>
				<dd>{SMART_CONFIG.clientId}</dd>
				<dt>scope</dt>
				<dd className="break-all">{SMART_CONFIG.scope}</dd>
			</dl>
		</div>
	);
}
