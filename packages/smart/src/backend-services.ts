import type { AuthProvider } from "@fhir-dsl/core";
import type { JWK, KeyLike } from "jose";
import { postToken } from "./authorize.js";
import { discoverSmartConfiguration } from "./discovery.js";
import { type SupportedAlg, signClientAssertion } from "./jwt.js";
import { InMemoryTokenStore, type TokenStore, withAbsoluteExpiry } from "./token-store.js";
import type { SmartConfiguration, StoredToken } from "./types.js";

const CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

export interface BackendServicesConfig {
  /** FHIR base URL (used for discovery and as the audience for access tokens). */
  issuer: string;
  clientId: string;
  /** Space-separated SMART v2 system scopes (e.g. "system/Observation.rs"). */
  scope: string;
  privateKey: KeyLike | JWK | Uint8Array;
  alg: SupportedAlg;
  kid?: string;
  /** Custom `jti` generator (testing/bookkeeping). Defaults to randomUUID. */
  jti?: () => string;
  /** Bypass discovery — pass a pre-fetched SMART configuration. */
  smartConfig?: SmartConfiguration;
  tokenStore?: TokenStore;
  /** Seconds of slack before a cached token is considered expired. Default 30. */
  clockSkewSec?: number;
  /** Lifetime of the signed client assertion in seconds. Default 300 (5 min). */
  assertionLifetimeSec?: number;
  fetch?: typeof globalThis.fetch;
  /** Override clock — exposed for tests. */
  now?: () => number;
}

/**
 * Server-to-server SMART on FHIR Backend Services authentication provider.
 * Signs a short-lived `client_assertion` JWT and exchanges it for an access
 * token at the token endpoint. The returned token is cached until expiry.
 * @see https://hl7.org/fhir/smart-app-launch/backend-services.html
 */
export class BackendServicesAuth implements AuthProvider {
  readonly #cfg: BackendServicesConfig;
  readonly #store: TokenStore;
  readonly #key: string;
  #smartConfig?: SmartConfiguration;
  /** In-flight refresh promise — coalesces concurrent callers onto one HTTP round-trip. */
  #inflight: Promise<StoredToken> | undefined = undefined;

  constructor(cfg: BackendServicesConfig) {
    this.#cfg = cfg;
    this.#store = cfg.tokenStore ?? new InMemoryTokenStore();
    this.#key = `backend:${cfg.clientId}@${cfg.issuer}`;
  }

  async getAuthorization(): Promise<string> {
    const token = await this.#getToken();
    return `Bearer ${token.access_token}`;
  }

  async onUnauthorized(): Promise<void> {
    await this.#store.delete(this.#key);
  }

  async #getToken(): Promise<StoredToken> {
    const existing = await this.#store.get(this.#key);
    if (existing && !this.#isExpired(existing)) return existing;
    if (!this.#inflight) {
      const p = this.#fetchToken().finally(() => {
        if (this.#inflight === p) this.#inflight = undefined;
      });
      this.#inflight = p;
    }
    return this.#inflight;
  }

  async #fetchToken(): Promise<StoredToken> {
    const smartConfig = await this.#getSmartConfig();
    const assertion = await signClientAssertion({
      clientId: this.#cfg.clientId,
      tokenEndpoint: smartConfig.token_endpoint,
      privateKey: this.#cfg.privateKey,
      alg: this.#cfg.alg,
      ...(this.#cfg.kid != null ? { kid: this.#cfg.kid } : {}),
      ...(this.#cfg.assertionLifetimeSec != null ? { lifetimeSec: this.#cfg.assertionLifetimeSec } : {}),
      ...(this.#cfg.jti ? { jti: this.#cfg.jti() } : {}),
      ...(this.#cfg.now ? { now: this.#cfg.now } : {}),
    });

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: this.#cfg.scope,
      client_assertion_type: CLIENT_ASSERTION_TYPE,
      client_assertion: assertion,
    });

    const response = await postToken(smartConfig.token_endpoint, body, undefined, this.#cfg.clientId, this.#cfg.fetch);
    const now = this.#cfg.now?.() ?? Date.now();
    const stored = withAbsoluteExpiry(response, now);
    await this.#store.set(this.#key, stored);
    return stored;
  }

  async #getSmartConfig(): Promise<SmartConfiguration> {
    if (this.#cfg.smartConfig) return this.#cfg.smartConfig;
    this.#smartConfig ??= await discoverSmartConfiguration(
      this.#cfg.issuer,
      this.#cfg.fetch ? { fetch: this.#cfg.fetch } : undefined,
    );
    return this.#smartConfig;
  }

  #isExpired(token: StoredToken): boolean {
    if (token.expires_at == null) return false;
    const skew = (this.#cfg.clockSkewSec ?? 30) * 1000;
    const now = this.#cfg.now?.() ?? Date.now();
    return now + skew >= token.expires_at;
  }
}
