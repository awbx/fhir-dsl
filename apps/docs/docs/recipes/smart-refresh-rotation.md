---
sidebar_position: 7
title: "SMART Refresh and Rotation"
description: "Public PKCE client with refresh-token rotation, automatic refresh inside SmartClient, and token introspection for revocation checks."
---

# SMART Refresh and Rotation

## Problem

A SMART v2 browser app launches with PKCE, gets an access token plus a
refresh token, and is expected to rotate both when the access token
nears expiry. The refresh flow is the same as the initial exchange minus
the authorization code — and the server issues a fresh refresh token
each time (rotation). Miss a rotation and you're locked out. Introspect
the token before sensitive operations to catch revocation mid-session.

## Prerequisites

- Generated client at `./fhir/r4`
- Packages: `@fhir-dsl/core`, `@fhir-dsl/smart`
- Server: SMART v2 authorization server advertising
  `refresh_token` support in `.well-known/smart-configuration.grant_types_supported`
  and emitting `offline_access` when asked

## Steps

### 1. Authorize with PKCE, asking for `offline_access`

`offline_access` unlocks the refresh-token grant. S256 is the only
permitted PKCE method — `buildAuthorizeUrl` hardcodes that for you.

```ts
import {
  buildAuthorizeUrl,
  codeChallengeS256,
  discoverSmartConfiguration,
  generateCodeVerifier,
  generateState,
} from "@fhir-dsl/smart";

const smartConfig = await discoverSmartConfiguration("https://fhir.example/r4");

const verifier = generateCodeVerifier();
const challenge = await codeChallengeS256(verifier);
const state = generateState();

sessionStorage.setItem("pkce-verifier", verifier);
sessionStorage.setItem("oauth-state", state);

const url = buildAuthorizeUrl({
  smartConfig,
  clientId: "app-123",
  redirectUri: "https://app.example/cb",
  scope: "launch/patient openid fhirUser patient/*.rs offline_access",
  state,
  codeChallenge: challenge,
  aud: "https://fhir.example/r4",
});
window.location.assign(url);
```

### 2. Exchange the code

On the redirect, swap the authorization code for tokens. The response
carries `access_token`, `expires_in`, `refresh_token`, and possibly
`id_token` + `patient` launch context.

```ts
import { exchangeCode } from "@fhir-dsl/smart";

const params = new URLSearchParams(window.location.search);
if (params.get("state") !== sessionStorage.getItem("oauth-state")) {
  throw new Error("OAuth state mismatch — aborting");
}

const tokens = await exchangeCode({
  smartConfig,
  clientId: "app-123",
  redirectUri: "https://app.example/cb",
  code: params.get("code")!,
  codeVerifier: sessionStorage.getItem("pkce-verifier")!,
});
```

### 3. Wrap the tokens in a `SmartClient` with a persistent `TokenStore`

`SmartClient` implements `AuthProvider` — plug it into `createFhirClient`
and every request gets the current access token. When the token is
within `refreshIfWithinSec` of expiry, the client transparently calls
the refresh endpoint and updates the store.

```ts
import { InMemoryTokenStore, SmartClient, withAbsoluteExpiry } from "@fhir-dsl/smart";
import { createFhirClient } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const tokenStore = new InMemoryTokenStore();
await tokenStore.set(withAbsoluteExpiry(tokens));

const smart = new SmartClient({
  smartConfig,
  clientId: "app-123",
  tokenStore,
  refreshIfWithinSec: 60, // refresh when <60s remain on access_token
  onTokenRefresh: async (fresh) => {
    // Persist rotation — refresh_token will have changed
    console.log("rotated; new expiresAt =", fresh.expiresAt);
  },
});

const fhir = createFhirClient<GeneratedSchema>({
  baseUrl: "https://fhir.example/r4",
  auth: smart,
});
```

For real apps replace `InMemoryTokenStore` with a store that writes to
IndexedDB, the server session, or a secure cookie — whatever survives
page reloads.

### 4. Handle refresh-token rotation

SMART v2 servers rotate the refresh token on every refresh call. The
`onTokenRefresh` callback fires after a successful refresh with the
*new* stored token (via `withAbsoluteExpiry`). Always persist what
you're handed; the old refresh token is immediately invalidated.

```ts
const smart = new SmartClient({
  smartConfig,
  clientId: "app-123",
  tokenStore,
  refreshIfWithinSec: 60,
  onTokenRefresh: async (fresh) => {
    // Persist: localStorage for a browser app, secure cookie for SSR, etc.
    localStorage.setItem("smart-token", JSON.stringify(fresh));
  },
});
```

### 5. Introspect before sensitive writes

A rotated refresh token is only invalidated server-side. If the user
was revoked mid-session, your cached access token may still pass
expiry checks locally but fail server-side. Introspect to confirm.

```ts
async function introspect(token: string): Promise<{ active: boolean; scope?: string }> {
  const endpoint = smartConfig.introspection_endpoint;
  if (!endpoint) return { active: true }; // server doesn't expose introspection
  const body = new URLSearchParams({ token, token_type_hint: "access_token" });
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok) return { active: false };
  return res.json() as Promise<{ active: boolean; scope?: string }>;
}

const stored = await tokenStore.get();
if (stored) {
  const meta = await introspect(stored.access_token);
  if (!meta.active) {
    await tokenStore.clear();
    window.location.assign("/login");
  }
}
```

### 6. Handle 401 mid-session

Even with refresh-on-expiry and introspection, a server may revoke the
token between two requests. Catch `FhirRequestError` with `status ===
401`, clear the store, and re-authorize.

```ts
import { FhirRequestError } from "@fhir-dsl/core";

try {
  const patient = await fhir.read("Patient", smart.patientId!).execute();
} catch (e) {
  if (e instanceof FhirRequestError && e.status === 401) {
    await tokenStore.clear();
    window.location.assign("/login");
    return;
  }
  throw e;
}
```

## Final snippet

```ts
import {
  buildAuthorizeUrl,
  codeChallengeS256,
  discoverSmartConfiguration,
  exchangeCode,
  generateCodeVerifier,
  generateState,
  InMemoryTokenStore,
  SmartClient,
  withAbsoluteExpiry,
} from "@fhir-dsl/smart";
import { createFhirClient, FhirRequestError } from "@fhir-dsl/core";
import type { GeneratedSchema } from "./fhir/r4/client.js";

const FHIR_BASE = "https://fhir.example/r4";

export async function startLogin() {
  const smartConfig = await discoverSmartConfiguration(FHIR_BASE);
  const verifier = generateCodeVerifier();
  const challenge = await codeChallengeS256(verifier);
  const state = generateState();
  sessionStorage.setItem("pkce-verifier", verifier);
  sessionStorage.setItem("oauth-state", state);
  sessionStorage.setItem("smart-config", JSON.stringify(smartConfig));

  window.location.assign(
    buildAuthorizeUrl({
      smartConfig,
      clientId: "app-123",
      redirectUri: "https://app.example/cb",
      scope: "launch/patient openid fhirUser patient/*.rs offline_access",
      state,
      codeChallenge: challenge,
      aud: FHIR_BASE,
    }),
  );
}

export async function completeLogin() {
  const smartConfig = JSON.parse(sessionStorage.getItem("smart-config")!);
  const params = new URLSearchParams(window.location.search);
  if (params.get("state") !== sessionStorage.getItem("oauth-state")) {
    throw new Error("state mismatch");
  }

  const tokens = await exchangeCode({
    smartConfig,
    clientId: "app-123",
    redirectUri: "https://app.example/cb",
    code: params.get("code")!,
    codeVerifier: sessionStorage.getItem("pkce-verifier")!,
  });

  const tokenStore = new InMemoryTokenStore();
  await tokenStore.set(withAbsoluteExpiry(tokens));

  const smart = new SmartClient({
    smartConfig,
    clientId: "app-123",
    tokenStore,
    refreshIfWithinSec: 60,
    onTokenRefresh: async (fresh) => {
      localStorage.setItem("smart-token", JSON.stringify(fresh));
    },
  });

  const fhir = createFhirClient<GeneratedSchema>({
    baseUrl: FHIR_BASE,
    auth: smart,
  });

  return { smart, fhir, tokenStore };
}

export async function withUnauthorizedRetry<T>(
  fn: () => Promise<T>,
  onUnauthorized: () => Promise<void>,
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof FhirRequestError && e.status === 401) {
      await onUnauthorized();
    }
    throw e;
  }
}
```

## Troubleshooting

- **"invalid_grant" on refresh** → the refresh token rotated and the
  old one was used twice. Your `onTokenRefresh` persistence is not
  atomic. Make the write-to-storage step synchronous with the refresh
  response.
- **`SmartClient` refreshes on every request** → `refreshIfWithinSec`
  is too large relative to `expires_in`. A 3600 s token with
  `refreshIfWithinSec: 4000` refreshes every call. Keep
  `refreshIfWithinSec` ≤ 10% of `expires_in`.
- **No `refresh_token` in the token response** → the server didn't
  honour `offline_access`. Check `smartConfig.scopes_supported` and
  confirm the scope went through unmodified.
- **Introspection endpoint 404** → some SMART v2 servers don't expose
  RFC 7662 introspection. Fall back to a "best effort" assumption:
  trust the local expiry and re-authorize on 401.
- **401 on every call after re-login** → check that you cleared the
  `TokenStore` between sessions. A stale refresh token persists until
  you call `await tokenStore.clear()`.
