export interface FhirClientConfig {
  baseUrl: string;
  auth?: {
    type: "bearer" | "basic";
    credentials: string;
  };
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
}
