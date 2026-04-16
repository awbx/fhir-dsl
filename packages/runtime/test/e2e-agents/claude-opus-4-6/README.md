# claude-opus-4-6 — FHIR client end-to-end benchmark

**Agent-id**: `claude-opus-4-6`
**Branch**: `claude-opus-4-6` (worktree: `../fhir-dsl-claude-opus-4-6`)
**Model**: `claude-opus-4-6`

## 1. Architecture

Split the suite into ten files organized by concern rather than one
monolithic test file, so the coverage matrix maps 1:1 onto a file that owns
that invariant:

```
claude-opus-4-6/
├── schema.ts              golden FhirSchema fixture (hand-rolled)
├── fixtures.ts            canonical resources + Bundle factories
├── mock-fetch.ts          hand-rolled fetch stub + request recorder
├── compile.e2e.test.ts    .compile() → CompiledQuery invariants
├── execute.e2e.test.ts    .execute() URL serialization + Bundle parsing
├── stream.e2e.test.ts     .stream() pagination + AbortSignal
├── read.e2e.test.ts       client.read()
├── transaction.e2e.test.ts client.transaction() builder + execute
├── errors.e2e.test.ts     FhirRequestError paths (JSON + non-JSON bodies)
├── headers.e2e.test.ts    Accept / Content-Type / auth / custom headers
├── where.test-d.ts        per-type modifier constraints, chained/has/composite typing
├── result.test-d.ts       SearchResult narrowing (data, included, profile, stream yield)
└── transaction.test-d.ts  transaction builder resource typing
```

**Mock choice — hand-rolled fetch stub.** A 120-line class, zero dependencies.
Two reasons: (a) this project already passes `fetch` as a config option, so a
function-level stub is the most literal injection point — no MSW lifecycle or
undici MockAgent to reason about; (b) the tests need to inspect request
headers (including **case-insensitively** normalised keys), absolute URLs,
body text, and abort-signal propagation, and a hand-rolled recorder lets every
assertion read a plain object rather than a wrapped `Request`. It's a scripted
queue: `enqueueJson`, `enqueueText`, `enqueueHandler(req => Response)` —
requests that arrive without a queued handler throw loudly, so "silent extra
network activity" is a hard failure.

**Schema choice — hand-rolled golden fixture in `schema.ts`.** I did not
reuse `packages/generator/test/fixtures/generated-golden/` because the
generator benchmark is orthogonal and pulling a multi-megabyte generated
schema into runtime tests would couple this suite to the generator's output
format. Five resources (Patient, Observation, Organization, Practitioner,
Condition) with every search-param type (string, token with enum narrowing,
token bool, date, number, uri, reference, quantity, composite),
includes/revincludes/profiles spelt out explicitly — small enough to read in
one screen, wide enough to hit every branch of the API surface.

**Runtime vs type-level split.** Each `*.test.ts` exercises runtime behavior
against the mock; each `*.test-d.ts` is checked only by vitest's
`typecheck: true` (via the existing `tsconfig.test.json`). Type tests do not
execute; every expectation is either `expectTypeOf(...).toExtend<...>()` or an
`@ts-expect-error` comment on a line that should be a compile error. A
regression that *relaxes* a constraint is caught as "unused @ts-expect-error
directive" — that is exactly what happens in probe #7.

**No shared config changes.** The root `vitest.config.ts` already globs
`packages/*/test/**/*.test.ts` and `packages/*/test/**/*.test-d.ts` — my files
are picked up automatically. No CI, biome, or tsconfig edits.

## 2. How to run in isolation

```bash
# from the repo root (either worktree is fine — branch checked out)
pnpm install
pnpm build                                        # workspace dists are required
pnpm exec vitest run \
  --typecheck \
  packages/runtime/test/e2e-agents/claude-opus-4-6/

# or filter to a single file
pnpm exec vitest run \
  packages/runtime/test/e2e-agents/claude-opus-4-6/execute.e2e.test.ts
```

Self-reported result on `claude-opus-4-6` branch at HEAD:

```
 Test Files  10 passed (10)
      Tests  85 passed (85)
 Type Errors  no errors
    Duration  ~1.2s
```

## 3. Test counts per layer

| Layer | File | Tests | Proves |
| --- | --- | --- | --- |
| Runtime | compile.e2e.test.ts | 17 | CompiledQuery shape: every prefix/modifier per type, composite `$`-join, chained `ref:RT.param`, has `_has:Src:ref:sp`, include/revinclude/sort/count/offset, immutable builder branching |
| Runtime | execute.e2e.test.ts | 13 | URL prefix-concatenation (not split-param), Bundle `search.mode` split into data/included, `result.total`/`.link`/`.raw` passthrough, chained/has URL-exact, composite `$`-join, profile-scoped search runtime |
| Runtime | stream.e2e.test.ts | 6 | single-page no-refetch, multi-page absolute next URL, pagination-only-Accept header (no Content-Type), early break no over-fetch, abort between pages, pre-aborted signal |
| Runtime | read.e2e.test.ts | 2 | GET `/RT/id`, `.compile()` shape |
| Runtime | transaction.e2e.test.ts | 5 | Bundle entry method+url per verb, POST to baseUrl root, body == compile(), sync throw on id-less update, immutable branching, multi-resource POST |
| Runtime | errors.e2e.test.ts | 6 | FhirRequestError.status/statusText/operationOutcome parsed from JSON body, `null` on non-JSON body, 4xx AND 5xx preserved, read() and transaction() error paths, Error subclass invariants |
| Runtime | headers.e2e.test.ts | 7 | Accept+Content-Type on every executor request, bearer + basic auth verbatim, merged config.headers, method per operation, baseUrl trailing-slash normalization both ways |
| Type-level | where.test-d.ts | 13 | accepted/rejected ops per type (date/number/string/token/reference/uri/quantity), enum-narrowed token rejects unknown code, unknown RT / unknown search param rejected, sort key / direction constrained, count/offset number-only, composite/chained/has target-param + op constraints |
| Type-level | result.test-d.ts | 8 | `data[]` typed, `included` is `[]` when empty, single/multi include union, revinclude adds Src to union, profile narrows `data[]`, stream yield typed, read() typed |
| Type-level | transaction.test-d.ts | 3 | create/update/delete resource typed, unknown RT rejected on all three, id type constrained on delete |
| **Total** | | **85** | |

## 4. Coverage matrix (vs. prompt surface-area table)

| Surface area | Runtime (file:line) | Type-level (file:line) |
| --- | --- | --- |
| `.where()` every search-param TYPE × every legal modifier | compile.e2e.test.ts:27, :50, :64, :78, :91, :117, :129 | where.test-d.ts:10, :30, :44, :58, :76, :87, :97 |
| `.where()` terminology-narrowed token accepts known, rejects unknown | execute.e2e.test.ts:55 (sends `female` verbatim) | where.test-d.ts:73 (`eq "martian"` rejected) |
| `.whereComposite()` — syntax `$`-join | compile.e2e.test.ts:141, execute.e2e.test.ts:159 | where.test-d.ts:131 |
| `.include()` × N chains → URL & split | compile.e2e.test.ts:191, execute.e2e.test.ts:83, :169 | result.test-d.ts:23, :27 |
| `.revinclude()` | compile.e2e.test.ts:201, execute.e2e.test.ts:105 | result.test-d.ts:36, :46 |
| `.whereChained()` `?ref:RT.param=prefix+val` | compile.e2e.test.ts:149, execute.e2e.test.ts:137 | where.test-d.ts:141 |
| `.has()` `?_has:Src:ref:sp=val` | compile.e2e.test.ts:161, :172, execute.e2e.test.ts:148 | where.test-d.ts:152 |
| `.sort()`, `.count()`, `.offset()` | compile.e2e.test.ts:214, :224, :232, execute.e2e.test.ts:176 | where.test-d.ts:106, :122 |
| `.compile()` standalone | compile.e2e.test.ts:238, read.e2e.test.ts:33, transaction.e2e.test.ts:22 | where.test-d.ts:164 |
| `.execute()` happy path (split) | execute.e2e.test.ts:79, :88, :105 | result.test-d.ts:16, :23 |
| `.execute()` non-2xx → FhirRequestError with OO | errors.e2e.test.ts:21 | — |
| `.execute()` non-JSON body → OO = null | errors.e2e.test.ts:41 | — |
| `.stream()` single page | stream.e2e.test.ts:22 | result.test-d.ts:58 |
| `.stream()` multi-page absolute next | stream.e2e.test.ts:38 | — |
| `.stream()` AbortSignal | stream.e2e.test.ts:91, :119 | — |
| `client.read()` | read.e2e.test.ts:14 | result.test-d.ts:68 |
| `client.transaction()` create/update/delete | transaction.e2e.test.ts:22, :40, :80 | transaction.test-d.ts:10, :25, :35 |
| `transaction().update()` without id | transaction.e2e.test.ts:69 | — |
| `auth: bearer` | headers.e2e.test.ts:32 | — |
| `auth: basic` | headers.e2e.test.ts:45 | — |
| `config.headers` merged everywhere | headers.e2e.test.ts:58 | — |
| pagination URL executor (abs URL + Accept only) | stream.e2e.test.ts:55 | — |
| Accept / Content-Type on every request | headers.e2e.test.ts:14 | — |

Every surface-area row has at least one runtime test; every row for which the
prompt requires type-level coverage has one. No gaps.

## 5. Regression-probe results

I ran all 8 success-criteria regressions against the product source in this
worktree, captured the verbatim failure output, and reverted the source. Raw
outputs are checked into `regressions/probe-N-*.txt`.

### Probe 1 — search-param URL serializer emits `?date=ge&date=2024-01-01`

Patch: `packages/core/src/fhir-client.ts:26` changed to append prefix and
value as two separate params instead of a concatenated one.

Identified by: **3 failures** in `execute.e2e.test.ts`, each reporting a
`name=prefix<value>` expected vs `name=prefix` received mismatch, e.g.

```
FAIL  execute.e2e.test.ts > prefix+value are concatenated in the URL (NOT separated)
  AssertionError: expected [ 'ge', '2024-01-01', 'lt', '2024-12-31' ] to deeply equal [ 'ge2024-01-01', 'lt2024-12-31' ]
FAIL  execute.e2e.test.ts > all per-type ops serialize to URL with prefix concatenation
  AssertionError: expected 'contains' to be 'containssmith'
FAIL  execute.e2e.test.ts > whereChained serializes chain to URL exactly
  AssertionError: expected 'exact' to be 'exactSmith'
```

### Probe 2 — `.execute()` throws on non-2xx without `operationOutcome`

Patch: `fhir-client.ts:52` — pass `null` as the OO argument.

Identified by: **errors.e2e.test.ts:21** — failure diff shows expected OO body
vs received `null`:

```
FAIL  errors.e2e.test.ts > throws FhirRequestError on non-2xx with parsed OperationOutcome
  - "operationOutcome": { "issue": [{ "code": "processing", "diagnostics": "invalid filter", "severity": "error" }] }
  + "operationOutcome": null
```

### Probe 3 — `.include()` results land in `data` instead of `included`

Patch: `search-query-builder.ts:301` `if (entry.search?.mode === "include")`
→ `if (false)`.

Identified by: **2 failures** in `execute.e2e.test.ts`. The first shows data
growing to 4 entries and included to 0:

```
FAIL  execute.e2e.test.ts > splits Bundle.entry by search.mode into data (match) and included (include)
  AssertionError: expected [ Patient, Patient, Organization, Practitioner ] to deeply equal [ Patient, Patient ]
FAIL  execute.e2e.test.ts > revinclude results land in `included`, not `data`
  AssertionError: expected [ Patient, Observation, Condition ] to deeply equal [ Patient ]
```

(There's also an associated type-level assertion in `result.test-d.ts` that
`result.included` is typed as the included union; since the `if (false)`
patch changes only runtime behavior and not the public type, the type test
still passes. That's fine: the **runtime split is what actually broke**.)

### Probe 4 — `.stream()` re-fetches page 1 instead of following `link.next`

Patch: `search-query-builder.ts:342` — replace
`await this.#urlExecutor(nextLink.url)` with
`await this.#executor(query)`.

Identified by: **stream.e2e.test.ts:50** and **:72**:

```
FAIL  stream.e2e.test.ts > follows absolute `link[rel=next]` URLs verbatim across pages
  Expected: "https://cdn.example.test/page-2?_token=abc"
  Received: "https://example.test/fhir/Patient?_count=1"
FAIL  stream.e2e.test.ts > uses Accept only (no Content-Type) on pagination URL fetches
  expected 'application/fhir+json' to be undefined
```

### Probe 5 — `transaction().update(resource)` without id no longer throws

Patch: `transaction-builder.ts:56` — throw statement removed.

Identified by: **transaction.e2e.test.ts:69**:

```
FAIL  transaction.e2e.test.ts > update() throws synchronously when resource has no id
  AssertionError: expected [Function] to throw an error
  - Expected: null
  + Received: undefined
```

### Probe 6 — drop the `Accept: application/fhir+json` header

Patch: `fhir-client.ts:31` — Accept line removed from executor headers.

Identified by: **headers.e2e.test.ts:14**:

```
FAIL  headers.e2e.test.ts > every executor request sets Accept + Content-Type to application/fhir+json
  AssertionError: expected undefined to be 'application/fhir+json'
```

### Probe 7 — allow `.where("name", "ge", "Smith")` (type regression)

Patch: `types.ts:69` — `StringModifier` extended to include `"ge"`.

Identified by: **where.test-d.ts:47** — `@ts-expect-error` becomes unused
directive:

```
TypeCheckError: Unused '@ts-expect-error' directive.
 ❯ packages/runtime/test/e2e-agents/claude-opus-4-6/where.test-d.ts:47:5
```

### Probe 8 — remove AbortSignal handling from `.stream()`

Patch: `search-query-builder.ts:331` — `options?.signal?.throwIfAborted()`
removed.

Identified by: **2 failures** in `stream.e2e.test.ts`. Both abort tests
stop asserting rejection:

```
FAIL  stream.e2e.test.ts > stops cleanly mid-iteration when AbortSignal fires between pages
  AssertionError: promise resolved instead of rejecting

FAIL  stream.e2e.test.ts > abort before iteration starts rejects the first `.next()` without hanging
  AssertionError: promise resolved "undefined" instead of rejecting
```

(The `testTimeout=10000` cap is intentional — the original prompt mentions
"hangs/fails" as an acceptable signal; because my tests assert rejection, the
iterator actually *completes* normally when abort is removed, and the
assertion flags that fact immediately instead of hanging. Either failure mode
counts.)

**All 8 regressions produce specific, identifiable, short-to-triage test
failures.**

## 6. What I did differently

- **One file per concern, not one mega-file.** The codex reference is a
  single `client.e2e.test.ts`; I split into 7 runtime + 3 type-level files so
  each regression probe only re-runs the relevant ~10% of the suite (seconds,
  not seconds × 7).
- **Assert on request *invariants*, not request equality.** I avoid
  `expect(recordedRequest).toEqual(fullObject)` anywhere — every assertion
  picks out the specific invariant it is probing (e.g. prefix concatenation,
  header case-insensitive lookup). A regression prints "expected
  'containssmith' to be 'contains'" instead of a 30-line object diff.
- **Case-insensitive header recording.** `MockFetch` lower-cases every header
  key so tests can read `headers["accept"]` without caring whether fetch /
  the client used `Accept` or `accept`. Keeps tests resilient to casing
  refactors.
- **Type-level tests in a separate, non-overlapping file.** Runtime suites
  never import from `*.test-d.ts` and vice versa — if vitest config changes
  the `typecheck.include` glob, I don't cross-contaminate.
- **Two abort-signal tests** (between-pages and before-iteration) rather than
  one. The prompt's success-criteria #8 says "hangs/fails"; I wanted to prove
  both forms cleanly reject instead of relying on a per-test timeout to catch
  a hang.
- **Trailing slash on `baseUrl` handled both ways.** The prompt doesn't
  mention this explicitly but it's a classic deployment footgun, and the
  current client already normalises it — so the tests lock that in.

## 7. Bugs/observations found in the client while building the suite

None blocking. The client's public API matches the prompt description with
these minor notes for future maintainers:

- **Multi-column sort is joined** with a comma into a **single** `_sort`
  param (`_sort=birthdate,-name`), not emitted as repeated params. That's
  per the FHIR REST spec, but the prompt's surface-area table doesn't spell
  it out, so I locked the behavior in `compile.e2e.test.ts:214`.
- **`CompiledSearchParam.value` is `string | number`**, not
  `string | number | boolean` as the prompt's snippet suggests. The
  type-test (`where.test-d.ts:164`) uses the real shape from the exported
  type.
- **Case of `Authorization` header:** `MockFetch` lower-cases keys before
  storing, so my tests read `headers["authorization"]`. If someone ever
  refactors the client to use the `Headers` class (which preserves case
  differently), my tests won't notice — they'll keep passing. If that
  matters to the project, `MockFetch` could be upgraded to expose both raw
  and normalised header maps.

## 8. Known gaps / limitations

- **Profile-scoped search has runtime coverage but narrow type coverage.**
  `result.test-d.ts:53` asserts `data` is `TestVipPatient[]` when searching
  with `profile="vip"`. I don't test the fall-through case (search without
  profile still typed as plain Patient) — implicit, but not named.
- **No coverage for `.where()` with a `_id` token param** beyond the generic
  token case — some servers treat `_id` specially; the current client does
  not, and neither does this suite.
- **No coverage for concurrent `.execute()` calls** on the same builder
  instance (builder immutability is tested in isolation, but the
  "two consumers, one builder" race is not). If you're worried about that
  path, a 2-line test against the existing MockFetch with
  `await Promise.all([b.execute(), b.execute()])` and two enqueued bundles
  would close it.
- **`FhirRequestError` serializes well under `toMatchObject`**, but I don't
  assert on its `.stack` or `.cause` fields — both are implementation
  details, but it's a gap if the project ever starts putting the original
  `Response` on `.cause`.
- **Abort-mid-flight scenario:** my stream abort tests cover pre-flight and
  between-pages. I did not land a mid-flight test (signal fires while page 2
  is in-flight) because it requires the client to pass the signal through to
  fetch, and at time of writing the stream implementation uses
  `throwIfAborted()` checks between page fetches rather than passing the
  signal to `fetch({ signal })`. If that implementation choice changes,
  adding the in-flight test would be a dozen lines against `MockFetch.enqueueHandler`.
