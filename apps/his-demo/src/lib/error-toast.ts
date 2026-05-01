import { isFhirDslError, type FhirDslError } from "@fhir-dsl/utils";
import type {
	FhirRequestError,
	AsyncPollingTimeoutError,
	ValidationError,
	ValidationUnavailableError,
} from "@fhir-dsl/core";
import type { FhirError } from "@fhir-dsl/runtime";
import type { SmartAuthError, DiscoveryError } from "@fhir-dsl/smart";

export interface FormattedError {
	title: string;
	description: string;
	kind?: string;
	severity: "info" | "warning" | "error";
	cta?: { label: string; href: string };
}

/**
 * Discriminated union of every FhirDslError subclass we explicitly handle.
 * Anything not in this list falls through to the catch-all branch below.
 */
type KnownFhirDslError =
	| FhirRequestError
	| AsyncPollingTimeoutError
	| ValidationError
	| ValidationUnavailableError
	| FhirError
	| SmartAuthError
	| DiscoveryError;

function asKnown(err: FhirDslError): KnownFhirDslError | undefined {
	const known = new Set([
		"core.request",
		"core.async_polling_timeout",
		"core.validation",
		"core.validation_unavailable",
		"runtime.fhir",
		"smart.auth",
		"smart.discovery",
	]);
	return known.has(err.kind) ? (err as KnownFhirDslError) : undefined;
}

/**
 * Pattern-match on `FhirDslError.kind` to produce themed toast / banner content.
 * `unknown` is the appropriate boundary type here — the React Query / catch
 * channel hands us anything. We narrow with `isFhirDslError`, then with the
 * structural `kind` discriminator.
 */
export function formatError(err: unknown): FormattedError {
	if (!isFhirDslError(err)) return formatPlain(err);
	const known = asKnown(err);
	if (known === undefined) {
		return { title: err.kind, description: err.message, kind: err.kind, severity: "error" };
	}
	switch (known.kind) {
		case "core.request":
			return {
				title: `FHIR request failed (${known.context.status})`,
				description: known.context.statusText,
				kind: known.kind,
				severity: "error",
			};
		case "core.async_polling_timeout":
			return {
				title: "Async operation timed out",
				description: `Gave up after ${known.context.attempts} polls of ${known.context.statusUrl}`,
				kind: known.kind,
				severity: "warning",
			};
		case "core.validation":
			return {
				title: `${known.context.resourceType} failed validation`,
				description: known.context.issues
					.slice(0, 3)
					.map((i) => `${i.path?.join(".") ?? "(root)"}: ${i.message}`)
					.join("; "),
				kind: known.kind,
				severity: "warning",
			};
		case "core.validation_unavailable":
			return {
				title: "Validation not configured",
				description: known.message,
				kind: known.kind,
				severity: "info",
			};
		case "runtime.fhir": {
			const issue = known.context.operationOutcome?.issue?.[0];
			return {
				title: `FHIR ${known.context.status} ${known.context.statusText}`,
				description: issue?.diagnostics ?? known.context.responseText ?? known.message,
				kind: known.kind,
				severity: "error",
			};
		}
		case "smart.auth":
			return {
				title: "SMART session error",
				description: known.context.errorDescription ?? known.context.error,
				kind: known.kind,
				severity: "warning",
				cta: { label: "Sign back in", href: "/" },
			};
		case "smart.discovery":
			return {
				title: "Could not discover SMART issuer",
				description: known.message,
				kind: known.kind,
				severity: "error",
			};
	}
}

function formatPlain(err: unknown): FormattedError {
	if (err instanceof Error) {
		return { title: "Unexpected error", description: err.message, severity: "error" };
	}
	return { title: "Unexpected error", description: String(err), severity: "error" };
}
