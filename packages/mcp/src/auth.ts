import type { AuthStrategy, BackendServicesAuth, PatientLaunchAuth } from "./types.js";

// Phase 8.4 — auth strategy resolvers backed by `@fhir-dsl/smart`.
//
// Both `backend-services` and `patient-launch` lazy-import smart and jose
// so bearer-only deployments don't pay for the JWT signing stack.
// `bearer` stays self-contained.

export interface AuthHeaders {
  Authorization?: string;
  [key: string]: string | undefined;
}

export interface AuthResolver {
  /** Produce the headers attached to the outbound FHIR request. */
  authorize(): Promise<AuthHeaders>;
}

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
      return createBackendServicesResolver(strategy);
    case "patient-launch":
      return createPatientLaunchResolver(strategy);
  }
}

function createBackendServicesResolver(strategy: BackendServicesAuth): AuthResolver {
  // Cache the smart provider across calls so its internal token cache
  // gets reused — without this we'd resign + refetch on every request.
  let providerPromise: Promise<{ getAuthorization(): Promise<string> }> | undefined;

  return {
    async authorize() {
      if (!providerPromise) providerPromise = buildBackendServicesProvider(strategy);
      const provider = await providerPromise;
      try {
        const header = await provider.getAuthorization();
        return { Authorization: header };
      } catch (err) {
        // Reset the cached provider so the next call retries discovery /
        // token exchange — useful when the issuer rotates keys.
        providerPromise = undefined;
        throw err;
      }
    },
  };
}

async function buildBackendServicesProvider(
  strategy: BackendServicesAuth,
): Promise<{ getAuthorization(): Promise<string> }> {
  const [smart, jose] = await Promise.all([loadSmart(), loadJose()]);
  const key = await jose.importPKCS8(strategy.privateKey, strategy.alg ?? "RS384");

  return new smart.BackendServicesAuth({
    issuer: strategy.issuer,
    clientId: strategy.clientId,
    scope: strategy.scope ?? "system/*.read",
    privateKey: key,
    alg: strategy.alg ?? "RS384",
    ...(strategy.kid ? { kid: strategy.kid } : {}),
    ...(strategy.tokenEndpoint
      ? {
          smartConfig: {
            authorization_endpoint: strategy.tokenEndpoint,
            token_endpoint: strategy.tokenEndpoint,
            capabilities: [],
            code_challenge_methods_supported: [],
          },
        }
      : {}),
  });
}

function createPatientLaunchResolver(strategy: PatientLaunchAuth): AuthResolver {
  // Refresh-token flow: cache the access token until expiry; refresh on
  // demand. The cached state stays inside the closure — one resolver
  // instance per MCP server, so the same refresh runs at most once at a
  // time (smart's exchange is idempotent enough for that).
  interface CachedToken {
    accessToken: string;
    expiresAtMs: number;
    refreshToken: string;
  }
  let cached: CachedToken | undefined;
  const now = () => Date.now();
  const SLACK_MS = 30_000;

  return {
    async authorize() {
      if (cached && cached.expiresAtMs - SLACK_MS > now()) {
        return { Authorization: `Bearer ${cached.accessToken}` };
      }
      const fresh = await fetchPatientLaunchToken(strategy, cached?.refreshToken ?? strategy.refreshToken);
      cached = fresh;
      return { Authorization: `Bearer ${fresh.accessToken}` };
    },
  };
}

async function fetchPatientLaunchToken(
  strategy: PatientLaunchAuth,
  refreshTokenValue: string,
): Promise<{ accessToken: string; refreshToken: string; expiresAtMs: number }> {
  const smart = await loadSmart();
  const tokenEndpoint =
    strategy.tokenEndpoint ?? (await smart.discoverSmartConfiguration(strategy.issuer)).token_endpoint;

  const response = await smart.refreshToken({
    smartConfig: { token_endpoint: tokenEndpoint },
    clientId: strategy.clientId,
    refreshToken: refreshTokenValue,
    ...(strategy.scope ? { scope: strategy.scope } : {}),
    ...(strategy.clientSecret ? { clientSecret: strategy.clientSecret } : {}),
  });

  const expiresAtMs = Date.now() + (response.expires_in ?? 3600) * 1000;
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? refreshTokenValue,
    expiresAtMs,
  };
}

async function loadSmart(): Promise<typeof import("@fhir-dsl/smart")> {
  try {
    return await import("@fhir-dsl/smart");
  } catch (err) {
    throw new Error(
      `@fhir-dsl/smart is required for backend-services / patient-launch auth strategies. Install it as a peer dependency. Original error: ${(err as Error).message}`,
    );
  }
}

async function loadJose(): Promise<typeof import("jose")> {
  try {
    return await import("jose");
  } catch (err) {
    throw new Error(
      `jose is required for backend-services auth (PKCS8 import). Install it as a peer dependency. Original error: ${(err as Error).message}`,
    );
  }
}
