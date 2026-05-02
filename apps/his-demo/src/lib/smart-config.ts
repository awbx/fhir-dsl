/**
 * SMART-on-FHIR demo configuration. All values are public — the redirect URI,
 * client ID, and scope set are not secrets. The Anthropic API key lives only
 * on the server (see `routes/api/chat.ts`) and is never imported here.
 *
 * Smart Health IT note: their `/v/r4/fhir` endpoint is NOT a standalone-launch
 * entry point — it requires a real `launch` token issued by their launcher UI.
 * We hand users to `launcherUrl` first; the launcher then redirects to our
 * `/launch` route with `?iss=…&launch=…` populated, and our existing /launch
 * handler runs the full PKCE dance.
 */
// Resolve the public origin the SPA is served from, including any subpath
// (e.g. /fhir-dsl/demo/). Used to derive redirect URIs at runtime so the
// SMART flow works on localhost dev AND on https://awbx.github.io/fhir-dsl/demo
// without env-var juggling. Only call from client-side code (uses `window`).
function publicAppUrl(routePath: string): string {
	const base = import.meta.env.BASE_URL ?? "/";
	const path = routePath.startsWith("/") ? routePath.slice(1) : routePath;
	return `${window.location.origin}${base}${path}`;
}

export const SMART_CONFIG = {
	/** Smart Health IT's launcher app — entry point for the demo's EHR-launch flow. */
	launcherUrl:
		import.meta.env.VITE_SMART_LAUNCHER_URL ?? "https://launch.smarthealthit.org",
	/** FHIR version the launcher should simulate (must match the sandbox endpoint). */
	launcherFhirVersion: import.meta.env.VITE_SMART_LAUNCHER_FHIR_VERSION ?? "r4",
	clientId: import.meta.env.VITE_SMART_CLIENT_ID ?? "fhir-dsl-demo",
	scope:
		import.meta.env.VITE_SMART_SCOPE ??
		"launch openid fhirUser patient/*.read offline_access",
	/** Default upstream FHIR for queries after login (R4). */
	fhirBaseUrl: import.meta.env.VITE_FHIR_BASE_URL ?? "https://hapi.fhir.org/baseR4",
} as const;

/** OAuth redirect_uri — derived at call-site so it tracks the deployment URL. */
export function getRedirectUri(): string {
	return import.meta.env.VITE_SMART_REDIRECT_URI ?? publicAppUrl("callback");
}

/** EHR-launch entry point — where the launcher hands us back. */
export function getAppLaunchUrl(): string {
	return import.meta.env.VITE_SMART_APP_LAUNCH_URL ?? publicAppUrl("launch");
}

export const TOKEN_STORE_KEY = `user:${SMART_CONFIG.clientId}`;

/** Build the URL the "Login with SMART" button should point at. */
export function buildLauncherEntryUrl(): string {
	const params = new URLSearchParams({
		launch_url: getAppLaunchUrl(),
		fhir_version: SMART_CONFIG.launcherFhirVersion,
	});
	return `${SMART_CONFIG.launcherUrl}/?${params.toString()}`;
}
