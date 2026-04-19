# Bug Repro Specs for Test-Engineer

**For tasks:** #8 (search-param compliance), #9 (REST + runtime compliance). **Also feeds** spec-challenger's #12 edge-case matrix.

**Scope.** Bugs only — functions that exist but misbehave. Pure MISSING-feature rows from the impl-maps are NOT included (asserting "feature absent" doesn't add coverage). Source: `core-impl-map.md` + `runtime-impl-map.md` at commit `4f91589`.

**Conventions.**
- `BUG-<AREA>-<NNN>`: stable IDs.
- "Expected" = per R5 spec as cited in `audit/spec/*.md`.
- "Actual" = behavior produced by current code at the file:line shown.
- "Invocation" = minimum hand-executable input that triggers the bug. Test-engineer expands into Vitest assertions.
- Severity: **HIGH** = silent-wrong output or exception that corrupts caller flow; **MEDIUM** = degraded but recoverable; **LOW** = cosmetic / edge-case.

**Note on the pre-existing `packages/core/test/search-url-edge-cases.test.ts`** referenced in my original preamble: that file does not actually exist in the tree (git status listed it as untracked but it is absent). Nothing to cross-reference; every bug below is un-covered.

---

## HIGH severity

| ID | Spec rule | Bug summary | Invocation | Expected | Actual | File:line |
|----|-----------|-------------|------------|----------|--------|-----------|
| BUG-RUNTIME-001 | REST-DELETE-003 | `response.json()` called unconditionally on success; 204 No Content throws `SyntaxError`. | Mock fetch returns `{status:204, statusText:"No Content", headers:{}, json:()=>Promise.reject(SyntaxError)}`. Call `new FhirExecutor(cfg).execute({method:"DELETE",path:"Patient/123",params:[]})`. | Promise resolves (void/undefined). | Promise rejects with `SyntaxError: Unexpected end of JSON input`. | `fhir-client.ts:60`, `packages/runtime/src/executor.ts:46` |
| BUG-RUNTIME-002 | REST-CREATE-002, REST-HDR-008 | 201 Created response headers (`Location`, `ETag`, `Last-Modified`) silently discarded. With `Prefer: return=minimal`, caller cannot retrieve assigned id. | Mock fetch returns `{status:201, headers:new Headers({Location:"/Patient/abc/_history/1", ETag:'W/"1"'}), json:()=>Promise.resolve(null)}`. Execute a create query. | Caller obtains `{id:"abc", versionId:"1"}` or at least access to the raw `Location` header. | Caller receives `null`; Location & ETag dropped on the floor. | `fhir-client.ts:60`, `executor.ts:46` |
| BUG-RUNTIME-003 | REST-ERR-001 | Non-JSON error bodies silently discarded to `null`. Diagnostic context from proxies/gateways lost. | Mock fetch returns `{ok:false, status:502, statusText:"Bad Gateway", json:()=>Promise.reject(SyntaxError), text:()=>Promise.resolve("<html>…</html>")}`. Execute any query. | `FhirError` carries the text body (or a `rawBody` field). | `FhirError.operationOutcome === null`; body thrown away. | `fhir-client.ts:56-57`, `executor.ts:42-43` |
| BUG-RUNTIME-004 | pagination §8 + AUDIT line 83 | `stream()` / `paginate()` have no cycle detection on `Bundle.link[rel=next]`. Server returning `next.url === self.url` → infinite loop. | Mock fetch: first call returns `Bundle{link:[{relation:"next", url:"https://srv/Patient?page=1"}]}` and every subsequent call to that URL returns the same Bundle. Wrap in a 10-iteration safety counter and assert throw. | Iteration halts (via seen-set / depth cap) with a detectable condition. | Generator yields forever. Test must use a kill-switch to avoid hanging CI. | `search-query-builder.ts:769-774`, `packages/runtime/src/pagination.ts:18-22` |
| BUG-RUNTIME-005 | REST-READ-001, REST-UPDATE-004, REST-HDR-007 | Response headers (ETag / Location / Last-Modified) never surfaced to caller on any 2xx response. | Mock fetch returns `{status:200, headers:new Headers({ETag:'W/"4"', "Last-Modified":"Tue,15 Nov 2025 08:00:00 GMT"}), json:()=>Promise.resolve({resourceType:"Patient",id:"123"})}`. Call `client.read("Patient","123").execute()`. | Caller can read the ETag (e.g. via an added `.readWithMeta()` or a response wrapper). | Caller receives the parsed Patient body only; no access to ETag. Prevents version-aware subsequent updates. | `fhir-client.ts:60`, `executor.ts:46` |
| BUG-CORE-001 | SRCH-COMB-003, AUDIT line 62 | Array `where(...,"eq",[...])` joins values with `","` without escaping `\,` per §3.2.1.5.7. | `client.search("Patient").where("family","eq",["O'Brien, Jr.","Smith"]).compile()`. | One param with value `O'Brien\,\\ Jr.,Smith` (or equivalent: comma inside first value escaped to `\,`). | `family=O'Brien, Jr.,Smith` — server parses as 3-way OR of `O'Brien`, ` Jr.`, `Smith`. | `search-query-builder.ts:146` |
| BUG-CORE-002 | SRCH-COMP-001, SRCH-TYP-008 | `whereComposite` joins on `$` with no escape for literal `$` in component values. | `client.search("Observation").whereComposite("code-value-quantity", {code:"loinc$8480-6", value:"gt120"}).compile()`. | Param value `loinc\$8480-6$gt120` (literal dollar escaped). | `loinc$8480-6$gt120` — server reads as a 3-part composite; third component `gt120` may collide. | `search-query-builder.ts:304` |
| BUG-CORE-003 | SRCH-FILT-001 | `:not` modifier routed through `_filter` maps to `ne` operator; semantics differ — `:not` includes resources with no value for the param, `ne` does not. | `client.search("Patient").where(cb => cb.or([["gender",":not","male"],["gender",":not","unknown"]])).compile()`. | Fall-through should emit two HTTP requests (impossible to OR two `:not` modifiers directly in FHIR search except via `_filter not in` grammar), OR throw a clear "unsupported" error. At minimum the emitted `_filter` must preserve `:not`'s null-inclusion semantics (e.g. `_filter=(gender ne 'male' or gender.empty()) or (gender ne 'unknown' or gender.empty())`). | Emits `_filter=(gender ne 'male') or (gender ne 'unknown')` — silently drops null-inclusion. | `condition-tree.ts:52` |
| BUG-CORE-004 | SRCH-CHAIN-003 | Multi-hop `whereChain` unconditionally appends `:Type` to every hop including the last one before the terminal param. | `client.search("Observation").whereChain([["subject","Patient"],["general-practitioner","Practitioner"]],"name","eq","Joe").compile()`. | Name = `subject:Patient.general-practitioner.name` when `general-practitioner` is monomorphic (spec-canonical); at minimum caller should have a way to suppress the final `:Type`. | Name = `subject:Patient.general-practitioner:Practitioner.name` — extra `:Practitioner` always emitted. | `search-query-builder.ts:412` |

## MEDIUM severity

| ID | Spec rule | Bug summary | Invocation | Expected | Actual | File:line |
|----|-----------|-------------|------------|----------|--------|-----------|
| BUG-CORE-005 | SRCH-COMB-003 | Escape rule missing for literal `\|` in token values. | `client.search("Patient").where("identifier","eq","a|b").compile()` where `a|b` is a literal value (not a system\|code). | Emits `identifier=a\\\|b` (backslash-pipe escape). | Emits `identifier=a|b` — server parses as system `a`, code `b`. | `search-query-builder.ts:60-64` + missing helper |
| BUG-CORE-006 | SRCH-COMB-003 | Escape rule missing for literal `\\` (backslash). | `client.search("Patient").where("note","eq","foo\\bar").compile()`. | Emits `note=foo\\\\bar` (backslash escaped per §3.2.1.5.7 "backslash itself"). | Emits `note=foo\\bar` — server may reject or treat as a malformed escape. | `search-query-builder.ts:60-64` |
| BUG-CORE-007 | SRCH-MOD-016 | No validation that a modifier is applicable to its parameter's type; e.g. `:exact` on a date param silently emitted. | `client.search("Patient").where("birthdate", ":exact" as any, "2024-01-01").compile()`. | Throw client-side with a clear "modifier `:exact` is not defined for parameter type `date`" error. | Emits `birthdate:exact=2024-01-01` — server MAY respond 400, client gave no early signal. | `packages/core/src/_internal/op-classifier.ts:20-25` |
| BUG-CORE-008 | SRCH-PFX-011 | No validation that a prefix is applicable to its parameter's type; unknown ops silently become prefixes. | `client.search("Patient").where("name", "foo" as any, "John").compile()`. | Throw with "unknown operator `foo`" OR "operator `foo` not defined for type `string`". | `op-classifier.ts:24` falls through to `{prefix:"foo"}` → emits `name=fooJohn`. | `_internal/op-classifier.ts:24` |
| BUG-RUNTIME-006 | AbortSignal (infrastructure) | `stream()` checks `signal.throwIfAborted()` between pages only; the in-flight `fetch()` receives no signal. | Setup: mock fetch that never resolves. Start `.stream({signal})` iteration. Call `controller.abort()`. | Underlying `fetch` cancelled; promise rejects with `AbortError` within ~10 ms. | First-page fetch continues until server responds or connection times out; the between-pages check never fires because the first page never arrives. | `http.ts:35`, `search-query-builder.ts:756` |
| BUG-CORE-009 | SRCH-POST-002 | POST branch of search returns `params: []` — URL-level params (`_format`, `_pretty`) dropped. | `client.search("Patient").where("_format","eq","json").usePost().compile()`. (Actual syntactic path may require bypassing type system since `_format` isn't in the registry; use a direct `CompiledQuery` construction to demonstrate.) | POST path with `_format=json` on the URL query string AND form-encoded body for the filter params (hybrid form per §3.2.1.4 / SRCH-POST-002). | `params: []` on the POST return; `_format` vanishes into the body only. | `search-query-builder.ts:680-687` |
| BUG-RUNTIME-007 | REST-ERR-002 | `FhirError` message derivation picks `issue[0]` only; multi-issue OperationOutcomes summarize to the first issue regardless of severity ranking. | Body: `{resourceType:"OperationOutcome", issue:[{severity:"information", diagnostics:"minor note"}, {severity:"fatal", diagnostics:"real problem"}]}`. | Message preferentially derives from the most severe issue ("real problem"). | Message = "minor note" (just takes index 0). | `packages/runtime/src/errors.ts:22-23` |

## LOW severity

| ID | Spec rule | Bug summary | Invocation | Expected | Actual | File:line |
|----|-----------|-------------|------------|----------|--------|-----------|
| BUG-CORE-010 | SRCH-POST-001 | Auto-POST threshold uses `String.length` (UTF-16 char count), not byte length. Multi-byte-heavy queries can exceed server URL limits before tripping the threshold. | Build a query with 1000 characters each mapping to 3-4 UTF-8 bytes (e.g. emoji or non-BMP CJK) so form-body is 1800 chars / ~5400 bytes. Verify compile returns GET not POST. | Auto-POST threshold compared against UTF-8 byte length. | Compiles as GET; URL exceeds many servers' 8 KB limit. | `search-query-builder.ts:58, 677-680` |
| BUG-CORE-011 | SRCH-RES-002 | Sort `_sort=status,-date` when caller requests `sort("status","asc").sort("date","desc")` — correct; but `sort()` does NOT de-duplicate or validate param names. Two `.sort("date","asc").sort("date","desc")` calls both emit. | `client.search("Patient").sort("name","asc").sort("name","desc").compile()`. | Either throw (conflicting sort on same field) OR keep last (idiomatic override). | Emits `_sort=name,-name` — server behavior undefined. | `search-query-builder.ts:458-470, 660-663` |

---

## Notes for test-engineer

- **Mocking fetch:** most runtime bugs require fine control over the `Response` shape. Use `packages/runtime/test/e2e-agents/claude-opus-4-6/mock-fetch.ts` as a starting point; extend to allow header-only responses and `.json()` that rejects.
- **Hanging-test risk:** BUG-RUNTIME-004 (pagination cycle) and BUG-RUNTIME-006 (AbortSignal) need watchdog timers. Use Vitest's `test.concurrent` + `Promise.race` against a 2-second timeout to avoid hanging CI.
- **Don't test the fix — test the bug.** Tests should fail on current code at `4f91589` and pass after the fix. Mark each with `it.fails(...)` or `it.todo(...)` per the team's convention (I don't know which is used; check `packages/fhirpath/test/spec-gaps.test.ts` for precedent).
- **Spec-challenger hand-off:** items flagged for edge-case elaboration in task #12 — BUG-CORE-001 (escape family), BUG-CORE-004 (polymorphic-ref chain), BUG-RUNTIME-004 (pagination cycle). Spec-challenger can expand these into broader adversarial matrices.

---

## Status

Scaffold complete. Covers all HIGH-impact INCORRECT rows from `core-impl-map.md` + all net-new findings from `runtime-impl-map.md` that involve an existing function misbehaving (not a missing feature). Pure MISSING items (PATCH, operations framework, capabilities, history, async) are out of scope per team-lead's direction.
