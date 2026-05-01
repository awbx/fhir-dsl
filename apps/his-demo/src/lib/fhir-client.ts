import { createClient } from "#/fhir/r4";
import type { AuthProvider } from "@fhir-dsl/core";
import { SmartClient, type SmartConfiguration } from "@fhir-dsl/smart";
import { SMART_CONFIG, TOKEN_STORE_KEY } from "./smart-config.js";
import { tokenStore } from "./smart-store.js";

/** Resolve a SmartClient from a stored token. Returns undefined when the user is not logged in. */
export function getActiveSmartClient(smartConfig: SmartConfiguration | undefined): SmartClient | undefined {
	const stored = tokenStore.getSync(TOKEN_STORE_KEY);
	if (stored === undefined || smartConfig === undefined) return undefined;
	return new SmartClient({
		smartConfig,
		clientId: SMART_CONFIG.clientId,
		tokens: stored,
		tokenStore,
		storeKey: TOKEN_STORE_KEY,
	});
}

/**
 * Build a typed FHIR client. The auth provider is consulted per-request, so
 * `SmartClient` refresh-and-rotate happens transparently inside `.execute()`.
 *
 * When no SMART session is active, returns an unauthenticated client for the
 * R4 HAPI server (read-only — write verbs will surface a `core.request` 401).
 */
export function getFhirClient(auth?: AuthProvider) {
	return createClient({
		baseUrl: SMART_CONFIG.fhirBaseUrl,
		...(auth ? { auth } : {}),
	});
}
