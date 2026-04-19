---
sidebar_position: 6
title: "@fhir-dsl/smart"
description: "SMART App Launch v2 — authorize URL, S256 PKCE, Backend Services JWT assertion, scope helpers, and a refresh-aware SmartClient."
---

# @fhir-dsl/smart

## Overview
`@fhir-dsl/smart` implements SMART on FHIR v2 client flows: the App Launch authorization code flow with S256 PKCE, the Backend Services flow using a signed `client_assertion` JWT, `.well-known/smart-configuration` discovery, scope helpers (including SMART v2 parameterized scopes), and a `SmartClient` that implements `AuthProvider` so it plugs straight into `createFhirClient({ auth })`.

## Installation
```bash
npm install @fhir-dsl/smart
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `buildAuthorizeUrl` | function | Construct the authorize URL (hardcoded `code_challenge_method=S256`). |
| `AuthorizeParams` | interface | Inputs for `buildAuthorizeUrl`. |
| `exchangeCode` | function | Exchange an authorization code for a `TokenResponse`. |
| `ExchangeCodeParams` | interface | Inputs for `exchangeCode`. |
| `refreshToken` | function | Refresh an access token. |
| `RefreshTokenParams` | interface | Inputs for `refreshToken`. |
| `postToken` | function | Low-level `POST` to the token endpoint. |
| `BackendServicesAuth` | class | `AuthProvider` that signs a `client_assertion` JWT and coalesces concurrent refreshes. |
| `BackendServicesConfig` | interface | `{ issuer, clientId, scope, privateKey, alg, kid?, ... }`. |
| `discoverSmartConfiguration` | function | Fetch `.well-known/smart-configuration`. |
| `SmartConfiguration` | interface | Shape of the SMART configuration document. |
| `signClientAssertion` | function | Sign the Backend Services client-assertion JWT (RS384 / ES384). |
| `SignClientAssertionParams` | interface | Inputs for `signClientAssertion`. |
| `SupportedAlg` | type | `"RS384" | "ES384"`. |
| `generateCodeVerifier` / `codeChallengeS256` / `generateState` / `base64UrlEncode` | function | PKCE primitives. |
| `TokenResponse` / `StoredToken` | interface | Token payloads. |
| `SmartAuthError` / `DiscoveryError` | class | Flow-specific errors. |
| `OAuth2ErrorBody` | interface | `{ error, error_description?, error_uri? }`. |
| `ScopeContext` / `ScopePermission` / `ParsedResourceScope` / `ParsedLaunchScope` / `ParsedSimpleScope` / `ParsedScope` | type | Scope parsing types. |
| `openid` / `fhirUser` / `offlineAccess` / `onlineAccess` | const | Well-known scope strings. |
| `resourceScope` | function | Build a SMART v2 resource scope (optionally parameterised). |
| `launchScope` | function | Build `launch`, `launch/patient`, or `launch/encounter`. |
| `buildScopes` | function | Join scope parts with spaces, skipping falsy values. |
| `parseScope` | function | Parse a single scope string into a discriminated union. |
| `SmartClient` | class | Refresh-aware `AuthProvider` holding a token set. |
| `SmartClientInit` | interface | Inputs for `SmartClient`. |
| `TokenStore` / `InMemoryTokenStore` | interface / class | Pluggable token persistence. |
| `withAbsoluteExpiry` | function | Stamp a `StoredToken` with absolute `expires_at`. |
| `FhirContextEntry` | interface | Launch-context item from a token response. |

## API

### `buildAuthorizeUrl`
**Signature**
```ts
function buildAuthorizeUrl(p: AuthorizeParams): string;

interface AuthorizeParams {
  smartConfig: Pick<SmartConfiguration, "authorization_endpoint">;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;                                          // ≥122 bits of entropy; use generateState()
  codeChallenge: string;                                  // base64url SHA-256 of the verifier
  aud: string;                                            // FHIR base URL — REQUIRED by SMART v2
  launch?: string;                                        // EHR-launch token
  extra?: Record<string, string | number | boolean | undefined>;
}
```
**Example**
```ts
import { buildAuthorizeUrl, generateState, generateCodeVerifier, codeChallengeS256 } from "@fhir-dsl/smart";

const verifier = generateCodeVerifier();
const challenge = await codeChallengeS256(verifier);
const state = generateState();

const url = buildAuthorizeUrl({
  smartConfig: { authorization_endpoint: "https://ehr.example/authorize" },
  clientId: "app-123",
  redirectUri: "https://app.example/cb",
  scope: "launch/patient openid fhirUser patient/Observation.rs offline_access",
  state,
  codeChallenge: challenge,
  aud: "https://fhir.example/r4",
  extra: { organization: "org-42" }, // Epic/Cerner-specific pass-through
});
```

**Notes** — `code_challenge_method` is hardcoded to `S256`; `plain` is prohibited by SMART v2. Omit `launch` for standalone (non-EHR) launches.

---

### `exchangeCode` / `refreshToken` / `postToken`
**Signature**
```ts
function exchangeCode(p: ExchangeCodeParams): Promise<TokenResponse>;
function refreshToken(p: RefreshTokenParams): Promise<TokenResponse>;
function postToken(
  tokenEndpoint: string,
  body: URLSearchParams,
  clientSecret: string | undefined,
  clientId: string,
  fetchArg?: typeof globalThis.fetch,
): Promise<TokenResponse>;

interface ExchangeCodeParams {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
  clientSecret?: string;                                  // only for confidential clients
  fetch?: typeof globalThis.fetch;
}
interface RefreshTokenParams {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  refreshToken: string;
  scope?: string;
  clientSecret?: string;
  fetch?: typeof globalThis.fetch;
}
```
**Example**
```ts
import { exchangeCode } from "@fhir-dsl/smart";

const tokens = await exchangeCode({
  smartConfig,
  clientId: "app-123",
  redirectUri: "https://app.example/cb",
  code: req.query.code as string,
  codeVerifier,
});
```

---

### `BackendServicesAuth` / `BackendServicesConfig`
**Signature**
```ts
class BackendServicesAuth implements AuthProvider {
  constructor(cfg: BackendServicesConfig);
  getAuthorization(): Promise<string>;   // returns "Bearer <token>", refreshing as needed
  onUnauthorized(): Promise<void>;       // invalidates the cached token
}

interface BackendServicesConfig {
  issuer: string;                                         // FHIR base URL (audience for access tokens)
  clientId: string;
  scope: string;                                          // space-separated SMART v2 system scopes
  privateKey: KeyLike | JWK | Uint8Array;
  alg: SupportedAlg;                                      // "RS384" | "ES384"
  kid?: string;
  jti?: () => string;
  smartConfig?: SmartConfiguration;                       // bypass discovery
  tokenStore?: TokenStore;
  clockSkewSec?: number;                                  // default 30
  assertionLifetimeSec?: number;                          // default 300 (5 min)
  fetch?: typeof globalThis.fetch;
  now?: () => number;
}
```
**Example**
```ts
import { BackendServicesAuth } from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";
import privateJwk from "./keys/backend.jwk.json" with { type: "json" };

const auth = new BackendServicesAuth({
  issuer: "https://fhir.example/r4",
  clientId: "backend-app-123",
  scope: "system/Observation.rs system/Patient.rs",
  privateKey: privateJwk,
  alg: "RS384",
  kid: privateJwk.kid,
});

const fhir = createFhirClient<Schema>({ baseUrl: "https://fhir.example/r4", auth });
```

**Notes**
- Config field names are `issuer`, `privateKey`, and `kid` (not `tokenEndpoint` / `jwkPrivateKey`). The token endpoint is resolved via `discoverSmartConfiguration(issuer)` unless `smartConfig` is provided.
- `BackendServicesAuth` coalesces concurrent `getAuthorization()` callers onto a single HTTP round-trip — the `#inflight` promise is shared until it resolves.
- Private keys can be a `KeyLike` (jose's `CryptoKey`), a JWK object, or raw `Uint8Array` — not PEM. Wrap PEM with `importSPKI`/`importPKCS8` from `jose` first.

---

### `signClientAssertion`
**Signature**
```ts
function signClientAssertion(p: SignClientAssertionParams): Promise<string>;

interface SignClientAssertionParams {
  clientId: string;
  tokenEndpoint: string;
  privateKey: KeyLike | JWK | Uint8Array;
  alg: SupportedAlg;                                      // "RS384" | "ES384"
  kid?: string;
  lifetimeSec?: number;                                   // ≤ 300 per SMART v2
  jti?: string;
  now?: () => number;
}
```
**Notes** — Claims: `iss = sub = clientId`, `aud = tokenEndpoint`, `exp`, `jti`. Signed via SubtleCrypto through `jose`.

---

### `discoverSmartConfiguration`
**Signature**
```ts
function discoverSmartConfiguration(
  fhirBaseUrl: string,
  opts?: { fetch?: typeof globalThis.fetch; headers?: Record<string, string> },
): Promise<SmartConfiguration>;
```
**Example**
```ts
const smartConfig = await discoverSmartConfiguration("https://fhir.example/r4");
```
**Notes** — Throws `DiscoveryError` if the `authorization_endpoint` or `token_endpoint` is missing from the well-known document.

---

### PKCE primitives — `generateCodeVerifier`, `codeChallengeS256`, `generateState`, `base64UrlEncode`
**Signature**
```ts
function generateCodeVerifier(bytes?: number): string;   // default 32 bytes → 43-char verifier
function codeChallengeS256(verifier: string): Promise<string>;
function generateState(bytes?: number): string;          // default 16 bytes
function base64UrlEncode(bytes: Uint8Array): string;
```
**Notes** — Uses `globalThis.crypto` (WebCrypto), standard in Node ≥20 and modern browsers. SMART v2 mandates S256 and prohibits `plain`, so only `codeChallengeS256` is implemented.

---

### Scopes — `resourceScope`, `launchScope`, `buildScopes`, `parseScope`
**Signature**
```ts
type ScopeContext = "patient" | "user" | "system";
type ScopePermission = "c" | "r" | "u" | "d" | "s";

interface ResourceScopeOpts {
  context: ScopeContext;
  resource: string;
  perms: Partial<Record<ScopePermission, boolean>> | ScopePermission[] | "*";
  params?: Record<string, string | number | (string | number)[]>;
}

function resourceScope(opts: ResourceScopeOpts): string;
function launchScope(ctx?: "patient" | "encounter"): string;
function buildScopes(...parts: Array<string | false | null | undefined | string[]>): string;
function parseScope(scope: string): ParsedScope;

const openid: "openid";
const fhirUser: "fhirUser";
const offlineAccess: "offline_access";
const onlineAccess: "online_access";
```
**Parameters** — `resourceScope` takes `{ context, resource, perms }` (not `{ ctx, resource, permission }`).

**Example**
```ts
import { resourceScope, launchScope, buildScopes, openid, fhirUser, offlineAccess } from "@fhir-dsl/smart";

const scope = buildScopes(
  launchScope("patient"),
  openid, fhirUser, offlineAccess,
  resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"], params: { category: "laboratory" } }),
  // → "launch/patient openid fhirUser offline_access patient/Observation.rs?category=laboratory"
);

const sysAll = resourceScope({ context: "system", resource: "*", perms: "*" });
// → "system/*.cruds"
```

---

### `SmartClient` / `SmartClientInit` / `TokenStore` / `InMemoryTokenStore`
**Signature**
```ts
class SmartClient implements AuthProvider {
  constructor(init: SmartClientInit);
  getAuthorization(): Promise<string>;
  onUnauthorized(): Promise<void>;
  readonly patientId: string | undefined;
  readonly encounterId: string | undefined;
  readonly fhirContext: FhirContextEntry[] | undefined;
  readonly idToken: string | undefined;
  readonly scope: string;
  readonly tokens: StoredToken;
}
interface SmartClientInit {
  smartConfig: Pick<SmartConfiguration, "token_endpoint">;
  clientId: string;
  tokens: TokenResponse;                                  // initial tokens from exchangeCode
  clientSecret?: string;
  tokenStore?: TokenStore;
  storeKey?: string;                                      // default `user:${clientId}`
  clockSkewSec?: number;                                  // default 30
  fetch?: typeof globalThis.fetch;
  now?: () => number;
}
interface TokenStore {
  get(key: string): Promise<StoredToken | undefined>;
  set(key: string, token: StoredToken): Promise<void>;
  delete(key: string): Promise<void>;
}
class InMemoryTokenStore implements TokenStore {}
function withAbsoluteExpiry(t: TokenResponse, nowMs?: number): StoredToken;
```
**Example**
```ts
import { SmartClient } from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";

const client = new SmartClient({
  smartConfig: { token_endpoint: "https://ehr.example/token" },
  clientId: "app-123",
  tokens: tokenResponseFromExchangeCode,
});

const fhir = createFhirClient<Schema>({ baseUrl: "https://fhir.example/r4", auth: client });

console.log(client.patientId, client.fhirContext);
```

**Notes** — `SmartClient` coalesces concurrent refreshes, rotates refresh tokens when the server returns a new one, and invalidates its cache on `onUnauthorized()` so the next `getAuthorization()` triggers a refresh.
