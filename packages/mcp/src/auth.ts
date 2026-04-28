import type { AuthStrategy } from "./types.js";

// Phase 8.1 — auth strategy interface + a no-op resolver. The actual
// JWT signing for backend-services and the patient-launch refresh flow
// live in `@fhir-dsl/smart`; the MCP layer only needs to know how to
// produce outbound headers per request.

export interface AuthHeaders {
  Authorization?: string;
  [key: string]: string | undefined;
}

export interface AuthResolver {
  /** Produce the headers attached to the outbound FHIR request. */
  authorize(): Promise<AuthHeaders>;
}

/**
 * Build an auth resolver from a strategy. Backend-services and
 * patient-launch flows delegate to `@fhir-dsl/smart` (lazy-loaded so
 * users who only need bearer never pay the dependency). For now the
 * shell only implements bearer end-to-end — the other strategies throw
 * a deferred-implementation error.
 */
export function createAuthResolver(strategy: AuthStrategy | undefined): AuthResolver {
  if (!strategy) {
    return {
      async authorize() {
        return {};
      },
    };
  }
  switch (strategy.kind) {
    case "bearer":
      return {
        async authorize() {
          const tok = typeof strategy.token === "function" ? await strategy.token() : strategy.token;
          return { Authorization: `Bearer ${tok}` };
        },
      };
    case "backend-services":
    case "patient-launch":
      return {
        async authorize() {
          throw new Error(
            `${strategy.kind} auth is wired in a later phase — use bearer for now or contribute the wiring`,
          );
        },
      };
  }
}
