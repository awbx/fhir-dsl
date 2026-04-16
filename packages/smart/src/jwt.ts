import { type JWK, type KeyLike, SignJWT } from "jose";

export type SupportedAlg = "RS384" | "ES384";

export interface SignClientAssertionParams {
  clientId: string;
  tokenEndpoint: string;
  privateKey: KeyLike | JWK | Uint8Array;
  alg: SupportedAlg;
  kid?: string;
  /**
   * Lifetime of the assertion in seconds. SMART v2 recommends ≤ 5 minutes.
   */
  lifetimeSec?: number;
  jti?: string;
  /** Clock source, exposed for tests. */
  now?: () => number;
}

/**
 * Sign a SMART Backend Services client-assertion JWT.
 * Claims: iss = sub = client_id, aud = token_endpoint, exp, jti.
 * @see https://hl7.org/fhir/smart-app-launch/backend-services.html#request-1
 */
export async function signClientAssertion(p: SignClientAssertionParams): Promise<string> {
  const now = Math.floor((p.now?.() ?? Date.now()) / 1000);
  const exp = now + (p.lifetimeSec ?? 300);
  const jti = p.jti ?? generateJti();
  const key = await toSigningKey(p.privateKey, p.alg);

  const header: { alg: SupportedAlg; typ: "JWT"; kid?: string } = { alg: p.alg, typ: "JWT" };
  if (p.kid) header.kid = p.kid;

  return new SignJWT({})
    .setProtectedHeader(header)
    .setIssuer(p.clientId)
    .setSubject(p.clientId)
    .setAudience(p.tokenEndpoint)
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setJti(jti)
    .sign(key);
}

async function toSigningKey(key: KeyLike | JWK | Uint8Array, alg: SupportedAlg): Promise<KeyLike | Uint8Array> {
  if (isJwk(key)) {
    const { importJWK } = await import("jose");
    return (await importJWK(key, alg)) as KeyLike;
  }
  return key;
}

function isJwk(k: unknown): k is JWK {
  return !!k && typeof k === "object" && "kty" in (k as Record<string, unknown>);
}

function generateJti(): string {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // Fallback — 128 random bits hex-encoded.
  const buf = new Uint8Array(16);
  c?.getRandomValues?.(buf);
  let s = "";
  for (const b of buf) s += b.toString(16).padStart(2, "0");
  return s;
}
