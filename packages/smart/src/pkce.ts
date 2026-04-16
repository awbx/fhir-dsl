/**
 * PKCE (RFC 7636) helpers. SMART v2 REQUIRES the S256 code challenge method
 * and prohibits "plain", so this module only implements S256.
 *
 * Uses globalThis.crypto (WebCrypto) which is standard in Node ≥20 and browsers.
 */

const UNRESERVED = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

/**
 * Generate a cryptographically random code verifier. Default 32 bytes ⇒
 * 43-char base64url string, well within RFC 7636's 43–128 char range.
 */
export function generateCodeVerifier(bytes = 32): string {
  if (bytes < 32 || bytes > 96) {
    throw new Error("code verifier must be 32–96 random bytes");
  }
  const buf = new Uint8Array(bytes);
  getCrypto().getRandomValues(buf);
  return base64UrlEncode(buf);
}

/**
 * Compute the SHA-256 code challenge for a verifier (S256 method).
 */
export async function codeChallengeS256(verifier: string): Promise<string> {
  if (!isValidVerifier(verifier)) {
    throw new Error("invalid code_verifier: must be 43–128 unreserved URI chars");
  }
  const data = new TextEncoder().encode(verifier);
  const digest = await getCrypto().subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * Generate a cryptographically random state value with ≥122 bits of entropy
 * as recommended by SMART App Launch 2.2 §5.1.1.
 */
export function generateState(bytes = 16): string {
  const buf = new Uint8Array(bytes);
  getCrypto().getRandomValues(buf);
  return base64UrlEncode(buf);
}

function isValidVerifier(v: string): boolean {
  if (v.length < 43 || v.length > 128) return false;
  for (let i = 0; i < v.length; i++) {
    if (!UNRESERVED.includes(v[i]!)) return false;
  }
  return true;
}

function getCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) {
    throw new Error("WebCrypto (globalThis.crypto) is not available. Requires Node ≥20 or a modern browser.");
  }
  return c;
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
