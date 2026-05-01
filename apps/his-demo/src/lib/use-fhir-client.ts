import { useEffect, useState } from "react";
import type { SmartConfiguration } from "@fhir-dsl/smart";
import { getActiveSmartClient, getFhirClient } from "./fhir-client.js";

interface SmartSession {
	smartConfig: SmartConfiguration;
	issuer: string;
}

/**
 * Returns a memoised typed FHIR client. If a SMART session is active in
 * sessionStorage / localStorage, the client carries a `SmartClient`
 * AuthProvider that auto-refreshes on demand. Otherwise the client points at
 * the public R4 HAPI base — read-only.
 */
export function useFhirClient() {
	const [session, setSession] = useState<SmartSession | undefined>();

	useEffect(() => {
		if (typeof window === "undefined") return;
		const raw = sessionStorage.getItem("fhir-dsl:smart:active-config");
		if (raw === null) return;
		try {
			setSession(JSON.parse(raw) as SmartSession);
		} catch {
			// ignore malformed session
		}
	}, []);

	const auth = session ? getActiveSmartClient(session.smartConfig) : undefined;
	return { client: getFhirClient(auth), session, smartClient: auth };
}
