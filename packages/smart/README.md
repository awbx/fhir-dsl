# @fhir-dsl/smart

[SMART on FHIR v2](https://hl7.org/fhir/smart-app-launch/) authentication for `@fhir-dsl` — Backend Services (system-to-system), App Launch (OAuth2 + PKCE), scope builders, token refresh, and `.well-known` discovery.

Plugs directly into `createFhirClient({ auth })` as an `AuthProvider`. No separate fetch wrapper, no manual token plumbing.

## Install

```bash
npm install @fhir-dsl/smart @fhir-dsl/core
```

## Backend Services (system-to-system)

Server workloads — analytics jobs, ETL, bulk export — authenticate with an asymmetric JWT `client_assertion`. `BackendServicesAuth` signs the assertion, exchanges it for an access token, caches until expiry, and refreshes on demand.

```ts
import { BackendServicesAuth } from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";
import { importPKCS8 } from "jose";

const privateKey = await importPKCS8(process.env.PRIVATE_KEY!, "ES384");

const auth = new BackendServicesAuth({
  issuer: "https://fhir.example.com/r4",
  clientId: "backend-client-id",
  scope: "system/Patient.rs system/Observation.rs",
  privateKey,
  alg: "ES384",      // or "RS384"
  kid: "key-1",      // optional — included in JWT header
});

const fhir = createFhirClient({
  baseUrl: "https://fhir.example.com/r4",
  auth,
});

const patients = await fhir.search("Patient").count(100).execute();
```

Tokens are held in memory by default; pass a custom `tokenStore` to persist elsewhere (DB, KMS, Redis).

## App Launch (OAuth2 + PKCE)

Interactive EHR or standalone launch. You drive the redirect, the package handles PKCE, discovery, code exchange, refresh, and launch context (`patient`, `encounter`, `fhirContext`).

```ts
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

// 1. Discover endpoints from /.well-known/smart-configuration
const smartConfig = await discoverSmartConfiguration("https://fhir.example.com/r4");

// 2. Generate PKCE verifier + CSRF state, stash them in session
const verifier = generateCodeVerifier();
const challenge = await codeChallengeS256(verifier);
const state = generateState();

// 3. Redirect the browser to the authorize URL
const url = buildAuthorizeUrl({
  smartConfig,
  clientId: "my-app",
  redirectUri: "https://app.example.com/callback",
  scope: "launch/patient openid fhirUser patient/Observation.rs offline_access",
  state,
  codeChallenge: challenge,
  aud: "https://fhir.example.com/r4",
  launch: "ehr-launch-token", // EHR launch only
});

// 4. In the callback: exchange the code for tokens
const tokens = await exchangeCode({
  smartConfig,
  clientId: "my-app",
  redirectUri: "https://app.example.com/callback",
  code: codeFromQuery,
  codeVerifier: verifier,
});

// 5. Wrap in a SmartClient — auto-refreshes on expiry
const smart = new SmartClient({ smartConfig, clientId: "my-app", tokens });

const fhir = createFhirClient({
  baseUrl: "https://fhir.example.com/r4",
  auth: smart,
});

// Launch context is available on the client
const patient = await fhir.read("Patient", smart.patientId!).execute();
```

## Scope Builders

Type-safe v2 scope construction — resource scopes (`patient/Observation.rs`), launch contexts, and join helpers.

```ts
import { buildScopes, resourceScope, openid, fhirUser, offlineAccess } from "@fhir-dsl/smart";

const scope = buildScopes([
  openid,
  fhirUser,
  offlineAccess,
  "launch/patient",
  resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] }),
  resourceScope({ context: "patient", resource: "Condition", perms: "*" }),
]);
// "openid fhirUser offline_access launch/patient patient/Observation.rs patient/Condition.cruds"
```

`parseScope` goes the other way — inspect a granted scope string as a typed object.

## Discovery

```ts
import { discoverSmartConfiguration } from "@fhir-dsl/smart";

const config = await discoverSmartConfiguration("https://fhir.example.com/r4");
// config.authorization_endpoint, config.token_endpoint, config.capabilities, …
```

Throws `DiscoveryError` if the well-known document is missing or malformed.

## Token Storage

`SmartClient` and `BackendServicesAuth` accept a `TokenStore` — swap the default `InMemoryTokenStore` for encrypted, persistent storage:

```ts
import type { TokenStore, StoredToken } from "@fhir-dsl/smart";

class EncryptedStore implements TokenStore {
  async get(key: string): Promise<StoredToken | undefined> { /* … */ }
  async set(key: string, value: StoredToken): Promise<void>  { /* … */ }
  async delete(key: string): Promise<void>                   { /* … */ }
}

const smart = new SmartClient({
  smartConfig,
  clientId: "my-app",
  tokens,
  tokenStore: new EncryptedStore(),
  storeKey: `smart:${userId}`,
});
```

## Error Handling

Both error classes extend [`FhirDslError`](https://awbx.github.io/fhir-dsl/docs/guides/error-handling) — pattern-match on `kind` and read structured `context` instead of parsing `.message`. `toJSON()` gives a transport-safe payload for logs and error trackers.

| Class | `kind` | When |
|---|---|---|
| `SmartAuthError` | `smart.auth` | RFC 6749 §5.2 token-endpoint error response (`context.error` is the canonical OAuth2 code: `invalid_grant`, `invalid_client`, …) |
| `DiscoveryError` | `smart.discovery` | `.well-known/smart-configuration` unreachable, malformed, or missing required endpoints |

```ts
import { isFhirDslError } from "@fhir-dsl/utils";

try {
  await exchangeCode({ /* … */ });
} catch (err) {
  if (isFhirDslError(err) && err.kind === "smart.auth") {
    // err.context.error is the RFC 6749 code: "invalid_grant", "invalid_client", …
    if (err.context.error === "invalid_grant") promptReauth();
    else throw err;
  }
}
```

Or skip the `try`/`catch` and use the `Result` toolkit directly:

```ts
import { tryAsync } from "@fhir-dsl/utils";
import { SmartAuthError } from "@fhir-dsl/smart";

const r = await tryAsync<TokenResponse, SmartAuthError>(() => exchangeCode({ /* … */ }));
if (!r.ok) console.error(r.error.kind, r.error.context.error);
```

## Documentation

Full guide: [SMART on FHIR](https://awbx.github.io/fhir-dsl/docs/guides/smart)

## License

[MIT](https://github.com/awbx/fhir-dsl/blob/main/LICENSE)
