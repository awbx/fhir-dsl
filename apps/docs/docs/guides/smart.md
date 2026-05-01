---
id: smart
title: SMART on FHIR
description: End-to-end SMART-on-FHIR v2 — discovery, PKCE patient launch, token exchange, and refresh — wired into fhir-dsl through the AuthProvider contract.
sidebar_label: SMART on FHIR
---

# SMART on FHIR

`@fhir-dsl/smart` implements [SMART App Launch v2](https://hl7.org/fhir/smart-app-launch/) — OAuth2-based authentication for FHIR clients. It covers the two flows defined by the spec:

- **Backend Services** — server-to-server auth using an asymmetric JWT `client_assertion`. No user, no browser. Used for analytics, ETL, bulk export, automated pipelines.
- **App Launch** — interactive OAuth2 authorization-code flow with PKCE. Used for patient- or provider-facing apps launched from an EHR or as standalone web/mobile apps.

Both flows expose an `AuthProvider` that plugs into `createFhirClient({ auth })`. You never manually attach `Authorization` headers.

## Install

```bash
npm install @fhir-dsl/smart @fhir-dsl/core
```

The package depends on [`jose`](https://github.com/panva/jose) for JWT signing and has no other runtime dependencies.

## Choosing a Flow

| Scenario | Flow |
|---|---|
| Server job pulling population data | Backend Services |
| Automated sync / warehouse ETL | Backend Services |
| Bulk Data export client | Backend Services |
| Provider-facing EHR-launched app | App Launch (EHR) |
| Patient portal / standalone web app | App Launch (Standalone) |
| Mobile app authenticating against a provider | App Launch (Standalone) |

## Backend Services

No user, no redirect. The client registers a public key with the FHIR server; at runtime it signs a short-lived JWT, exchanges it for an access token, and caches the token until it expires.

```typescript
import { BackendServicesAuth } from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";
import { importPKCS8 } from "jose";

const privateKey = await importPKCS8(process.env.PRIVATE_KEY!, "ES384");

const auth = new BackendServicesAuth({
  issuer: "https://fhir.example.com/r4",
  clientId: "backend-client-id",
  scope: "system/Patient.rs system/Observation.rs",
  privateKey,
  alg: "ES384",   // ES384 (EC) or RS384 (RSA)
  kid: "key-1",   // optional JWT header kid
});

const fhir = createFhirClient({
  baseUrl: "https://fhir.example.com/r4",
  auth,
});

const patients = await fhir.search("Patient").count(100).execute();
```

What happens behind `auth`:

1. On the first request, `getAuthorization()` signs a `client_assertion` JWT (`iss=sub=clientId`, `aud=token_endpoint`, `exp` ≤ 5 min).
2. POSTs to the token endpoint with `grant_type=client_credentials`, the assertion, and the requested `scope`.
3. Caches the returned `access_token` with its absolute expiry.
4. Subsequent requests reuse the cached token; once it's within the skew window of expiry, the next call re-mints it.
5. If the server returns `401`, `onUnauthorized()` clears the cache so the next call refreshes.

### Configuration

| Option | Purpose |
|---|---|
| `issuer` | FHIR base URL — used to fetch `.well-known/smart-configuration` if `smartConfig` isn't supplied. |
| `clientId` | Registered client ID (also JWT `iss` / `sub`). |
| `scope` | Space-delimited scopes — typically `system/*.rs` patterns. |
| `privateKey` | `jose` `KeyLike`, JWK, or raw `Uint8Array`. |
| `alg` | `"ES384"` or `"RS384"` — SMART v2 requires one of these. |
| `kid` | Optional key identifier included in the JWT header. |
| `smartConfig` | Skip discovery by passing the config directly (useful for tests). |
| `tokenStore` | Custom `TokenStore` — defaults to in-memory. |
| `clockSkewSec` | Refresh a token this many seconds before its `exp` (default 30). |
| `assertionLifetimeSec` | JWT `exp` lifetime (≤ 300s per spec; default 300). |

## App Launch (OAuth2 + PKCE)

Interactive flow: the user authenticates in a browser, authorizes your app, and the authorization server returns an authorization code that you exchange for tokens. SMART v2 mandates PKCE for every client.

The flow has four touch points in your code:

1. **Launch** — receive `iss` and `launch` from the EHR (EHR launch) or start fresh (standalone).
2. **Redirect** — build the authorize URL, stash PKCE verifier + state, send the browser.
3. **Callback** — validate `state`, exchange `code` for tokens.
4. **Client construction** — wrap tokens in a `SmartClient` and feed it to `createFhirClient`.

```typescript
import {
  discoverSmartConfiguration,
  generateCodeVerifier,
  codeChallengeS256,
  generateState,
  buildAuthorizeUrl,
  exchangeCode,
  SmartClient,
} from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";

// (1) Discover endpoints
const smartConfig = await discoverSmartConfiguration("https://fhir.example.com/r4");

// (2) Build PKCE + state, persist in session
const verifier  = generateCodeVerifier();
const challenge = await codeChallengeS256(verifier);
const state     = generateState();
await session.set({ verifier, state });

// (3) Redirect
const url = buildAuthorizeUrl({
  smartConfig,
  clientId: "my-app",
  redirectUri: "https://app.example.com/callback",
  scope: "launch/patient openid fhirUser patient/Observation.rs offline_access",
  state,
  codeChallenge: challenge,
  aud: "https://fhir.example.com/r4",
  launch: ehrLaunchToken,   // undefined for standalone launch
});
res.redirect(url);
```

In the callback handler:

```typescript
// (4) Validate state, exchange code
if (query.state !== session.state) throw new Error("state mismatch");

const tokens = await exchangeCode({
  smartConfig,
  clientId: "my-app",
  redirectUri: "https://app.example.com/callback",
  code: query.code,
  codeVerifier: session.verifier,
});

// (5) SmartClient handles refresh and exposes launch context
const smart = new SmartClient({ smartConfig, clientId: "my-app", tokens });

const fhir = createFhirClient({
  baseUrl: "https://fhir.example.com/r4",
  auth: smart,
});

const patient = await fhir.read("Patient", smart.patientId!).execute();
```

### Launch Context

After exchange, `SmartClient` surfaces every contextual claim the server returned:

```typescript
smart.patientId      // "patient-123"
smart.encounterId    // "enc-456"
smart.idToken        // OIDC ID token (if openid requested)
smart.fhirContext    // FhirContextEntry[] — additional references
smart.scope          // granted scope string (may be narrower than requested)
smart.tokens         // immutable snapshot of the current token set
```

### Token Refresh

If `offline_access` was granted, `SmartClient` refreshes automatically when the access token is within the skew window of expiring. No caller code required.

For manual refresh (e.g., to downscope):

```typescript
import { refreshToken } from "@fhir-dsl/smart";

const narrower = await refreshToken({
  smartConfig,
  clientId: "my-app",
  refreshToken: currentRefreshToken,
  scope: "openid patient/Observation.r", // narrower than original
});
```

### Confidential Clients

If you registered a confidential client (has a `client_secret`), pass it:

```typescript
const smart = new SmartClient({
  smartConfig,
  clientId: "my-app",
  clientSecret: process.env.CLIENT_SECRET,
  tokens,
});
```

The secret is sent as HTTP Basic auth on token and refresh calls. Never ship a secret to a public (browser / mobile) client.

## Scopes

Build v2 scope strings type-safely:

```typescript
import {
  buildScopes,
  resourceScope,
  launchScope,
  openid,
  fhirUser,
  offlineAccess,
} from "@fhir-dsl/smart";

const scope = buildScopes([
  openid,
  fhirUser,
  offlineAccess,
  launchScope("patient"),
  resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] }),
  resourceScope({ context: "patient", resource: "Condition",   perms: "*" }),
]);
// "openid fhirUser offline_access launch/patient
//  patient/Observation.rs patient/Condition.cruds"
```

Permission letters follow SMART v2: `c` create, `r` read, `u` update, `d` delete, `s` search. `"*"` expands to `cruds`.

Parse granted scopes to inspect what the server actually approved:

```typescript
import { parseScope } from "@fhir-dsl/smart";

parseScope("patient/Observation.rs");
// { kind: "resource", context: "patient", resource: "Observation", perms: ["r","s"] }

parseScope("launch/encounter");
// { kind: "launch", context: "encounter" }
```

## Token Storage

Tokens are sensitive. `InMemoryTokenStore` is the default, but it only survives the current process. For production, implement `TokenStore` against encrypted storage:

```typescript
import type { TokenStore, StoredToken } from "@fhir-dsl/smart";

class RedisTokenStore implements TokenStore {
  async get(key: string): Promise<StoredToken | undefined> {
    const raw = await redis.get(key);
    return raw ? JSON.parse(raw) : undefined;
  }
  async set(key: string, value: StoredToken): Promise<void> {
    await redis.set(key, JSON.stringify(value));
  }
  async delete(key: string): Promise<void> {
    await redis.del(key);
  }
}

const smart = new SmartClient({
  smartConfig,
  clientId: "my-app",
  tokens,
  tokenStore: new RedisTokenStore(),
  storeKey: `smart:${userId}`,
});
```

:::caution
Access and refresh tokens are bearer credentials. Encrypt at rest (KMS, keychain, libsodium) — don't log them, don't drop them into an unsecured database column.
:::

## Errors

Both flows can throw two typed errors:

```typescript
import { SmartAuthError, DiscoveryError } from "@fhir-dsl/smart";

try {
  const tokens = await exchangeCode({ /* … */ });
} catch (err) {
  if (err instanceof SmartAuthError) {
    // RFC 6749 token-endpoint error
    console.error(err.error);            // "invalid_grant" | "invalid_client" | …
    console.error(err.errorDescription); // human-readable
    console.error(err.status);           // HTTP status
  } else if (err instanceof DiscoveryError) {
    console.error(err.url, err.status);
  }
  throw err;
}
```

The FHIR client still throws `FhirError` for non-auth FHIR errors — see [Error Handling](/docs/examples/queries#error-handling).

## Reference

### Exports

| Export | Purpose |
|---|---|
| `BackendServicesAuth` | Server-to-server auth provider (JWT client assertion). |
| `SmartClient` | App-launch auth provider (holds tokens, auto-refreshes). |
| `discoverSmartConfiguration` | Fetch `.well-known/smart-configuration`. |
| `buildAuthorizeUrl` | Construct the OAuth2 authorize URL. |
| `exchangeCode` | Exchange authorization code for tokens. |
| `refreshToken` | Manual token refresh. |
| `generateCodeVerifier` / `codeChallengeS256` / `generateState` | PKCE + CSRF helpers. |
| `buildScopes` / `resourceScope` / `launchScope` / `parseScope` | Scope construction and parsing. |
| `openid` / `fhirUser` / `offlineAccess` / `onlineAccess` | Scope string constants. |
| `TokenStore` / `InMemoryTokenStore` / `withAbsoluteExpiry` | Token persistence abstraction. |
| `signClientAssertion` | Low-level JWT signer (used internally by `BackendServicesAuth`). |
| `SmartAuthError` / `DiscoveryError` | Typed error classes. |

### Package

- Source: [`packages/smart`](https://github.com/awbx/fhir-dsl/tree/main/packages/smart)
- Spec: [SMART App Launch v2](https://hl7.org/fhir/smart-app-launch/)
