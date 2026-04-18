# Test Prompt: `@fhir-dsl/smart`

**Role.** You are a senior TypeScript test engineer. Your goal is to raise
`@fhir-dsl/smart` — the SMART on FHIR client — to production-grade coverage
using **vitest**, with accurate assertions drawn from the SMART App Launch v2
and OAuth2 / OIDC specs. No source changes. No new runtime dependencies.

## Project brief

**fhir-dsl** is a type-safe FHIR monorepo. `@fhir-dsl/smart` implements:

- OAuth2 authorization-code flow with **PKCE** (user-facing apps).
- **Backend services** flow (JWT assertion client credentials).
- SMART well-known discovery.
- SMART scope parser (v1 + v2 grammar).
- Opaque token store interface.

## Package brief

Public surface (`packages/smart/src/index.ts`):

- `authorize.ts` — build the `/authorize` URL; consume the redirect.
- `backend-services.ts` — sign + post the JWT assertion.
- `discovery.ts` — fetch `.well-known/smart-configuration`.
- `errors.ts` — `SmartAuthError` + friends.
- `jwt.ts` — sign/verify helpers (likely via `jose` or similar).
- `pkce.ts` — `code_verifier` + `code_challenge` generation.
- `scopes.ts` — parse + serialize v1/v2 scope strings.
- `smart-client.ts` — high-level orchestration.
- `token-store.ts` — interface + default in-memory impl.
- `types.ts` — config / token / scope types.

### Files to read first

1. `packages/smart/src/index.ts`
2. `packages/smart/src/authorize.ts`
3. `packages/smart/src/backend-services.ts`
4. `packages/smart/src/discovery.ts`
5. `packages/smart/src/pkce.ts`
6. `packages/smart/src/scopes.ts`
7. `packages/smart/src/smart-client.ts`
8. `packages/smart/src/jwt.ts`
9. All `*.test.ts` in `packages/smart/src/`

## Existing coverage (do not duplicate)

- `authorize.test.ts` — URL construction.
- `backend-services.test.ts` — JWT assertion build.
- `discovery.test.ts` — `.well-known` parse.
- `pkce.test.ts` — verifier/challenge shape.
- `scopes.test.ts` — scope parse.
- `smart-client.test.ts` — top-level orchestration.

## Coverage gaps to fill

Write tests in `packages/smart/test/`.

### PKCE

1. **`code_verifier` conforms to RFC 7636 §4.1**: length 43–128, unreserved
   chars only (`[A-Z a-z 0-9 \- . _ ~]`).
2. **`code_challenge` is `BASE64URL(SHA256(verifier))`** — compute the
   expected value for a fixed verifier and assert byte-identical.
3. **`code_challenge_method` is `S256`** (never `plain`).
4. **Randomness**: across 100 calls, no two verifiers are equal.

### Authorize URL

5. `authorize` URL contains all required OAuth2 params: `response_type=code`,
   `client_id`, `redirect_uri`, `scope`, `state`, `aud` (SMART-specific),
   `code_challenge`, `code_challenge_method=S256`.
6. `state` is random per call and round-trip safe (base64url, no padding).
7. `aud` is the FHIR server base URL exactly as supplied (no trailing slash
   manipulation that would break the SMART spec).
8. When the config supplies `launch`, it's appended as a scope component
   (`launch/patient`, `launch/encounter`).

### Discovery

9. `/.well-known/smart-configuration` is fetched (not `/metadata`), and a
   response missing `authorization_endpoint` or `token_endpoint` throws a
   descriptive error.
10. A response advertising `code_challenge_methods_supported` without `S256`
    is rejected.
11. A 404 response surfaces a `SmartAuthError` (not a generic
    `FhirRequestError`).

### Backend services / JWT

12. JWT header: `alg` ∈ {`RS384`, `ES384`} (per SMART v2), `typ: "JWT"`,
    `kid` matches the supplied key. Assertion is rejected if `alg: "none"`.
13. JWT payload claims: `iss` = `sub` = `client_id`, `aud` = token endpoint
    URL, `jti` unique per call, `exp` ≤ 5 minutes from `iat`.
14. Token exchange POST body contains `grant_type=client_credentials`,
    `client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer`,
    `client_assertion=<JWT>`, `scope=<supplied>`.
15. Server returning `invalid_client` surfaces as `SmartAuthError` with the
    OAuth error code exposed.

### Token exchange (auth-code flow)

16. POST to `token_endpoint` with `grant_type=authorization_code`,
    `code=<supplied>`, `redirect_uri`, `client_id`, `code_verifier`.
17. Successful response is decoded into `{ access_token, id_token?, refresh_token?, scope, expires_in }`
    and stored via the `TokenStore`.
18. Refresh path: using `refresh_token` posts `grant_type=refresh_token`;
    rotated refresh tokens replace the stored one.

### Scope parser

19. **v1**: `patient/Observation.read`, `user/*.write`, `openid`,
    `profile`, `fhirUser`, `launch`, `launch/patient`, `offline_access` —
    each parses to the right shape.
20. **v2**: `patient.Observation.rs`, `user.*.cruds`,
    `patient.Observation.rs?category=http://loinc.org|vital-signs` —
    each parses and the search-param qualifier is retained.
21. Round-trip: `serialize(parse(s)) === s` for all valid inputs.
22. Invalid scope strings produce an error that names the offending token.

### Token store

23. The default in-memory store supports `get`, `set`, `clear`, and is
    keyed per user/session as documented (check the source for the
    exact key discipline).
24. `set` followed by an expired `exp` leads `get` to return `undefined`
    (if the implementation does TTL checks; if not, mark the test .skip
    with a note).

## Research directives

- **SMART App Launch v2**: <https://hl7.org/fhir/smart-app-launch/STU2/>.
  Sections: *Scopes and Launch Context*, *Backend Services*, *App Launch*.
- **OAuth2 authorization code**: RFC 6749
  <https://datatracker.ietf.org/doc/html/rfc6749>.
- **PKCE**: RFC 7636
  <https://datatracker.ietf.org/doc/html/rfc7636>.
- **JWT (compact)**: RFC 7519
  <https://datatracker.ietf.org/doc/html/rfc7519>.
- **OAuth 2.0 Client Assertion**: RFC 7523
  <https://datatracker.ietf.org/doc/html/rfc7523>.
- **OIDC discovery**: <https://openid.net/specs/openid-connect-discovery-1_0.html>.
- **SMART scopes v2 grammar** — see the v2 spec section "SMART on FHIR
  Access Scopes" — required reading before writing the scope-parser tests.

## Conventions

- vitest `globals: true`. Use `vi.useFakeTimers()` when `exp` / `iat` are
  asserted.
- Mock `fetch` at the module boundary; no real HTTP.
- Generate test keypairs with `jose` (already a transitive dep if used by
  `jwt.ts`) inside the test — don't commit keys.
- Scope parser tests should use table-driven assertions (`it.each([...])`).

## Workflow

1. Read source + existing tests.
2. Organize new tests by area: `pkce.test.ts`, `authorize-url.test.ts`,
   `discovery.test.ts`, `backend-services-jwt.test.ts`,
   `token-exchange.test.ts`, `scopes-v2.test.ts`, `token-store.test.ts`.
3. Gates:
   ```bash
   pnpm test
   pnpm lint
   pnpm -r typecheck
   ```

## Success criteria

- Every scenario above has ≥1 test.
- All three gates green.
- No network calls.
- No source changes.

## Out of scope

- Adding support for new grant types.
- Testing arbitrary JWT algorithms beyond what the package implements.
- FHIR data access after the token exchange — that lives in `core`.
