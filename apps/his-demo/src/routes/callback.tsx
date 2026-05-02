import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { exchangeCode, type SmartConfiguration } from "@fhir-dsl/smart";
import { withAbsoluteExpiry } from "@fhir-dsl/smart";
import {
	SMART_CONFIG,
	TOKEN_STORE_KEY,
	buildLauncherEntryUrl,
	getRedirectUri,
} from "#/lib/smart-config";
import { tokenStore } from "#/lib/smart-store";
import { formatError } from "#/lib/error-toast";

interface CallbackSearch {
	code?: string;
	state?: string;
	error?: string;
	error_description?: string;
}

export const Route = createFileRoute("/callback")({
	validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
		code: typeof search.code === "string" ? search.code : undefined,
		state: typeof search.state === "string" ? search.state : undefined,
		error: typeof search.error === "string" ? search.error : undefined,
		error_description:
			typeof search.error_description === "string" ? search.error_description : undefined,
	}),
	component: CallbackPage,
});

function CallbackPage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const [step, setStep] = useState("validating state…");
	const [error, setError] = useState<string | undefined>();

	useEffect(() => {
		(async () => {
			try {
				if (search.error) {
					setError(`${search.error}: ${search.error_description ?? "(no description)"}`);
					return;
				}
				const code = search.code;
				const state = search.state;
				if (!code || !state) {
					setError("Missing code or state in callback URL");
					return;
				}

				const pendingRaw = sessionStorage.getItem("fhir-dsl:smart:pending");
				if (!pendingRaw) {
					setError("No pending SMART launch found in sessionStorage. Did you start at /launch?");
					return;
				}
				const pending = JSON.parse(pendingRaw) as {
					codeVerifier: string;
					state: string;
					smartConfig: SmartConfiguration;
					issuer: string;
				};
				if (pending.state !== state) {
					setError("State mismatch — possible CSRF. Restart from /.");
					return;
				}

				setStep("exchanging code for tokens…");
				const tokens = await exchangeCode({
					smartConfig: pending.smartConfig,
					clientId: SMART_CONFIG.clientId,
					redirectUri: getRedirectUri(),
					code,
					codeVerifier: pending.codeVerifier,
				});

				setStep("persisting token + launch context…");
				await tokenStore.set(TOKEN_STORE_KEY, withAbsoluteExpiry(tokens));
				sessionStorage.setItem(
					"fhir-dsl:smart:active-config",
					JSON.stringify({ smartConfig: pending.smartConfig, issuer: pending.issuer }),
				);
				sessionStorage.removeItem("fhir-dsl:smart:pending");

				setStep("redirecting to /patients…");
				await navigate({ to: "/patients" });
			} catch (err) {
				const f = formatError(err);
				setError(`${f.title}: ${f.description}`);
			}
		})();
	}, [search.code, search.state, search.error, search.error_description, navigate]);

	return (
		<div className="mx-auto max-w-md space-y-4 rounded-lg border border-border p-6">
			<h1 className="text-xl font-semibold">SMART callback</h1>
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
					<div className="h-full w-1/2 animate-pulse rounded bg-primary" />
				</div>
			)}
		</div>
	);
}
