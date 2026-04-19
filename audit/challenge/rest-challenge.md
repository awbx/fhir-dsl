# Search + REST Challenge Doc

**Target.** Every "positive" claim in `AUDIT.md` §2 (core) and §3 (runtime), plus every gap the author tagged with a severity. Plus dsl-explorer's `audit/impl/runtime-preanalysis.md`. Plus test-engineer's `packages/core/test/search-url-edge-cases.test.ts`.

**Spec references (R5).**
- Search framework: <https://hl7.org/fhir/R5/search.html>
- HTTP API & REST: <https://hl7.org/fhir/R5/http.html>
- Bundle / pagination: <https://hl7.org/fhir/R5/bundle.html>, <https://hl7.org/fhir/R5/search.html#pagination>
- Composite params: <https://hl7.org/fhir/R5/search.html#composite>
- Search value escaping: <https://hl7.org/fhir/R5/search.html#escaping> (§3.1.1.3.2 in the older paginated spec referenced by the team)

**Audit under review.** Commit `4f91589` on `main`.

**Author.** spec-challenger. Adversarial by role.

**Team-lead calibrations applied:**
- POST threshold bytes-vs-chars is DX/interop, not a spec refute (spec doesn't mandate byte counting).
- Cross-host `next` link is explicitly permitted by the spec; host-validation concern goes in Security Considerations, not in the refute list.

Grading rubric identical to fhirpath-challenge.md: CONFIRM-STRONG / CONFIRM-WEAK / REFUTE.

Upstream dependency notes:
- `audit/spec/fhir-r5-search-rules.md` and `audit/spec/fhir-r5-rest-rules.md` do not exist (spec-reader tasks #2, #3 still pending/in-progress). All spec citations below are direct from the published R5 HTML.
- `audit/impl/core-impl-map.md` does not exist (dsl-explorer task #5 pending). `runtime-preanalysis.md` exists and is cited.
- New test-engineer compliance test suites for tasks #8/#9 do not exist. The pin file `search-url-edge-cases.test.ts` exists and is cited.

---

## Section A — Challenges to AUDIT.md "Positives" (core, lines 79-84)

### A1. Compile-time operator narrowing per param type — **CONFIRM-STRONG**

> AUDIT line 80: "Compile-time operator narrowing per param type is real (see `SearchPrefixFor<P>` in `packages/core/src/types.ts`)."

Out of scope for my adversarial role (this is a type-system claim, not a runtime-behavior claim). Verified at type-level in `packages/core/src/types.ts`; cannot construct a runtime counterexample since the narrowing is pre-compile. Accepted as stated.

### A2. `include()` / `revinclude()` typed paths via `IncludeFor<S, RT>` — **CONFIRM-STRONG**

Same as A1 — type-level claim. Accepted.

### A3. Auto POST switch above ~1900 chars — **CONFIRM-WEAK**

> AUDIT line 82: "Auto POST switch above ~1900 URL chars, correctly routes to `Patient/_search`."

**Spec reference.** R5 §3.1.0.5 "POST" form of search (<https://hl7.org/fhir/R5/http.html#search>): "The client may use the POST operation [...] the body [...] in `application/x-www-form-urlencoded` form." The spec gives no numeric threshold; the 1900 figure is a DX heuristic for typical server URL limits.

**What the code does.** `packages/core/src/search-query-builder.ts:58` declares `DEFAULT_AUTO_POST_THRESHOLD = 1900`. Line 677-688 routes to POST when `paramsToFormBody(params).length > threshold`. POST path is `${resourceType}/_search`, content-type header is `application/x-www-form-urlencoded`, body is `URLSearchParams.toString()`.

**Confirmations (happy path):**
- Path: `Patient/_search` ✓ (line 683).
- Content-Type: `application/x-www-form-urlencoded` ✓ (line 685).
- The content-type header wins over the client's default `application/fhir+json` because in `fhir-client.ts:38-43` the spread order is `{Accept, "Content-Type": "fhir+json", ...config.headers, ...query.headers}` — `query.headers` last, so it overrides. (Note: dsl-explorer's runtime-preanalysis.md row #4 suspected this was broken; it isn't.)

**Weakness — DX / interop risk (NOT a spec refute, per team-lead calibration):**

`paramsToFormBody(params).length` counts **UTF-16 code units**, not bytes. For ASCII-only params this is identical to byte count. For non-ASCII, `URLSearchParams.toString()` percent-encodes the characters, so each non-ASCII code unit becomes up to 9 characters (`%XX%XX%XX` for a 3-byte UTF-8 char). Because the percent-encoded form **is** ASCII, `.length` after encoding ≈ byte count. So in practice, the check is close to byte-accurate for the actual wire payload.

The real interop risk is independent of chars-vs-bytes: the threshold is computed against the **form-body** even when the request will ultimately be sent as a GET. The actual GET URL carries additional overhead not counted:

```
GET {baseUrl}/{resourceType}?{encoded-params}
           ^^^^^^^^^^^^^^^^^^^^^^^^^ not counted
```

For a long `baseUrl` like `https://fhir.company.internal.example.com/r5/fhir/api/v2/` (~60 chars) plus `/Patient?`, a GET constructed just under the 1900 threshold will produce a full URL of ~1970 chars, which some corporate proxies truncate at 2000-2048. So the heuristic can underestimate the actual URL length.

**Second weakness — no way for the user to opt into or override threshold behavior.** `.usePost()` exists (line 531-540) to force POST; but there is no `.useGet()` to force GET above the threshold, and no way for a user to set a per-request or per-client threshold override (the `autoPostThreshold` state field exists on line 55 but is never writable from any public method — dead state).

**Verdict: CONFIRM-WEAK.** The path and content-type are right. The threshold heuristic is approximate and has a dead `autoPostThreshold` knob that can never be set. No spec violation, but the "correctly" in AUDIT overstates a working-but-rough heuristic.

**Test gap.** `packages/core/test/search-url-edge-cases.test.ts` has **zero** coverage for the auto-POST switch. No test asserts path `/_search`, no test asserts content-type, no test asserts threshold. If AUDIT wants to keep calling this a "positive," there must be a regression pin. Flagged to test-engineer.

---

### A4. Pagination follows `Bundle.link[rel=next]` via `.stream()` — **REFUTE**

> AUDIT line 83: "Pagination correctly walks `Bundle.link[rel=next]` via `.stream()`."

**Spec reference.** R5 §3.1.0.4 Pagination (<https://hl7.org/fhir/R5/http.html#paging>) and §Bundle resource (`Bundle.link` values from RFC 5988). "The server returns a Bundle with the `self` link and can include `first`, `previous`, `next`, `last` pagination links." The spec also permits absolute-URL next links on different hosts (§Bundle 7.3.1).

**What the code does.** Two independent code paths:

1. **Core `stream()`** in `search-query-builder.ts:742-776`. At line 769: `const nextLink = bundle.link?.find((l) => l.relation === "next");`. Line 770-774 calls `this.#urlExecutor(nextLink.url)` if truthy.
2. **Runtime `paginate()`** in `packages/runtime/src/pagination.ts:18-24`. Same pattern; `executor.executeUrl(nextLink.url)`.

**Refute #1: relative next URLs are not resolved against base.**

Spec §Bundle.link says `url: uri` — a URI that may be absolute or relative. Many real servers (including HAPI in some configurations) return relative next URLs like `?_getpages=xxx&_getpagesoffset=10`. Current code feeds this directly to `fetch()`. Repro:

```ts
// Mock server returns:
bundle.link = [{ relation: "next", url: "?_page=2" }];
// Calls: executor.executeUrl("?_page=2")
// Which calls: performRequest({baseUrl:...}, { url: "?_page=2", method: "GET" })
// Which calls: fetch("?_page=2", ...)
// In Node, fetch("?_page=2") throws "Invalid URL".
// Spec: should resolve against self link or baseUrl.
```

**Refute #2: no cycle detection on pagination loop.**

Neither `search-query-builder.ts:755-775` nor `pagination.ts:10-24` maintains a seen-URL set. A server that returns a `next` link pointing to the current page (accidentally or maliciously) triggers an infinite loop. dsl-explorer flagged this as NEW FINDING #3 in `runtime-preanalysis.md`. The AUDIT word "correctly" is directly contradicted.

Minimal repro:

```ts
// Server returns every page with the same next URL:
const bundle = {
  resourceType: "Bundle",
  entry: [{ resource: { resourceType: "Patient", id: "1" } }],
  link: [{ relation: "next", url: "https://fhir.example.com/Patient?_page=2" }],
};
// Both stream() and paginate() will loop forever emitting the same resource.
```

This is a DoS primitive (the client eats its own memory/CPU unbounded) *and* a correctness bug (duplicate resources emitted).

**Refute #3: `stream()` applies validation per-page but doesn't guard against the next-link itself being absent-but-defined.**

`search-query-builder.ts:769` checks `nextLink?.url` — if a server returns `link: [{relation: "next"}]` (no url, perhaps a misbehaving server), the check short-circuits correctly. OK, not a refute. Withdraw.

**Aggregate verdict: REFUTE.** "Correctly walks" overstates: relative URLs fail, cycles loop forever. Neither is spec violation per se (spec doesn't mandate cycle detection; relative-URL handling is a host responsibility) — but "correctly" is the wrong word when two well-known edge cases brick the walker.

---

### A5. Composite params correctly join with `$` — **REFUTE**

> AUDIT line 84: "Composite params correctly join with `$` per spec."

**Spec reference.** R5 §3.1.1.7 Composite Search Parameters (<https://hl7.org/fhir/R5/search.html#composite>):

> For some search parameters, the actual search is a composite of values from two or more elements, joined by a `$`. [...] Values within a composite search parameter are joined together using `$`, and any existing `$` characters in the component values must be escaped by preceding them with `\`.

(Emphasis added.)

Also §3.1.1.3.2 on escaping: `\` is the escape character for `$`, `,`, and `\` in search values.

**What the code does.** `packages/core/src/search-query-builder.ts:300-322`:

```ts
whereComposite<K extends string & CompositeKeys<SP>>(
  param: K,
  values: CompositeValues<SP[K]>,
): SearchQueryBuilder<...> {
  const compositeValue = Object.values(values as Record<string, string | number>).join("$");
  // ...
}
```

No escaping. If a component value itself contains `$`, the result is indistinguishable from component-separator `$`.

**Minimal repro:**

```ts
import { SearchQueryBuilderImpl } from "@fhir-dsl/core";

const q = new SearchQueryBuilderImpl<any, any, any>("Observation", noopExecutor)
  .whereComposite("code-value-string", {
    code: "http://loinc.org|55284-4",
    value: "pre$ent",   // user data containing a literal $
  })
  .compile();

expect(q.params).toContainEqual({
  name: "code-value-string",
  // Spec-correct: "http://loinc.org|55284-4$pre\\$ent"
  // Actual impl : "http://loinc.org|55284-4$pre$ent"
  value: "http://loinc.org|55284-4$pre$ent",
});
```

The actual URL sent is `code-value-string=http://loinc.org|55284-4$pre$ent`, which a conformant server will parse as a **three-component composite** — `http://loinc.org|55284-4`, `pre`, `ent` — not two. Correctness break, direct spec violation.

**Also affected by the same bug:**
- OR-value comma join (`search-query-builder.ts:146`): `values.map(String).join(",")` — no escape for `,` or `\`. Already called out by AUDIT line 62; confirmed by the pin test at `search-url-edge-cases.test.ts:134-143`.
- OR compiled via condition-tree (`condition-tree.ts:26`): `tuples.map(([, , v]) => String(v)).join(",")` — same bug, **not** called out in AUDIT. NEW FINDING for the bug catalog.

**Verdict: REFUTE.** Three sites (`whereComposite`, `where("eq", array)`, `condition-tree.ts or-branch`) all violate §3.1.1.3.2/§3.1.1.7 escaping. AUDIT caught the OR case and said "correctly" anyway for composite.

**Test gap.** `search-url-edge-cases.test.ts` has pin tests for the comma/backslash bug in the positional `where` but nothing for composite `$` or for the `or()` callback path via condition-tree. Flagged to test-engineer.

---

## Section B — Challenges to AUDIT.md "Gaps" (core §2 Highs/Mediums/Lows)

### B1. "No PATCH support" (AUDIT line 59) — **CONFIRM-STRONG** (and understated)

AUDIT: `.patch()` method missing. Confirmed — no `patch` method exists in `SearchQueryBuilder`, `FhirClient`, `TransactionBuilder`, or any read builder. Grep for `patch` in `packages/core/src` returns only type declarations for the (unused) method signature.

**Addition not in AUDIT:** the `TransactionBuilder` in `packages/core/src/transaction-builder.ts` has type-level support for PATCH entries (visible in grep) but no runtime path. So the compile-time contract allows a user to write `.patch(resource, id, ops)`; the compiler accepts it; runtime silently does the wrong thing or throws. Worth calling out as a "partial API" gap — worse than "missing," because the type shape lies.

### B2. "No conditional operations" (AUDIT line 60) — **CONFIRM-STRONG**

`If-None-Exist`, `If-Match`, `If-Modified-Since` absent. Grep confirms. Also confirmed: `ETag` handling on responses is absent too — the response type in `runtime/src/result.ts` exposes no way for callers to extract the server ETag for a subsequent `If-Match` round-trip. AUDIT only flags the request side.

### B3. "No operation invocation `$everything` etc." (AUDIT line 61) — **CONFIRM-STRONG**

Grep for `$everything`, `$validate`, `$expand`, `$lookup`, `$translate` in `packages/core/src` returns nothing. Confirmed.

### B4. "OR values: commas in literal values not escaped" (AUDIT line 62) — **CONFIRM-STRONG, EXTENDS**

AUDIT already gets this right. Extension: as noted in A5 above, the same bug exists in `condition-tree.ts:26` (the `.or()` callback form). AUDIT only cites the positional `where(param, "eq", [...])` form at line 146.

### B5. Search/REST gaps in AUDIT Medium (lines 67-72) — **CONFIRM-STRONG**

- No `vread` ✓
- No `_history` ✓
- No `/metadata` ✓
- Transaction vs batch semantics distinction not exposed ✓ (I traced `TransactionBuilderImpl` and `BatchBuilderImpl` — both hit the root with a bundle of identical shape, differing only in `Bundle.type`).

### B6. Search/REST gaps in AUDIT Low (lines 74-76) — **CONFIRM-WEAK**

- `_text` / `_content` pass-through ✓
- `URLSearchParams` encodes space as `+` ✓ — but AUDIT calls this a "low" gap on portability grounds. Counter: FHIR §3.1.0.2 accepts both `+` and `%20` per application/x-www-form-urlencoded; server conformance is not at risk. The "low" label is appropriate but leaning trivial. Could arguably be deleted from the gap list.

---

## Section C — Challenges to AUDIT.md "Runtime" Positives (lines 99-103)

### C1. `FhirRequestError` exposes status/statusText/OperationOutcome/.issues — **CONFIRM-WEAK**

> AUDIT line 101: "`FhirRequestError` exposes `status`, `statusText`, parsed `OperationOutcome`, and `.issues`."

Read `packages/runtime/src/errors.ts` to verify `.issues` accessor. The shape matches — fields do exist. BUT: **two bugs noted by dsl-explorer** partially invalidate "parsed `OperationOutcome`":

- Non-JSON error bodies are silently lost (`response.json().catch(() => null)` swallows the body). If a server returns `text/html` error (common behind corporate proxies), `operationOutcome` is `null` and the user loses diagnostic info. Spec §3.1.0.3 doesn't mandate JSON for all error responses; `text/plain` and `text/html` are allowed at the HTTP layer. AUDIT overstates.
- 204 No Content on successful DELETE: `response.json()` is called unconditionally in `fhir-client.ts:60` on the success path. `204` has no body; `.json()` will throw. This is pre-`FhirRequestError` — it's a client-side crash on the happy path. dsl-explorer's finding #8.

**Verdict: CONFIRM-WEAK.** The claim holds only for JSON-body 4xx/5xx. Non-JSON errors and 2xx-no-body break it.

### C2. Single 401-retry hook via `provider.onUnauthorized()` — **CONFIRM-WEAK**

> AUDIT line 102: "`executor.ts` has a single 401-retry hook via `provider.onUnauthorized()`."

Verified at `http.ts:44-47`. This is literally one retry. No cap on recursion:

```ts
if (response.status === 401 && provider?.onUnauthorized) {
  await provider.onUnauthorized();
  response = await send(provider);
}
```

A second consecutive 401 after the retry does NOT trigger another `onUnauthorized` — so in practice it's capped at one. But if `onUnauthorized` internally makes a token-refresh request that itself 401s, and that 401 is caught inside the provider, the outer `send()` can still fail with 401 silently. Soft-CONFIRM; the shape matches the AUDIT description.

### C3. Pagination is `AsyncGenerator`-based and follows `Bundle.link[rel=next]` — **CONFIRM-WEAK** (same caveats as A4)

See A4. The "correctly follows next" is weak for the same reasons. In the runtime package (`pagination.ts:10-24`), same two issues: relative URLs fail, cycles loop forever.

---

## Section D — New findings NOT in AUDIT

These are distinct from the AUDIT gap list.

### D1. 204 No Content on DELETE calls `.json()` unconditionally — **REFUTE**

`fhir-client.ts:60` in the success branch: `return response.json();`. On a successful DELETE, the server returns `204 No Content`. Calling `.json()` on a body-less response throws `SyntaxError: Unexpected end of JSON input` in Node 18+ fetch.

Minimal repro (once an actual `delete` path lands — currently the method itself is partly missing, but this path runs for any 2xx with no body):

```ts
// Mock server: 204 on DELETE
const fetchMock = async () => new Response(null, { status: 204 });
const client = createFhirClient({ baseUrl: "...", fetch: fetchMock });
await client.delete?.("Patient", "123");
// TypeError: await response.json() throws SyntaxError
```

**Verdict: REFUTE.** Crashes the happy path on the one HTTP scenario where no body is correct.

### D2. 201 Created `Location` header not surfaced — **REFUTE**

On `.create()` (which exists in create paths), spec §3.1.0.9 requires the client to read `Location` for the newly-assigned logical ID:

> `Location: [base]/[type]/[id]/_history/[vid]`

Current `http.ts:17-23` `HttpResponse` interface exposes `headers: Headers`. But the executor at `fhir-client.ts:55-60` returns `response.json()` directly as the result — `headers` is swallowed. Consumers can't read `Location`. Workaround forces them to search for `resource.id` in the returned body (which 201 Created may not include if the server uses `Prefer: return=minimal`).

**Verdict: REFUTE.** Correctness bug, not covered by AUDIT.

### D3. `Prefer` header not plumbed — **REFUTE**

Spec §3.1.0.1 defines `Prefer: return=minimal | representation | OperationOutcome`. Current code has no way for callers to set this per-request. AUDIT mentions only "_text and _content" at line 75 and doesn't address `Prefer`. dsl-explorer finding #5.

**Verdict: REFUTE** (new gap, not in AUDIT). Medium severity — defaults to server's default behavior, which is representation; callers can't opt out for bandwidth-constrained environments.

### D4. `condition-tree.ts` OR-branch inherits comma-escape bug — **REFUTE**

Already noted in A5. Distinct from AUDIT's line-146 callout because it's a different file/line path.

```ts
// condition-tree.ts:26
return [{ name: firstName as string, value: tuples.map(([, , v]) => String(v)).join(",") }];
```

**Repro via the callback `where()` form:**

```ts
const q = client.search("Patient").where((eb) =>
  eb.or([
    ["family", "eq", "O'Brien, Jr."],
    ["family", "eq", "Smith"],
  ]),
).compile();
// Expected after fix: family=O'Brien\, Jr.,Smith
// Actual:              family=O'Brien, Jr.,Smith  (three-way OR, wrong)
```

### D5. `_filter` emitter quoting is single-quote-only, no `\` escape — **REFUTE**

`condition-tree.ts:94-99`:

```ts
function formatFilterValue(value: unknown): string {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const s = String(value);
  if (DATE_PREFIX_RE.test(s)) return s;
  return `'${s.replaceAll("'", "''")}'`;
}
```

Doubles single quotes (FHIRPath-style escape) but does NOT escape backslashes. A value like `C:\path\to\thing` becomes `'C:\path\to\thing'` which a conformant `_filter` parser may reject or interpret `\t` as a tab escape. §3.1.1.3.2.4 (`_filter` parameter) references FHIRPath string literal rules (§4.1.2 of N1), which define escape sequences including `\t`, `\n`, `\\`, `\'`, `\"`. A backslash in user data is currently a wire-format corruption waiting to happen.

### D6. `where(..., "eq", [array])` silently rejects non-`eq` operators but accepts `undefined` silently — **CONFIRM-WEAK**

`search-query-builder.ts:141-144` correctly throws when `op !== "eq"` with an array value. Good. But test-engineer's pin test at line 124-128 only asserts this for `"ge"` — no test for `undefined`. If a user passes `undefined` for op (possible with loose types), it falls through the `Array.isArray(value)` branch and joins with `,` under the wrong operator semantics. Minor.

---

## Section E — Coverage of test-engineer's pin file

`packages/core/test/search-url-edge-cases.test.ts` (146 lines, committed under `/packages/core/test/`).

| Pin | Status | Spec-correct? | Notes |
|---|---|---|---|
| Lines 52-57: `eq` emits no prefix | Regression pin | ✓ | Correct. |
| Lines 59-64: prefixed operators emit prefix | Regression pin | ✓ | Covers ne/gt/ge/lt/le/sa/eb/ap. Missing: what if user passes unknown prefix? `classifyOp` at op-classifier.ts:24 returns `{prefix: op}` for unknown — emits garbage like `birthdate=xxx...`. Silent. |
| Lines 67-87: token value formatting | Regression pin | ✓ | Correct pass-through. But: what if code contains `\|`? Literal pipes don't need escape in token format (spec §3.1.1.4), but code contains `,` should be escaped per §3.1.1.3.2. Not tested. |
| Lines 90-113: reference value formatting | Regression pin | ✓ | Missing: `logical://` and URN references. Also: chained URL like `subject=Patient?identifier=xxx` — spec doesn't allow this directly but some servers extend. |
| Lines 117-122: OR via `,` | Regression pin | ✓ | Covers happy path. |
| Lines 124-128: non-`eq` array throws | Regression pin | ✓ | Good. |
| Lines 134-143: `//GAP` comma/backslash not escaped | Pin of current broken | — | Correctly labelled as GAP. When fix lands, must be rewritten. |
| **Missing:** composite `$` escape | — | — | Requested from test-engineer. |
| **Missing:** auto-POST threshold tests | — | — | No test at all. |
| **Missing:** `whereMissing` modifier emission | — | — | |
| **Missing:** condition-tree `or()` branch emits comma-joined correctly | — | — | |
| **Missing:** `_sort` with mixed asc/desc | — | — | `sortValue` at search-query-builder.ts:661 uses leading `-` for desc; untested. |
| **Missing:** `_include`/`_revinclude` `:iterate` modifier placement | — | — | search-query-builder.ts:633 emits `modifier: "iterate"` which becomes `_include:iterate=...`. Spec §3.1.1.6.2 says this should be `_include:iterate=X:y`. Untested; assumed correct but unverified. |

**Verdict on test coverage:** the pin file does what it claims — pins current behavior, clearly labels gaps — but leaves ~6 distinct gap areas untested. Not a refute; a completeness flag for test-engineer's task #8.

---

## Section F — Security Considerations (NOT refutes)

Per team-lead calibration, host validation on pagination `next` links is explicitly **not** a refute — spec permits cross-host next.

However, the DSL is a client library; consumers may embed it in multi-tenant servers or CLI tools that treat `FhirClient.baseUrl` as a trust boundary. When a server controls the next-link URL, it can redirect the client to:

1. An **attacker-controlled host** (spec-permitted): the client follows and sends the configured auth provider's headers to a third party. The `performRequest` function at `http.ts:32-33` unconditionally attaches `Authorization` if `provider` is set. This means a malicious server can exfiltrate the client's bearer token simply by returning a next link pointing at the attacker.

2. A **localhost or internal URL**: SSRF-style vector if the library is used in a server context. Less applicable to browser use.

**Recommendation** (not a spec refute): offer a hook like `shouldFollowNextLink(url: string): boolean` or restrict cross-origin Authorization attachment. Current behavior is within spec but carries an operational security risk.

This belongs in the docs-engineer Bug Report (task #16) as a security consideration, not a compliance gap.

---

## Section G — Tally

| Category | Count |
|---|---|
| CONFIRM-STRONG | 6 (A1, A2, B1, B2, B3, B4, B5) |
| CONFIRM-WEAK | 5 (A3, B6, C1, C2, C3) |
| REFUTE against AUDIT.md positives | 2 (A4 pagination, A5 composite) |
| REFUTE / new findings (not in AUDIT) | 5 (D1, D2, D3, D4, D5) |
| Security considerations (not refutes) | 1 |
| Test-coverage flags | 6 (see Section E) |

**Headline disputes for team debate (task #13):**

1. **AUDIT line 84 "composite params correctly join with $" is FALSE.** Component values containing `$` produce ambiguous URLs that a conformant server will misparse. Three-line repro in A5. Spec §3.1.1.7 explicitly mandates `\$` escape.

2. **AUDIT line 83 "pagination correctly walks Bundle.link[rel=next]" is WEAK TO FALSE.** Relative URLs are not base-resolved; cycles loop forever. The word "correctly" is wrong. Two repros in A4.

3. **AUDIT line 82 auto-POST is RIGHT on content-type/path, WEAK on threshold heuristic.** Not a refute, but the dead `autoPostThreshold` state field (line 55 of search-query-builder.ts, never writable) is a shipping bug. dsl-explorer was mistaken to call content-type broken; the spread order is correct.

4. **AUDIT line 101 "parsed OperationOutcome" is WEAK.** Non-JSON error bodies silently drop to null; 204 on success crashes `.json()`. Two new findings (D1, D2) that AUDIT misses.

5. **Three separate escape bugs (comma in positional OR, `$` in composite, `\` in `_filter`) all stem from the same missing `escapeSearchValue(s)` helper.** A single fix would close five spec violations across §3.1.1.3.2 and §3.1.1.7. High-leverage target for the next release.

---

*End of challenge doc. Author: spec-challenger.*
