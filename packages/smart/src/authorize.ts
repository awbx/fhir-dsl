import { SmartAuthError } from "./errors.js";
import type { SmartConfiguration, TokenResponse } from "./types.js";

/**
 * Parameters for the SMART App Launch authorization request.
 * @see https://hl7.org/fhir/smart-app-launch/app-launch.html#obtain-authorization-code
 */
export interface AuthorizeParams {
  smartConfig: Pick<SmartConfiguration, "authorization_endpoint">;
  clientId: string;
  redirectUri: string;
  scope: string;
  /** Opaque, ≥122 bits of entropy. Use `generateState()`. */
  state: string;
  /** S256 code challenge (base64url SHA-256 of the verifier). */
  codeChallenge: string;
  /** FHIR base URL — SMART v2 REQUIRES this parameter. */
  aud: string;
  /** EHR-launch token passed to the app by the EHR. */
  launch?: string;
  /** Additional provider-specific params (e.g. Epic's `organization`). */
  extra?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build the authorize URL. The consumer redirects the user-agent to this URL.
 */
export function buildAuthorizeUrl(p: AuthorizeParams): string {
  const url = new URL(p.smartConfig.authorization_endpoint);
  const params: Record<string, string> = {
    response_type: "code",
    client_id: p.clientId,
    redirect_uri: p.redirectUri,
    scope: p.scope,
    state: p.state,
    aud: p.aud,
    code_challenge: p.codeChallenge,
    code_challenge_method: "S256",
  };
  if (p.launch) params.launch = p.launch;
  if (p.extra) {
    for (const [k, v] of Object.entries(p.extra)) {
      if (v !== undefined && v !== null && v !== "") params[k] = String(v);
    }
  }
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

export interface ExchangeCodeParams {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
  /** Required only for confidential clients using HTTP Basic client auth. */
  clientSecret?: string;
  fetch?: typeof globalThis.fetch;
}

/**
 * Exchange an authorization code for a token set at the `token_endpoint`.
 */
export async function exchangeCode(p: ExchangeCodeParams): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: p.code,
    redirect_uri: p.redirectUri,
    code_verifier: p.codeVerifier,
    client_id: p.clientId,
  });
  return postToken(p.smartConfig.token_endpoint, body, p.clientSecret, p.clientId, p.fetch);
}

export interface RefreshTokenParams {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  refreshToken: string;
  scope?: string;
  clientSecret?: string;
  fetch?: typeof globalThis.fetch;
}

/**
 * Exchange a refresh token for a fresh access token.
 */
export async function refreshToken(p: RefreshTokenParams): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: p.refreshToken,
    client_id: p.clientId,
  });
  if (p.scope) body.set("scope", p.scope);
  return postToken(p.smartConfig.token_endpoint, body, p.clientSecret, p.clientId, p.fetch);
}

export async function postToken(
  tokenEndpoint: string,
  body: URLSearchParams,
  clientSecret: string | undefined,
  clientId: string,
  fetchArg?: typeof globalThis.fetch,
): Promise<TokenResponse> {
  const fetchFn = fetchArg ?? globalThis.fetch;
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (clientSecret) {
    const basic = encodeBasicAuth(clientId, clientSecret);
    headers.Authorization = `Basic ${basic}`;
  }

  const response = await fetchFn(tokenEndpoint, {
    method: "POST",
    headers,
    body: body.toString(),
  });

  const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const error = (payload?.error as string | undefined) ?? `http_${response.status}`;
    const desc = payload?.error_description as string | undefined;
    throw new SmartAuthError(error, desc, response.status, payload);
  }
  if (!payload || typeof payload.access_token !== "string") {
    throw new SmartAuthError("invalid_response", "token response missing access_token", response.status, payload);
  }
  return payload as unknown as TokenResponse;
}

function encodeBasicAuth(user: string, pass: string): string {
  return btoa(`${encodeURIComponent(user)}:${encodeURIComponent(pass)}`);
}
