import type { AuthConfig } from "@fhir-dsl/core";

export interface FhirClientConfig {
  baseUrl: string;
  auth?: AuthConfig | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
}
