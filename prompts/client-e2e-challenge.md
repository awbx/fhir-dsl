# Task: Design and implement a complex end-to-end test pipeline for a type-safe FHIR client

You are working on `fhir-dsl`, a TypeScript monorepo (Kysely-inspired) that ships
a type-safe FHIR client. Your job is to benchmark the **client itself** — the
query builder, transaction builder, executor, paginator, error handling, and
all the typed-narrowing paths that flow from a generated `Schema` into user
code.

You MUST NOT read the existing test or product code. Everything you need to
design the suite is in this prompt; produce the test architecture, the
fixtures, the mock server, and the assertions from first principles.

================================================================================
THIS IS A BENCHMARK — TAG YOUR WORK
================================================================================

Head-to-head benchmark across different AI models. Design your OWN architecture;
do not mimic a prescribed shape, defend your choices in the report at the end.

**Namespace every artifact you produce by your AI name/version.** Replace
`<agent-id>` below with something like `claude-opus-4-6`, `gpt-5`,
`gemini-2.5-pro` — lowercase, hyphen-separated, no spaces.

Put ALL new files (test files, fixtures, mock-server helpers, generated
"golden" schemas, helper scripts, README) under:

    packages/runtime/test/e2e-agents/<agent-id>/

> If your design needs typed test resources, you may either (a) hand-roll a
> minimal `FhirSchema` type fixture inside your agent directory, or (b) reuse
> the terminology benchmark's golden bundle if it already exists at
> `packages/generator/test/fixtures/generated-golden/` — say which you chose
> and why in your README.

Include a top-level `README.md` for your agent-id directory describing your
architecture, why you chose it, how to run it in isolation, and your
self-reported coverage against the success criteria.

If you must change shared config (vitest.config.ts, tsconfig, biome excludes,
CI workflow), keep changes minimal and scoped so multiple agents' suites can
coexist in the repo without interfering.

### Work in an isolated git worktree on a branch named after your agent-id

Do not commit on `main`. Before you start, create a worktree + branch named
exactly after your `<agent-id>`, and do all work there:

```bash
# from the repo root
git worktree add ../fhir-dsl-<agent-id> -b <agent-id>
cd ../fhir-dsl-<agent-id>
```

Examples: branch `codex` worktree `../fhir-dsl-codex`, branch `claude-opus-4-6`
worktree `../fhir-dsl-claude-opus-4-6`. This isolates parallel agent runs and
makes the final benchmark a clean diff per branch.

When you're done, leave your branch unmerged — the human reviewer will
checkout each agent's branch in turn to score them. Don't open a PR, don't
merge, don't rebase onto main. Just commit on your branch and stop.

**Coverage target: 100% of the client surface area listed below, end-to-end,
with both runtime AND type-level assertions.**

================================================================================
WHAT THE CLIENT IS (AND ISN'T)
================================================================================

The client is a **thin, typed HTTP wrapper** over a FHIR REST endpoint. It
does not interpret responses semantically — it compiles typed query builder
calls into HTTP requests, sends them via a configurable `fetch`, and returns
the parsed JSON shaped by the user's schema.

There is NO real FHIR server. Your tests must mock the network. Use whatever
you like (msw, undici MockAgent, a hand-rolled `fetch` stub, a real localhost
HTTP server) but document the choice.

================================================================================
PROJECT SHAPE (just enough to test from the outside)
================================================================================

Monorepo packages (pnpm workspace):

- packages/types        — FHIR primitives, datatypes, Bundle, BundleEntry,
                          Resource, SearchParam, etc.
- packages/core         — Query builder, transaction builder, FhirClient class,
                          FhirRequestError, types (FhirSchema, SearchParamFor,
                          IncludeFor, RevIncludeFor, ProfileFor).
- packages/runtime      — Re-exports + runtime helpers.
- packages/generator    — Emits a typed `Schema` from FHIR spec; out of scope
                          for this benchmark (a different prompt covers it).

================================================================================
THE CLIENT API SURFACE — COMPLETE
================================================================================

### 1. Construction

```ts
import { createFhirClient, type FhirClientConfig, FhirRequestError }
  from "@fhir-dsl/core";

interface FhirClientConfig {
  baseUrl: string;
  auth?: { type: "bearer" | "basic"; credentials: string };
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;       // injectable for testing
}

const client = createFhirClient<MySchema>({ baseUrl: "https://fhir.example.com" });
```

`MySchema` is a `FhirSchema`:

```ts
interface FhirSchema {
  resources:    Record<string, unknown>;            // RT -> resource type
  searchParams: Partial<Record<string, Record<string, SearchParam>>>;
  includes:     Partial<Record<string, Record<string, string>>>;
  revIncludes:  Partial<Record<string, Record<string, string>>>;
  profiles:     Partial<Record<string, Record<string, unknown>>>;
}
```

### 2. Search query builder — `client.search("Patient", profile?)`

Returns `SearchQueryBuilder<S, RT, SP, Inc, Prof>`. Fluent / immutable —
each method returns a new builder. Methods:

- `.where(param, op, value)`
  - `param` is constrained to keys of the resource's `searchParams`
  - `op` is constrained to the search-param TYPE's allowed prefixes/modifiers:
    - **date** / **quantity**: `"eq" | "ne" | "gt" | "ge" | "lt" | "le" | "sa" | "eb" | "ap"`
    - **number**: `"eq" | "ne" | "gt" | "ge" | "lt" | "le"`
    - **string**: `"eq" | "contains" | "exact"`
    - **token**: `"eq" | "not" | "of-type" | "in" | "not-in" | "text" | "above" | "below"`
    - **reference**: `"eq"`
    - **uri**: `"eq" | "above" | "below"`
  - `value` is the param's `value` type (e.g. `TokenParam<"male"|"female">["value"]`)

- `.whereComposite(param, values)` — composite search params; values is an
  object keyed by the composite components.

- `.include(param)` — adds an `_include`. The included resource type is
  inferred from `IncludeFor<S, RT>[param]` and added to the result's `Included`
  union, so `result.included` is typed.

- `.revinclude(sourceResource, param)` — `_revinclude`. Adds `sourceResource`
  to the included union.

- `.whereChained(refParam, targetResource, targetParam, op, value)` — FHIR
  chained search syntax `?subject:Patient.name=Smith`. Param chains through a
  reference and constrains a search param on the target resource.

- `.has(sourceResource, refParam, searchParam, op, value)` — FHIR `_has`
  reverse chaining: "find Patients where some Observation references them
  with subject= and that observation has code=X".

- `.sort(param, "asc" | "desc")`
- `.count(n)` — sets `_count` (page size)
- `.offset(n)` — sets a starting offset

- `.compile()` returns `CompiledQuery`:
  ```ts
  interface CompiledQuery {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;          // e.g. "Patient"
    params: { name: string; value: string | number | boolean; prefix?: string }[];
    body?: unknown;
  }
  ```

- `.execute()` returns `Promise<SearchResult<Primary, Included>>`:
  ```ts
  interface SearchResult<Primary, Included = never> {
    data: Primary[];
    included: [Included] extends [never] ? [] : Included[];
    total?: number;
    link?: { relation: string; url: string }[];
    raw: unknown;
  }
  ```
  — `data` and `included` are split out from a Bundle response by `entry.search.mode`
  (or by resourceType matching, depending on impl). Verify in your tests.

- `.stream(options?: { signal?: AbortSignal })` returns
  `AsyncIterable<Primary>`. It must follow the Bundle's `link[rel="next"]`
  URL until exhausted, yielding each resource individually. Cancellable via
  `AbortSignal`.

### 3. Read builder — `client.read("Patient", id)`

Returns `ReadQueryBuilder` with `.compile()` and `.execute()`. Compiles to
`GET <baseUrl>/Patient/<id>`. Executes and returns the typed resource.

### 4. Transaction builder — `client.transaction()`

```ts
interface TransactionBuilder<S> {
  create(resource): TransactionBuilder<S>;
  update(resource): TransactionBuilder<S>;        // requires resource.id
  delete(resourceType, id): TransactionBuilder<S>;
  compile(): Bundle;                              // type: "transaction"
  execute(): Promise<Bundle>;                     // POSTs to baseUrl root
}
```

Resources passed to `.create()` and `.update()` are typed against
`S["resources"][RT]`. `.update()` throws synchronously if `resource.id` is
missing.

### 5. Errors

```ts
class FhirRequestError extends Error {
  status: number;
  statusText: string;
  operationOutcome: unknown;       // parsed JSON body, or null on parse failure
}
```

Thrown by every `.execute()` call when the response is not `2xx`.

### 6. HTTP request shape (what reaches the server)

- Method per operation: GET (search/read), POST (create/transaction),
  PUT (update), DELETE (delete)
- Headers always include:
  - `Accept: application/fhir+json`
  - `Content-Type: application/fhir+json` (on the executor; pagination uses
    only Accept)
  - `Authorization: Bearer <creds>` or `Basic <creds>` if `config.auth` set
  - Anything in `config.headers`
- Search params are appended to the URL with prefix concatenation:
  `?date=ge2024-01-01` (NOT `?date=ge&date=2024-01-01`)
- Pagination URLs from `link[rel="next"]` are absolute URLs and used verbatim
  via a separate URL executor (does not re-resolve against baseUrl).

================================================================================
THE TEST GAP YOU ARE CLOSING
================================================================================

There is no end-to-end coverage today that proves the client behaves correctly
against a realistic mock server. The risk areas:

- **URL compilation correctness**: every search modifier, every prefix, every
  chain/has/composite syntax must compile to the exact string FHIR servers
  expect. A wrong prefix concatenation (e.g. `?date=ge&date=2024-01-01`) is a
  silent server-side mis-query that returns nonsense.
- **Type narrowing flow**: `client.search("Patient").include("organization")
  .execute()` must produce `result.included: Organization[]` — not
  `Resource[]`. Same for revinclude, chained, has.
- **Pagination**: `.stream()` follows `link[rel="next"]` until exhausted;
  must yield in order, must respect AbortSignal, must not double-fetch the
  first page.
- **Auth header injection**: bearer + basic, with header merging precedence
  documented but never proven.
- **Transaction Bundle compilation**: every entry has the right method+url,
  resource bodies are preserved, `.update()` without an id throws.
- **Error path**: non-2xx → `FhirRequestError` with parsed `operationOutcome`,
  parse failure → `operationOutcome: null` (not a thrown parse error).

Your job: prove all of this, end-to-end, with both runtime tests against a
mocked HTTP layer AND type-level tests via Vitest's `typecheck` mode.

================================================================================
YOUR DELIVERABLE: AN E2E PIPELINE YOU DESIGN YOURSELF
================================================================================

You design the architecture. Reference patterns that have worked elsewhere in
this repo (use them, improve on them, or replace them — defend your choice):

1. **Mock-server layer**: spin up an in-process HTTP server (or use msw /
   undici MockAgent) that records every request and returns scripted Bundle
   responses. Tests inject `fetch` via `FhirClientConfig.fetch` OR point
   `baseUrl` at the mock server.
2. **Runtime e2e tests** (`*.test.ts`): exercise every operation against the
   mock, assert on (a) the exact HTTP request the server received, and
   (b) the typed result shape returned by the client.
3. **Type-level tests** (`*.test-d.ts`, `typecheck: true` in vitest config):
   prove the typed narrowing — `result.data` is `Patient[]`, `result.included`
   is `(Organization | Practitioner)[]`, `.where("birthdate", "ge", ...)` is
   accepted, `.where("birthdate", "contains", ...)` is `@ts-expect-error`,
   `.where("name", "ge", ...)` is `@ts-expect-error`.
4. **Integration of the type tests against a checked-in golden Schema** so
   tests don't depend on the generator running first.

What you build MUST cover:

| Surface area | Runtime | Type-level |
| --- | --- | --- |
| `.where()` with every search-param TYPE × every legal modifier | URL compiled correctly | invalid op rejected |
| `.where()` with terminology-narrowed token values | accepts known, sends string verbatim | rejects unknown |
| `.whereComposite()` | composite syntax compiled correctly | values typed by components |
| `.include()` × N chains | adds `_include`, included split into typed array | `result.included` typed |
| `.revinclude()` | adds `_revinclude` | included typed |
| `.whereChained()` | `?subject:Patient.name=…` syntax exact | targetParam typed |
| `.has()` | `?_has:Observation:subject:code=…` syntax exact | searchParam typed |
| `.sort()`, `.count()`, `.offset()` | URL params correct | sort param keys constrained |
| `.compile()` standalone (no execute) | returns expected CompiledQuery shape | return type stable |
| `.execute()` happy path | parses Bundle.entry into data/included | typed result |
| `.execute()` non-2xx | throws FhirRequestError with status, statusText, OO | — |
| `.execute()` non-JSON body | OO is null, no thrown parse error | — |
| `.stream()` single page | yields all entries | yields typed primary |
| `.stream()` multi-page | follows link.next, yields in order | — |
| `.stream()` AbortSignal | stops cleanly mid-iteration | — |
| `client.read()` | GET /RT/id, returns parsed body | result typed by RT |
| `client.transaction()` create/update/delete | Bundle compiled correctly, POST to root | resource typed by RT |
| `transaction().update()` without id | throws synchronously | — |
| `auth: bearer` | Authorization header set | — |
| `auth: basic` | Authorization header set | — |
| `config.headers` | merged into every request | — |
| pagination URL executor | uses absolute URL verbatim, only Accept header | — |
| `Accept` / `Content-Type` always set | header assertions on every request | — |

Aim for **at least one runtime test and one type-level test per row** where
both columns apply.

================================================================================
DESIGN CONSTRAINTS
================================================================================

- The client must be tested **as a black box** through its public exports.
  Don't reach into `#executor` private fields — go through the mock fetch.
- Type tests must NOT depend on the runtime suite passing.
- Provide a `README.md` in your `<agent-id>/` directory with: architecture,
  rationale, run instructions, coverage matrix, regression-probe results.
- Wire your suite into the existing CI pipeline (or document why you didn't).

================================================================================
SUCCESS CRITERIA
================================================================================

You have succeeded if ALL of these deliberate regressions produce a specific,
identifiable test failure in YOUR suite:

1. Change the search-param URL serializer to emit `?date=ge&date=2024-01-01`
   instead of `?date=ge2024-01-01` → URL-compilation tests fail and name the
   wrong format.
2. Make `.execute()` throw on non-2xx WITHOUT setting `operationOutcome` → an
   error-path test fails and identifies the missing field.
3. Break `.include()` so included resources land in `data` instead of
   `included` → a result-shape test fails and a type test fails.
4. Make `.stream()` re-fetch page 1 instead of following `link.next` → a
   pagination test fails and reports duplicate IDs / wrong page count.
5. Allow `.update(resource)` without an id (silently sends PUT to `/RT/`) →
   a transaction-builder test fails.
6. Drop the `Accept: application/fhir+json` header → a header-assertion test
   fails on every request.
7. Allow `.where("name", "ge", "Smith")` (string param with date prefix) →
   a type test reports the missing `@ts-expect-error`.
8. Stop AbortSignal handling in `.stream()` → an abort test hangs/fails.

================================================================================
FINAL REPORT (put this in your `<agent-id>/README.md`)
================================================================================

1. **Your agent-id**: `<claude-opus-4-6 / gpt-5 / gemini-2.5-pro / …>`
2. **Architecture you chose**: 3–6 sentences. Mock-server choice and why.
   How you organized runtime vs type-level. How you got typed Schema
   fixtures.
3. **Test counts per layer / per category**: layer name → number of tests →
   what invariant they prove.
4. **Coverage matrix**: every row of the surface-area table above × runtime ×
   type-level. List the test file:line that covers each cell. Any unchecked
   cell = incomplete; explain.
5. **Regression-probe results**: show the verbatim failure output for each of
   the 8 success-criteria regressions.
6. **What you chose to do differently** vs. the reference patterns, and why.
7. **Bugs you found in the client** (if any) while building the suite — file
   them as a list.
8. **Known gaps / limitations** in your suite.

You are benchmarked on: correctness, coverage breadth, architectural judgment,
clarity of failure messages, and bugs surfaced.
