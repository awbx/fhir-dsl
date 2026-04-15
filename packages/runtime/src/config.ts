export interface FhirClientConfig {
  baseUrl: string;
  auth?: { type: "bearer" | "basic"; credentials: string } | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
}
