---
sidebar_position: 100
title: LLM Usage Guide
description: Deterministic reference an LLM can consume once to generate correct fhir-dsl TypeScript. Includes a never-say list for 7 documented hallucinations.
---

# LLM Usage Guide

This page is the single source of truth for coding agents and chat models producing `fhir-dsl` TypeScript. Every signature on this page is copied from `packages/<pkg>/src/*.ts` at v0.21.0. Signatures on older blog posts, StackOverflow answers, and the pre-0.20 README are outdated — treat this page as authoritative.

---

## 1. How to prompt with fhir-dsl

Paste the block below into your LLM system prompt (or `CLAUDE.md`, `cursorrules`, `copilot-instructions.md`). It is optimised to keep the model inside the real API surface.

````text
You are generating TypeScript that uses `fhir-dsl` v0.21.x.

### Imports
- Runtime types and builders live in `@fhir-dsl/core`.
- The standalone executor, pagination helpers, and `FhirError` live in `@fhir-dsl/runtime`.
- The FHIR datatypes (`Reference<T>`, `Bundle`, `Coding<T>`, `OperationOutcome`) live in `@fhir-dsl/types`.
- The typed client factory (`createClient`) is generated into the user's project, typically `./fhir/r4/client` or `./src/fhir/r4/client`. It wraps `createFhirClient<GeneratedSchema>` from `@fhir-dsl/core`.

### Canonical client construction
```ts
import { createClient } from "./fhir/r4/client"; // generated
const fhir = createClient({
  baseUrl: "https://example.org/fhir",
  auth: { type: "bearer", credentials: process.env.TOKEN! }, // or an AuthProvider instance
  schemas, // optional SchemaRegistry — required only if you call .validate()
  async: { pollingInterval: 2000, maxAttempts: 60 }, // optional, enables 202 polling
  retry: { maxAttempts: 3 }, // optional
});
```

### Canonical search chain order
`.search(RT)` → `.where(...)` (repeat) → `.whereIn / whereMissing / whereId / whereLastUpdated / withTag / withSecurity / fromSource / whereComposite / whereChained / whereChain / has` → `.include(...)` / `.revinclude(...)` → `.withProfile(...)` → `.select([...])` → `.sort(...)` → `.count(...)` / `.offset(...)` → `.summary / .total / .contained / .containedType` → `.filter / .text / .content / .inList / .namedQuery` → `.validate()` / `.usePost()` / `.getUrlByteLimit(bytes)` → terminal (`.execute()`, `.stream()`, or `.compile()`).

Every chain step returns a new immutable builder. Order within each group does not matter; you may share a partial builder across requests.

### When to use each terminal
- `.execute(opts?)` — normal request; returns `{ data, included, total?, link?, raw }`.
- `.stream(opts?)` — async iterable of resources across every page; skips `included`.
- `.compile()` — no HTTP; returns a `CompiledQuery` for inspection, testing, or off-box dispatch.

### When to reach for each client verb
- `fhir.search(RT)` / `fhir.search(RT, profile)` — any query that returns a list.
- `fhir.searchAll()` — system-wide search (no resource type bound).
- `fhir.read(RT, id)` — single resource by id. Supports `.validate()`, `.ifNoneMatch()`, `.ifModifiedSince()`.
- `fhir.vread(RT, id, versionId)` — historical version of a resource.
- `fhir.history()` / `fhir.history(RT)` / `fhir.history(RT, id)` — scoped history.
- `fhir.capabilities()` — `GET metadata`.
- `fhir.create(resource)` — POST; chain `.ifNoneExist(query | [["param","op","value"]...])` for conditional create.
- `fhir.update(resource)` (requires `resource.id`) — PUT; chain `.ifMatch(etag)` / `.ifNoneMatch(etag | "*")`.
- `fhir.delete(RT, id)` — DELETE; chain `.ifMatch(etag)`.
- `fhir.patch(RT, id, body, format?)` — PATCH; `format` is `"json-patch"` | `"xml-patch"` | `"fhirpath-patch"`.
- `fhir.batch()` / `fhir.transaction()` — chain `.create(r) / .update(r) / .delete(RT, id) / .$if(cond, fn) / .$call(fn)` then `.execute()` or `.compile()`.
- `fhir.operation(name, { scope?, resourceType?, id?, parameters?, method? })` — name is the first positional argument; there is no builder chain.

### FHIRPath
```ts
import { fhirpath, evaluate } from "@fhir-dsl/fhirpath";
const expr = fhirpath<Patient>("Patient").name.where("use", "official").given;
const ops = (expr as any)[Symbol.for("fhirpath.ops")];
const given = evaluate(ops, patient); // unknown[]
```

### Never say
Do not generate any of the following. They do not exist in `fhir-dsl` and will not type-check or will silently produce the wrong wire output:
1. `OperationBuilder.withParam(...)` / `.withResource(...)` / `.asGet()` / `.asPost()` — there is no operation chain API.
2. `AuthProvider.getAuthHeader()` — the method is `getAuthorization({ url, method })`.
3. `FhirClientConfig.asyncPolling` — the field is `async`.
4. `result.bundle` — the field is `raw`.
5. `result.next` destructure — pagination lives in `result.link` (`relation: "next"`) or on the runtime `SearchResult`'s `nextUrl`.
6. `SearchQueryBuilder.select("a", "b", "c")` spread form — `select` takes a **single readonly array**.
7. `FhirClientConfig.resourceValidators` / `profileValidators` / `schemaRegistry` / `preferReturn` — none exist. Use `schemas`, and pass `prefer` per-call via `ExecuteOptions`.
````

---

## 2. Input / Output contract

One block per public API. An LLM should be able to consume these and emit correct, runnable TypeScript without reading source.

### search

- **Input:** `fhir.search(resourceType)` where `resourceType extends keyof S["resources"] & string`. Chain `.where(name, op, value)` (or the callback form), optional `.whereIn / whereMissing / whereId / whereLastUpdated / withTag / withSecurity / fromSource / whereComposite / whereChained / whereChain / has / include / revinclude / withProfile / select / sort / count / offset / summary / total / contained / containedType / filter / text / content / inList / namedQuery / validate / usePost / getUrlByteLimit / $if / $call`.
- **Output (TypeScript):**
  ```ts
  Promise<SearchResult<
    ApplySelection<ResolveProfile<S, RT, Prof>, Sel>,
    ResolveIncluded<S, Inc>
  >>
  // where SearchResult = {
  //   data: Primary[];
  //   included: [Included] extends [never] ? [] : Included[];
  //   total?: number;
  //   link?: BundleLink[];
  //   raw: unknown;
  // }
  ```
- **Behavior:** Serialises to `GET /<RT>?<params>` by default. Auto-upgrades to `POST` with `Content-Type: application/x-www-form-urlencoded` when the compiled URL (`resourceType + "?" + query`, measured with `TextEncoder`) exceeds the current threshold (default `1900` bytes, set via `.getUrlByteLimit(bytes)`). `_format` and `_pretty` always stay on the URL. `usePost()` flips to POST unconditionally. The runtime `FhirExecutor.executeUrl` strips `Authorization` on cross-origin redirects (RFC 6750 §5.3). Source: `packages/core/src/search-query-builder.ts:521-572, 709-753`; `packages/runtime/src/executor.ts:58-63`.

### read

- **Input:** `fhir.read(resourceType, id)`. Chain `.validate()`, `.ifNoneMatch(etag)`, `.ifModifiedSince(when)`.
- **Output (TypeScript):** `Promise<S["resources"][RT]>`.
- **Behavior:** `GET /<RT>/<id>`. `.validate()` throws `ValidationError` on schema issues and `ValidationUnavailableError` if the client was constructed without `schemas`. `If-None-Match` and `If-Modified-Since` headers produce `304` → the promise resolves with the resource from cache semantics (server-dependent). Source: `packages/core/src/read-query-builder.ts`.

### create

- **Input:** `fhir.create(resource)` where `resource.resourceType` must match. Optional `.ifNoneExist(query | [[name, op, value]...])`.
- **Output (TypeScript):** `Promise<Resource>` with non-enumerable `location`, `etag`, `headers` properties attached. `JSON.stringify(result)` drops them on purpose.
- **Behavior:** `POST /<RT>`. `ifNoneExist` adds an `If-None-Exist:` header; if the server finds a match, it returns `200` with no new resource. Source: `packages/core/src/direct-crud-builder.ts`; `packages/runtime/src/executor.ts:95-110`.

### update

- **Input:** `fhir.update(resource)` where `resource.id` is required. Chain `.ifMatch(etag)` and/or `.ifNoneMatch(etag | "*")`.
- **Output (TypeScript):** `Promise<Resource>` with non-enumerable `location`, `etag`, `headers` attached.
- **Behavior:** `PUT /<RT>/<id>`. `If-Match` enables optimistic-concurrency upsert; `412 Precondition Failed` surfaces as `FhirRequestError` (core) or `FhirError` (runtime). `If-None-Match: *` ensures a pure insert via PUT. Source: `packages/core/src/direct-crud-builder.ts`.

### batch

- **Input:** `fhir.batch()` then `.create(r) / .update(r) / .delete(rt, id) / .$if(cond, fn) / .$call(fn)`, terminated by `.execute()` or `.compile()`.
- **Output (TypeScript):** `Promise<Bundle>` where `bundle.type === "batch-response"`. Each entry corresponds to an input entry in order.
- **Behavior:** `POST /` with a `Bundle.type = "batch"`. Entries run independently — individual failures do not roll back the others. Source: `packages/core/src/transaction-builder.ts`.

### transaction

- **Input:** `fhir.transaction()` with the same chainable verbs as `.batch()`.
- **Output (TypeScript):** `Promise<Bundle>` where `bundle.type === "transaction-response"`.
- **Behavior:** `POST /` with a `Bundle.type = "transaction"`. All-or-nothing: any entry failing rolls back the whole bundle. Supports FHIR conditional references via `urn:uuid:` fullUrls. Source: `packages/core/src/transaction-builder.ts`.

### operation

- **Input:** `fhir.operation(name, options?)`. `name` is positional (the first argument). `options` is `{ scope?: OperationScope; parameters?: Parameters | Record<string, unknown>; method?: "GET" | "POST" }`. `OperationScope = { kind: "system" } | { kind: "type"; resourceType } | { kind: "instance"; resourceType; id }`.
- **Output (TypeScript):** `Promise<Resource | Parameters>`.
- **Behavior:** `name` is normalised to `$`-prefixed if the caller omits it. Path is computed from `scope`: `$op`, `<RT>/$op`, or `<RT>/<id>/$op`. `method: "GET"` only works when every parameter is a primitive; complex values force POST. POST wraps a bare record as a FHIR `Parameters` resource. There is no chain. Source: `packages/core/src/operation-builder.ts:22-60`.

### fhirpath evaluate

- **Input:** `evaluate(ops: PathOp[], resource: unknown, options?: { strict?: boolean; env?: Readonly<Record<string, unknown>> }): unknown[]`. Get `ops` from `(expr as any)[Symbol.for("fhirpath.ops")]` on a `fhirpath<T>(rt)…` builder.
- **Output (TypeScript):** `unknown[]` — always a collection, even for singleton FHIRPath expressions.
- **Behavior:** Walks the AST. `env` accepts keys with or without a `%` prefix (`{ foo: 42 }` and `{ "%foo": 42 }` both resolve `%foo`). `%ucum` is hard-coded to `"http://unitsofmeasure.org"` and needs no env entry. `$this`/`$index`/`$total` are only valid inside predicate proxies and iteration frames; referencing them outside throws `FhirPathEvaluationError`. `strict: true` raises `FhirPathEvaluationError` on singleton-eval failures instead of returning `[]`. `$total` is a number inside `where`/`select`/`repeat` but a collection-accumulator inside `aggregate()`. Source: `packages/fhirpath/src/evaluator.ts:34, 40-77, 82-112`.

---

## 3. Type cheatsheet

```ts
// Generated schema — always <S extends FhirSchema>. Read from `./fhir/r4/client`.
type SchemaResourceType<S> = keyof S["resources"] & string;

// Map of resource type → map of search-param name → { type, value } discriminator.
type SearchParamsFor<S, RT> = S["searchParams"][RT];

// Narrowable FHIR reference. The generator emits narrowed unions (e.g. Reference<"Patient" | "Group">).
type Reference<T extends string = string> = { reference?: string; type?: T; identifier?: Identifier; display?: string };

// The terminal shape of every .execute() on a search builder.
type SearchResult<Primary, Included = never> = {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number;
  link?: BundleLink[];
  raw: unknown;
};

// FHIR wire bundle.
type Bundle<T = Resource> = { resourceType: "Bundle"; type: string; entry?: BundleEntry<T>[]; link?: BundleLink[]; total?: number };
type BundleEntry<T = Resource> = { fullUrl?: string; resource?: T; search?: { mode?: "match" | "include" | "outcome" }; request?: {...}; response?: {...} };

// FHIR error payload.
type OperationOutcome = { resourceType: "OperationOutcome"; issue: { severity: "fatal"|"error"|"warning"|"information"; code: string; diagnostics?: string; location?: string[]; expression?: string[] }[] };
```

---

## 4. Example prompts

### (a) Basic search

> "Search for Patients named Smith born on or after 1990-01-01, male, 10 results sorted by birthdate descending."

```ts
import { createClient } from "./fhir/r4/client";
const fhir = createClient({ baseUrl: "https://example.org/fhir" });

const result = await fhir
  .search("Patient")
  .where("name", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .where("gender", "eq", "male")
  .sort("birthdate", "desc")
  .count(10)
  .execute();

for (const patient of result.data) {
  console.log(patient.id, patient.birthDate);
}
```

### (b) _include

> "Fetch Observations and include the referenced Patient in each."

```ts
const result = await fhir
  .search("Observation")
  .where("category", "eq", "laboratory")
  .include("subject")
  .execute();

// result.data is Observation[]; result.included is (Patient | Group | Device | Location)[]
```

### (c) whereChained

> "Find Observations whose subject Patient has family name 'Smith'."

```ts
const result = await fhir
  .search("Observation")
  .whereChained("subject", "Patient", "family", "eq", "Smith")
  .execute();

// Compiles to: Observation?subject:Patient.family=Smith
```

### (d) _has reverse chain

> "Find Patients that have at least one Observation with LOINC code 1234-5."

```ts
const result = await fhir
  .search("Patient")
  .has("Observation", "subject", "code", "eq", "1234-5")
  .execute();

// Compiles to: Patient?_has:Observation:subject:code=1234-5
```

### (e) FHIRPath evaluation

> "Extract each Patient's given names where name.use is 'official'."

```ts
import { fhirpath, evaluate } from "@fhir-dsl/fhirpath";

const expr = fhirpath<Patient>("Patient").name.where("use", "official").given;
const ops = (expr as any)[Symbol.for("fhirpath.ops")];
const givenNames = evaluate(ops, patient); // string[] at runtime
```

### (f) SMART public client (standalone launch)

> "Build a SMART v2 authorise URL for a public client with PKCE and offline access."

```ts
import {
  buildAuthorizeUrl,
  generateCodeVerifier,
  codeChallengeS256,
  generateState,
  buildScopes,
  resourceScope,
  launchScope,
  openid,
  fhirUser,
  offlineAccess,
  discoverSmartConfiguration,
} from "@fhir-dsl/smart";

const smartConfig = await discoverSmartConfiguration("https://fhir.example/r4");
const verifier = generateCodeVerifier();
const challenge = await codeChallengeS256(verifier);

const url = buildAuthorizeUrl({
  smartConfig,
  clientId: "app-123",
  redirectUri: "https://app.example/cb",
  scope: buildScopes(
    openid,
    fhirUser,
    offlineAccess,
    launchScope("patient"),
    resourceScope({ context: "patient", resource: "Observation", perms: ["r", "s"] }),
  ),
  state: generateState(),
  codeChallenge: challenge,
  aud: "https://fhir.example/r4",
});
// stash `verifier` for the redirect callback; PKCE method is always S256.
```

### (g) Transaction batch write

> "Atomically create a Patient, update an Observation, and delete an Appointment."

```ts
const bundle = await fhir
  .transaction()
  .create({
    resourceType: "Patient",
    name: [{ family: "Doe", given: ["Jane"] }],
    gender: "female",
    birthDate: "1990-05-15",
  })
  .update({
    resourceType: "Observation",
    id: "obs-123",
    status: "final",
    code: { coding: [{ system: "http://loinc.org", code: "8867-4" }] },
  })
  .delete("Appointment", "appt-456")
  .execute();
// bundle.type === "transaction-response"; bundle.entry has one response per input.
```

---

## 5. Common hallucinations to avoid

Numbered in order of how fast they break: the first four fail at type-check; the fifth is a silent correctness bug.

### 1. OperationBuilder chain (G-001, G-038)

```ts
// WRONG — these methods do not exist.
const expanded = await fhir
  .operation("expand")
  .withParam("url", "http://hl7.org/fhir/ValueSet/administrative-gender")
  .withParam("count", 100)
  .asGet()
  .execute();

// RIGHT — options object, name positional.
const expanded = await fhir.operation("expand", {
  scope: { kind: "type", resourceType: "ValueSet" },
  parameters: {
    url: "http://hl7.org/fhir/ValueSet/administrative-gender",
    count: 100,
  },
  method: "GET",
}).execute();
```

### 2. AuthProvider.getAuthHeader (G-002, G-039)

```ts
// WRONG — method name and signature both off.
const provider: AuthProvider = {
  getAuthHeader: () => `Bearer ${mint()}`,
};

// RIGHT — `getAuthorization({ url, method })` with optional `onUnauthorized`.
const provider: AuthProvider = {
  async getAuthorization({ url, method }) {
    return `Bearer ${await mint(url, method)}`;
  },
  async onUnauthorized() {
    await clearCache();
  },
};
```

### 3. FhirClientConfig fields (G-005, G-037)

```ts
// WRONG — `asyncPolling`, `resourceValidators`, `profileValidators`, `schemaRegistry`, `preferReturn` do not exist.
const fhir = createClient({
  baseUrl: "...",
  asyncPolling: { pollingInterval: 2000 },
  schemaRegistry: myRegistry,
  resourceValidators: { Patient: zodSchema },
  preferReturn: "representation",
});

// RIGHT — `async`, `schemas`, and pass `prefer` per-call on `.execute({ prefer })`.
const fhir = createClient({
  baseUrl: "...",
  async: { pollingInterval: 2000, maxAttempts: 60 },
  schemas: myRegistry,
});
await fhir.search("Patient").execute({ prefer: { return: "representation" } });
```

### 4. SearchResult destructure (G-022, G-035, G-036)

```ts
// WRONG — `bundle` and `next` do not exist on SearchResult.
const { data, bundle, next } = await fhir.search("Patient").execute();
const morePatients = await fetch(next);

// RIGHT — `raw` is the full Bundle; `link` carries relations.
const { data, included, total, link, raw } = await fhir.search("Patient").execute();
const nextUrl = link?.find((l) => l.relation === "next")?.url;
// OR stream the pages entirely:
for await (const patient of fhir.search("Patient").stream()) {
  // ...
}
```

### 5. `.select(...spread)` (G-004, G-040)

```ts
// WRONG — spread form; does not type-check.
await fhir.search("Patient").select("id", "name", "birthDate").execute();

// RIGHT — single readonly array argument. Compiles to `_elements=id,name,birthDate` on the wire.
await fhir.search("Patient").select(["id", "name", "birthDate"] as const).execute();
```

### 6. Auto-POST threshold misconception (G-010)

```ts
// WRONG — reads the current limit.
const limit: number = qb.getUrlByteLimit();

// RIGHT — `getUrlByteLimit(bytes)` is a SETTER that returns a new builder with the override.
// The default threshold is 1900 UTF-8 bytes, measured via TextEncoder on `resourceType + "?" + query`.
const raised = qb.getUrlByteLimit(4000);
// `_format` and `_pretty` are kept on the URL; every other param moves to the body with
// `Content-Type: application/x-www-form-urlencoded`. `.usePost()` with no args forces POST outright.
```

### 7. `:not` treated as `ne` (G-009, G-017 related)

```ts
// WRONG — these produce different result sets. `:not` includes resources with a missing value;
// `_filter ne` excludes them. The condition-tree compiler does NOT treat them as equivalent.
await fhir.search("Patient")
  .where((eb) => eb.or([["name", "ne", "Alice"], ["name", "ne", "Bob"]]))
  .execute();

// RIGHT — use the `:not` modifier explicitly when you want null-tolerant exclusion:
await fhir.search("Patient")
  .where("name", "ne", "Alice")                       // compiles to _filter with not(...) for single-param
  .where("name", "ne", "Bob")                         // AND across different calls is fine
  .execute();
// Mixed-param OR will route through `_filter=(... or ...)`; many servers refuse `_filter`. Prefer
// AND-of-tuples (single `_param` per call) or same-param OR (comma-joined) whenever possible.
```

Also do not use:

- `ExecuteRequestOptions` fields other than `signal` (G-041). The runtime executor only accepts `{ signal?: AbortSignal }`.
- `SearchQueryBuilder` as "three-generic" (G-021). It is `<S, RT, SP, Inc, Prof, Sel>` — six parameters.
- `client.searchAll(resourceType)` (G-023). `searchAll()` takes no arguments.
- `BackendServicesConfig.tokenEndpoint` / `privateKeyJwk` / `keyId` / `audience` (G-006). The real fields are `issuer`, `privateKey` (KeyLike | JWK | Uint8Array), `kid`, and the token endpoint is discovered via `smartConfig` or overridden with a pre-fetched `SmartConfiguration`.
- `resourceScope("patient", "Observation", ["read", "search"])` (G-007). The real signature is `resourceScope({ context, resource, perms })` with `perms` as `"c" | "r" | "u" | "d" | "s"` single letters, an array of those, or `"*"`.

---

## 6. Safe generation patterns

Rules of thumb to embed in prompts or tool descriptions.

1. **Prefer typed search params.** Always prefer `.where("birthdate", "ge", "1990-01-01")` over raw `.where("_filter", ...)` or `.filter("...")`. The typed form goes through `SearchPrefixFor<P>` and will refuse invalid operator/modifier combinations at compile time. Only reach for `.filter()` when the server-side `_filter` grammar is strictly required.
2. **Never destructure `.next` or `.bundle` from `SearchResult`.** The real shape is `{ data, included, total?, link?, raw }`. For pagination, either walk `link.find(l => l.relation === "next")?.url` manually, or use `fhir.search(...).stream()` to let the builder do it, or import `paginate` / `fetchAllPages` from `@fhir-dsl/runtime`.
3. **Pass `baseUrl` plus auth directly to `createClient`.** Do not try to hand-roll an executor for normal flows — `createClient(config)` wraps `createFhirClient<GeneratedSchema>` which constructs the default `fetch`-based executor for you. Only instantiate `new FhirExecutor(config)` from `@fhir-dsl/runtime` when you need to call `executeUrl()` directly (e.g. following an off-path `next` link). That executor strips `Authorization` on cross-origin hops — do not re-add it in a `fetch` wrapper unless you know the target host is trusted.
4. **Include `schemas` only when you call `.validate()`.** Calling `.validate()` without a `schemas` registry throws `ValidationUnavailableError`. Conversely, supplying `schemas` without ever calling `.validate()` costs nothing.
5. **Keep builders immutable.** Do NOT mutate a builder you captured in a variable — every chain step returns a new instance. Re-use partial builders freely:
   ```ts
   const basePatients = fhir.search("Patient").where("active", "eq", true);
   const recentSmiths = basePatients.where("family", "eq", "Smith").count(20);
   const recentJoneses = basePatients.where("family", "eq", "Jones").count(20);
   ```
6. **Use `.compile()` in tests.** `compile()` returns a `CompiledQuery` object with `{ method, path, params, headers?, body? }` — assert on it instead of mocking `fetch`. It is a pure function and never hits the network.
7. **Respect the POST auto-upgrade.** If a query has hundreds of `_id` or `code` values, let the builder auto-flip to POST at 1900 bytes. Never try to manually shard by calling `fetch` yourself unless you also reproduce the `_format`/`_pretty` URL-retention rule.
8. **Operation names don't need the `$`.** `fhir.operation("expand", ...)` and `fhir.operation("$expand", ...)` are identical — the builder normalises the leading `$`.
9. **Prefer `PreferOptions` over raw headers.** Pass `.execute({ prefer: { return: "representation", respondAsync: true } })` instead of building `Prefer: respond-async, return=representation` by hand. `compilePreferHeader` handles the RFC 7240 comma-separated syntax.
10. **FHIRPath `$this`/`$index`/`$total` are predicate-only.** Build them via the proxy (`createPredicateProxy` internally, or the `fhirpath` root with `.where(...)`). Invoking `evaluate([{type:"var", name:"$this"}], r)` throws. Source: `packages/fhirpath/src/evaluator.ts:82-90`.
11. **SMART v2 PKCE is S256-only.** Do not emit `code_challenge_method=plain`. `buildAuthorizeUrl` hardcodes `S256` and will not honour anything else. Source: `packages/smart/src/pkce.ts:2-6`.
12. **Backend Services needs a JWK/KeyLike private key, not PEM.** Convert PEM with `jose.importPKCS8` / `importJWK` before passing to `BackendServicesConfig.privateKey`.
13. **Non-enumerable response metadata is real.** After `.create(...)` or `.update(...)` returns, `resource.location` and `resource.etag` exist but do NOT show up in `JSON.stringify`. If you need to persist them, copy them out first. Source: `packages/runtime/src/executor.ts:95-110`.
14. **Condition-tree compile routing matters.** The `where(cb)` callback compiles three ways: all-AND-tuples → per-param individual entries; all-OR same-param all-`eq` → a single comma-joined param (FHIR §3.2.1.5.7); otherwise → `_filter=<expression>`. Many servers reject `_filter`, so design your conditions to stay in the first two buckets when possible. Source: `packages/core/src/condition-tree.ts:9-39`.
