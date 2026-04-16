import type { StoredToken, TokenResponse } from "./types.js";

export interface TokenStore {
  get(key: string): Promise<StoredToken | undefined>;
  set(key: string, value: StoredToken): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Default non-persistent store. Tokens live for the lifetime of the process.
 * Consumers wiring SMART into a long-lived server or UI should replace this
 * with an encrypted store (keychain, KMS, encrypted DB row).
 */
export class InMemoryTokenStore implements TokenStore {
  readonly #map = new Map<string, StoredToken>();

  async get(key: string): Promise<StoredToken | undefined> {
    return this.#map.get(key);
  }

  async set(key: string, value: StoredToken): Promise<void> {
    this.#map.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.#map.delete(key);
  }
}

/**
 * Convert a `TokenResponse` into a `StoredToken` with an absolute expiry
 * timestamp derived from `expires_in` (seconds) and now.
 */
export function withAbsoluteExpiry(token: TokenResponse, now: number = Date.now()): StoredToken {
  const expiresIn = token.expires_in;
  if (typeof expiresIn === "number") {
    return { ...token, expires_at: now + expiresIn * 1000 };
  }
  return { ...token };
}
