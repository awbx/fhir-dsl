import type { AuthProvider } from "@fhir-dsl/core";
import { refreshToken as refreshTokenRequest } from "./authorize.js";
import { SmartAuthError } from "./errors.js";
import { InMemoryTokenStore, type TokenStore, withAbsoluteExpiry } from "./token-store.js";
import type { FhirContextEntry, SmartConfiguration, StoredToken, TokenResponse } from "./types.js";

export interface SmartClientInit {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  /** Initial token set — usually the response from `exchangeCode`. */
  tokens: TokenResponse;
  /** Confidential-client secret. Public clients (PKCE-only) omit this. */
  clientSecret?: string;
  tokenStore?: TokenStore;
  /** Key the token is stored under. Defaults to `user:{clientId}`. */
  storeKey?: string;
  /** Seconds of slack before refreshing. Default 30. */
  clockSkewSec?: number;
  fetch?: typeof globalThis.fetch;
  /** Clock override for tests. */
  now?: () => number;
}

/**
 * Holds the token set issued by an App Launch flow and refreshes it on
 * demand. Implements `AuthProvider` so it can plug directly into
 * `createFhirClient({ auth })`.
 */
export class SmartClient implements AuthProvider {
  readonly #init: SmartClientInit;
  readonly #store: TokenStore;
  readonly #key: string;
  #current: StoredToken;
  #inflight: Promise<StoredToken> | undefined = undefined;

  constructor(init: SmartClientInit) {
    this.#init = init;
    this.#store = init.tokenStore ?? new InMemoryTokenStore();
    this.#key = init.storeKey ?? `user:${init.clientId}`;
    this.#current = withAbsoluteExpiry(init.tokens, this.#now());
    // Fire-and-forget: persist the initial token. Callers that need to await
    // persistence can pass a pre-warmed store.
    void this.#store.set(this.#key, this.#current);
  }

  async getAuthorization(): Promise<string> {
    const token = await this.#getToken();
    return `Bearer ${token.access_token}`;
  }

  async onUnauthorized(): Promise<void> {
    // Force a refresh on the next call if we still have a refresh token.
    this.#current = { ...this.#current, expires_at: this.#now() - 1 };
    await this.#store.set(this.#key, this.#current);
  }

  /** Patient ID from SMART launch context, if granted. */
  get patientId(): string | undefined {
    return this.#current.patient;
  }

  /** Encounter ID from SMART launch context, if granted. */
  get encounterId(): string | undefined {
    return this.#current.encounter;
  }

  /** `fhirContext` array from the token response, if present. */
  get fhirContext(): FhirContextEntry[] | undefined {
    return this.#current.fhirContext;
  }

  /** OIDC ID token when `openid`/`fhirUser` was requested. */
  get idToken(): string | undefined {
    return this.#current.id_token;
  }

  /** Current granted scope string. */
  get scope(): string {
    return this.#current.scope;
  }

  /** Immutable snapshot of the current token set. */
  get tokens(): StoredToken {
    return { ...this.#current };
  }

  async #getToken(): Promise<StoredToken> {
    if (!this.#isExpired(this.#current)) return this.#current;
    if (!this.#current.refresh_token) {
      throw new SmartAuthError("token_expired", "access token expired and no refresh_token is available");
    }
    if (!this.#inflight) {
      const p = this.#refresh().finally(() => {
        if (this.#inflight === p) this.#inflight = undefined;
      });
      this.#inflight = p;
    }
    return this.#inflight;
  }

  async #refresh(): Promise<StoredToken> {
    const fresh = await refreshTokenRequest({
      smartConfig: this.#init.smartConfig,
      clientId: this.#init.clientId,
      refreshToken: this.#current.refresh_token!,
      ...(this.#init.clientSecret != null ? { clientSecret: this.#init.clientSecret } : {}),
      ...(this.#init.fetch ? { fetch: this.#init.fetch } : {}),
    });
    // Spec: if the authorization server rotates the refresh token, use the
    // new one; otherwise reuse the previous token.
    const merged: TokenResponse = { ...this.#current, ...fresh };
    const nextRefresh = fresh.refresh_token ?? this.#current.refresh_token;
    if (nextRefresh !== undefined) merged.refresh_token = nextRefresh;
    this.#current = withAbsoluteExpiry(merged, this.#now());
    await this.#store.set(this.#key, this.#current);
    return this.#current;
  }

  #isExpired(token: StoredToken): boolean {
    if (token.expires_at == null) return false;
    const skew = (this.#init.clockSkewSec ?? 30) * 1000;
    return this.#now() + skew >= token.expires_at;
  }

  #now(): number {
    return this.#init.now?.() ?? Date.now();
  }
}
