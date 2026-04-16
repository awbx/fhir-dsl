import { DiscoveryError } from "./errors.js";
import type { SmartConfiguration } from "./types.js";

/**
 * Fetch the SMART configuration document at
 * `{fhirBaseUrl}/.well-known/smart-configuration`.
 * @see https://hl7.org/fhir/smart-app-launch/conformance.html#using-well-known
 */
export async function discoverSmartConfiguration(
  fhirBaseUrl: string,
  opts?: { fetch?: typeof globalThis.fetch; headers?: Record<string, string> },
): Promise<SmartConfiguration> {
  const fetchFn = opts?.fetch ?? globalThis.fetch;
  const url = buildWellKnownUrl(fhirBaseUrl);

  const response = await fetchFn(url, {
    method: "GET",
    headers: { Accept: "application/json", ...opts?.headers },
  });

  if (!response.ok) {
    throw new DiscoveryError(`SMART discovery failed: ${response.status} ${response.statusText}`, url, response.status);
  }

  const config = (await response.json().catch(() => null)) as SmartConfiguration | null;
  if (!config || typeof config !== "object") {
    throw new DiscoveryError("SMART discovery returned a non-JSON body", url, response.status);
  }
  if (!config.authorization_endpoint || !config.token_endpoint) {
    throw new DiscoveryError(
      "SMART discovery document missing authorization_endpoint or token_endpoint",
      url,
      response.status,
    );
  }
  return config;
}

function buildWellKnownUrl(baseUrl: string): string {
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}/.well-known/smart-configuration`;
}
