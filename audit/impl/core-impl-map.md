# Core Query Builder → R5 Search Rules — Impl Map

**Source audit.** Commit `4f91589` on `main`. Spec rules: `audit/spec/r5-search-rules.md`. Files read: `search-query-builder.ts`, `read-query-builder.ts`, `transaction-builder.ts`, `fhir-client.ts`, `where-builder.ts`, `condition-tree.ts`, `compiled-query.ts`, `_internal/op-classifier.ts`.

**Legend.** IMPLEMENTED = behavior matches spec. PARTIAL = works for common cases, breaks on a spec-covered edge. MISSING = no code for this rule. INCORRECT = produces spec-non-conformant output.

**Conventions.** File references are `path:line`. For URL-builder claims, the produced string is shown as emitted (URL-level encoding applied by `URLSearchParams.append` where relevant).

---

## 1. Parameter types (SRCH-TYP-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-TYP-001 number | IMPLEMENTED | search-query-builder.ts:126-177, op-classifier.ts:2 | Prefix routing via `PREFIX_OPS`. Value passed through as-is. |
| SRCH-TYP-002 date | IMPLEMENTED | search-query-builder.ts:211-221 (also generic `where`) | `whereLastUpdated` handles the meta date; general `where()` handles per-param dates. |
| SRCH-TYP-003 string | PARTIAL | search-query-builder.ts:126-177 | Builder accepts string values and emits as-is. Default matching (starts-with, case-insensitive) is the server's responsibility, but the builder does not validate that prefixes are rejected for string params (see TYP gap in SRCH-PFX-011 below). |
| SRCH-TYP-004 token | PARTIAL | search-query-builder.ts:126-177 | No support for `system\|code` literal-value escaping when `\|` appears INSIDE a value — see COMB-004 below. |
| SRCH-TYP-005 reference | IMPLEMENTED | search-query-builder.ts:126-177 | Accepts `Type/id` forms as strings. |
| SRCH-TYP-006 quantity | IMPLEMENTED | search-query-builder.ts:126-177 | Prefix + value form. Unit/system are caller-supplied as part of the value string. |
| SRCH-TYP-007 uri | IMPLEMENTED | search-query-builder.ts:126-177 | Emitted verbatim. |
| SRCH-TYP-008 composite | INCORRECT | search-query-builder.ts:300-322 | `Object.values(values).join("$")` — no escape for `$` literal inside a component value. Spec §3.2.1.5.8 requires `\$`. **Bug** — carried forward to test task #8. |
| SRCH-TYP-009 special | PARTIAL | search-query-builder.ts:542 (`filter()`), 546-561 (`namedQuery()`), 563-573 (`text/content/inList`) | Present but `_filter` grammar not validated client-side. |

## 2. Prefixes (SRCH-PFX-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-PFX-001…009 (eq/ne/gt/lt/ge/le/sa/eb/ap) | IMPLEMENTED | op-classifier.ts:2, search-query-builder.ts:126-177 | All nine recognized. Emitted as prefix-prepended-to-value. |
| SRCH-PFX-010 default eq | IMPLEMENTED | op-classifier.ts:21 | `eq` returns `{}` so no prefix string is prepended. |
| SRCH-PFX-011 prefix on non-ordered type | MISSING | op-classifier.ts:20-25 | `classifyOp` accepts any prefix without checking the parameter's type (string/token/uri/reference/composite/special). Unknown ops fall through as prefixes (line 24), which is its own bug. **OPEN-QUESTION per spec**, but the DSL is type-aware (via `SP[K]`) and SHOULD reject this client-side. |

## 3. Modifiers (SRCH-MOD-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-MOD-001 :exact | IMPLEMENTED | op-classifier.ts:5 | |
| SRCH-MOD-002 :contains | IMPLEMENTED | op-classifier.ts:6 | |
| SRCH-MOD-003 :not | IMPLEMENTED | op-classifier.ts:7 | |
| SRCH-MOD-004 :in | IMPLEMENTED | op-classifier.ts:9 | |
| SRCH-MOD-005 :not-in | IMPLEMENTED | op-classifier.ts:10 | |
| SRCH-MOD-006 :above | IMPLEMENTED | op-classifier.ts:12 | |
| SRCH-MOD-007 :below | IMPLEMENTED | op-classifier.ts:13 | |
| SRCH-MOD-008 :identifier | IMPLEMENTED | op-classifier.ts:14 | |
| SRCH-MOD-009 :of-type | PARTIAL | op-classifier.ts:8 | Recognized but no enforcement of spec syntax `<system>\|<code>\|<value>` — user provides raw string; no validation. |
| SRCH-MOD-010 :text | IMPLEMENTED | op-classifier.ts:11 | |
| SRCH-MOD-011 :code-text | IMPLEMENTED | op-classifier.ts:15 | |
| SRCH-MOD-012 :missing | IMPLEMENTED | search-query-builder.ts:186-198 | Dedicated `whereMissing(param, boolean)`. |
| SRCH-MOD-013 :type | MISSING | op-classifier.ts:4-18 | `type` not in `MODIFIER_OPS` set. Reference-target-type filtering (§3.2.1.5.5.16) unavailable. |
| SRCH-MOD-014 :iterate on include/revinclude | IMPLEMENTED | search-query-builder.ts:335-337, 357-358, 633, 639 | Emitted as `_include:iterate=...`. |
| SRCH-MOD-015 chained type-scoped form | IMPLEMENTED (with caveat) | search-query-builder.ts:371-401 (whereChained), 403-424 (whereChain) | Single-hop `whereChained` is correct. Multi-hop `whereChain` is INCORRECT — see SRCH-CHAIN-002. |
| SRCH-MOD-016 modifier applicability | MISSING | op-classifier.ts | No check that modifier is valid for parameter type. E.g. `.where("date", ":exact", ...)` would happily emit `date:exact=...` which is ill-formed. |

## 4. Combining values (SRCH-COMB-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-COMB-001 comma = OR | IMPLEMENTED | search-query-builder.ts:146, condition-tree.ts:25-26 | Array-value path joins with `,`. `where(cb)` routes same-name-all-eq OR to a comma-joined single param. |
| SRCH-COMB-002 repeated = AND | IMPLEMENTED | condition-tree.ts:16-17 | All-tuples AND routes to one param per tuple; `URLSearchParams.append` preserves repetition. |
| SRCH-COMB-003 escape `,`, `\|`, `$`, `\\` | **INCORRECT** | search-query-builder.ts:146, condition-tree.ts:26, 304 | `.join(",")` / `.join("$")` never prepend `\\`. Known bug for `,` in AUDIT.md line 62; **also broken for `\|` and `$` and `\\`**. Repros: <ul><li>`where("family","eq",["O'Brien, Jr.","Smith"])` → emits `family=O'Brien%2C+Jr.%2CSmith` (URL-encoded but comma still structural after decode) — server reads OR of `O'Brien`, ` Jr.`, `Smith`.</li><li>`whereComposite("code-value-quantity", {code:"loinc$8480", value:"gt120"})` → emits `code-value-quantity=loinc$8480$gt120` — three-part composite, not the intended two-part.</li></ul> |
| SRCH-COMB-004 literal `\|` in token value | MISSING | search-query-builder.ts | No helper for `\\\|` escape. |
| SRCH-COMB-005 cross-param OR via _filter | IMPLEMENTED | condition-tree.ts:31, search-query-builder.ts:542 | `.where(cb => cb.or([[paramA,"eq",v1],[paramB,"eq",v2]]))` falls through to `_filter` when names differ. Also a direct `.filter(expression)` escape hatch. |

## 5. Chained & reverse-chained (SRCH-CHAIN-*, SRCH-HAS-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-CHAIN-001 basic chain | IMPLEMENTED | search-query-builder.ts:371-401 (`whereChained`) | Emits `refParam:Target.subParam`. Type is always included (not conditional); spec allows the type when the reference is polymorphic, and type is a no-op when the target is unambiguous, so emitting unconditionally is safe. |
| SRCH-CHAIN-002 type-scoped | IMPLEMENTED for single hop | search-query-builder.ts:382 | |
| SRCH-CHAIN-003 nested chain | **INCORRECT** | search-query-builder.ts:412 | `hops.map(([ref,type]) => \`${ref}:${type}\`).join(".")` — the LAST hop receives a type-scope too, producing `a:Ta.b:Tb.terminal` instead of spec `a:Ta.b.terminal` when the terminal param's carrier reference is unambiguous. Worse: every intermediate "hop" is treated as a reference+type, but the terminal segment should be just `.<terminalParam>`, not `:Type.<terminalParam>`. The code's shape is: `<ref1:type1>.<ref2:type2>...<refN:typeN>.<terminal>`; spec's shape is: `<ref1:type1>.<ref2:type2>...<refN-1:typeN-1>.<terminal>` with the last reference's type emitted ONLY if required. Example: hops=[["subject","Patient"],["general-practitioner","Practitioner"]], terminal="name" emits `subject:Patient.general-practitioner:Practitioner.name` — spec-legal but carries an unnecessary `:Practitioner` anchor on the final hop before the terminal. More importantly, there is **no validation that the final reference's target is monomorphic**, so `:Practitioner` may collide with a server's view of the reference. |
| SRCH-HAS-001 `_has` | IMPLEMENTED | search-query-builder.ts:426-456 | Emits `_has:SrcRT:refParam:searchParam`. Prefix routed through `classifyOp`. |
| SRCH-HAS-002 nested `_has` | MISSING | search-query-builder.ts:426-456 | Single-level only. No helper to express `_has:A:x:_has:B:y:z=v`. |

## 6. Composites (SRCH-COMP-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-COMP-001 `$` join | **INCORRECT** | search-query-builder.ts:304 | Joins but does not escape `$` in component values. See SRCH-TYP-008 / SRCH-COMB-003. |
| SRCH-COMP-002 registered composites only | PARTIAL | search-query-builder.ts:300-322, types.ts `CompositeKeys` | Type system narrows `K` to registered composites; runtime does not. Caller can still invoke with any key via `as`. |
| SRCH-COMP-003 multi-value composite OR | MISSING | search-query-builder.ts:300-322 | `whereComposite` takes a single value object; no array-of-objects form for top-level `,` OR of composites. |

## 7. Result control (SRCH-RES-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-RES-001 _count | IMPLEMENTED | search-query-builder.ts:472-484, 665-667 | |
| SRCH-RES-002 _sort multi-key | IMPLEMENTED | search-query-builder.ts:660-663 | Correct `-<key>` prefix for desc; `,`-join for multi-key. |
| SRCH-RES-003 _total | IMPLEMENTED | search-query-builder.ts:267-276, 648-650 | |
| SRCH-RES-004 _summary | IMPLEMENTED | search-query-builder.ts:256-265, 644-646 | |
| SRCH-RES-005 _elements | IMPLEMENTED | search-query-builder.ts:500-514, 673-675 | Comma-joined list. |
| SRCH-RES-006 _contained | IMPLEMENTED | search-query-builder.ts:278-287, 652-654 | |
| SRCH-RES-007 _containedType | IMPLEMENTED | search-query-builder.ts:289-298, 656-658 | |
| SRCH-RES-008 _score | N/A (response-only) | — | No client concern. |

## 8. Paging (SRCH-PAGE-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-PAGE-001 self link | IMPLEMENTED (passthrough) | search-query-builder.ts:729 | Returned verbatim from server Bundle. |
| SRCH-PAGE-002 opaque next URL followed, not synthesized | IMPLEMENTED | search-query-builder.ts:769-774, fhir-client.ts:66-82 | `stream()` follows `next.url` via dedicated `UrlExecutor`. |
| SRCH-PAGE-003 stateful tokens preserved | IMPLEMENTED | search-query-builder.ts:771 | URL passed unchanged to executor. |
| *(Runtime bug — **noted for task #6, not a search-builder issue**)*: `stream()` has no cycle detection on `next.url` — infinite loop possible. Tracked in `runtime-preanalysis.md` row #3. | | | |

## 9. Include / revinclude (SRCH-INC-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-INC-001 _include basic | IMPLEMENTED | search-query-builder.ts:324-349, 631-634 | Value is prepended with `<resourceType>:` automatically. |
| SRCH-INC-002 `_include=*` wildcard | MISSING | search-query-builder.ts:324-349 | No dedicated path. Caller would need a type-cast to pass `"*"`. OPEN-QUESTION per spec so marking MISSING rather than INCORRECT. |
| SRCH-INC-003 _revinclude | IMPLEMENTED | search-query-builder.ts:351-369, 636-642 | |
| SRCH-INC-004 :iterate | IMPLEMENTED | search-query-builder.ts:335-337, 357-358 | |
| SRCH-INC-005 cycle depth bound | N/A (server-side) | — | Client has no knob. |

## 10. Metadata / common parameters (SRCH-META-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-META-001 _id | IMPLEMENTED | search-query-builder.ts:200-209, 597-599 | Multi-ID comma-joined (OR). |
| SRCH-META-002 _lastUpdated | IMPLEMENTED | search-query-builder.ts:211-221, 601-609 | Prefix-aware. |
| SRCH-META-003 _tag | IMPLEMENTED | search-query-builder.ts:223-232, 611-615 | Multiple invocations → repeated param (AND). |
| SRCH-META-004 _profile | IMPLEMENTED | search-query-builder.ts:627-629 | Set via `search(rt, profile)` constructor arg. |
| SRCH-META-005 _security | IMPLEMENTED | search-query-builder.ts:234-243, 617-621 | |
| SRCH-META-006 _source | IMPLEMENTED | search-query-builder.ts:245-254, 623-625 | |
| SRCH-META-007 _text | IMPLEMENTED | search-query-builder.ts:563-565 | |
| SRCH-META-008 _content | IMPLEMENTED | search-query-builder.ts:567-569 | |
| SRCH-META-009 _list | IMPLEMENTED | search-query-builder.ts:571-573 | |

## 11. _filter (SRCH-FILT-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-FILT-001 filter grammar | PARTIAL | condition-tree.ts:41-99, search-query-builder.ts:542-544 | Direct-string escape hatch via `.filter(expression)` is ungoverned. Tree-based emission covers `eq/ne/gt/ge/lt/le/sa/eb/ap/contains→co/not→ne/in/not-in→ni` but maps `not` to `ne` (line 52), which is **INCORRECT**: spec `not` modifier and `_filter` `ne` operator are not equivalent (`:not` includes null-valued resources; `ne` does not). Also missing: `pr` (present), `po` (value-set), `su` (subsumes), `sb` (subsumed-by), `re` (regex). |
| SRCH-FILT-002 cross-param OR | IMPLEMENTED | condition-tree.ts:20-31 | Fall-through from `where(cb)` when names differ. |
| SRCH-FILT-003 CapabilityStatement check | MISSING | — | No client-side gating. Caller assumes server supports `_filter`. |

## 12. _query (SRCH-QRY-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-QRY-001 named query | IMPLEMENTED | search-query-builder.ts:546-561 | `namedQuery(name, extras)` emits `_query=name&...extras`. |
| SRCH-QRY-002 named-query param shapes | PARTIAL | search-query-builder.ts:546-561 | `extras` is `Record<string, string\|number>` — no typing, no validation. |

## 13. HTTP POST search (SRCH-POST-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-POST-001 form-encoded body | IMPLEMENTED | search-query-builder.ts:680-687, fhir-client.ts:38-43 | Per-query `Content-Type: application/x-www-form-urlencoded` overrides default via spread order. Body built by `paramsToFormBody`. (Previously flagged by me as a suspected bug; spec-challenger corrected — I concede.) |
| SRCH-POST-002 hybrid URL + body params | MISSING | search-query-builder.ts:680-687 | POST branch returns `params: []` unconditionally. URL-level params like `_format` cannot coexist with the body payload. |
| SRCH-POST-003 response shape identical | IMPLEMENTED (passthrough) | search-query-builder.ts:697-740 | Decode path does not differentiate. |
| Auto-POST threshold | IMPLEMENTED (caveat) | search-query-builder.ts:58, 677-680 | Threshold = 1900 **string-length units** of the form body (not bytes; UTF-16 char count). For pure ASCII this matches server URL-length limits; for multi-byte Unicode the actual byte count can be 2-4× higher. Noted in spec-challenger's preliminary hits; not a strict refute, but worth a comment. |

## 14. URL structure & errors (SRCH-URL-*)

| Rule | Status | File:line | Note |
|---|---|---|---|
| SRCH-URL-001 URL forms (type-level) | IMPLEMENTED | search-query-builder.ts:690-694, read-query-builder.ts:42-48 | System-level search (`[base]?<params>`) and history-level filtering NOT implemented — no public API on `FhirClient`. MISSING for those sub-forms. |
| SRCH-URL-002 param names case-sensitive | IMPLEMENTED (passthrough) | search-query-builder.ts:60-64 | Names emitted verbatim. |
| SRCH-URL-003 Prefer: handling | MISSING | fhir-client.ts:38-43 | `Prefer` header not plumbed. Caller can pass via `config.headers` but no typed API. |
| SRCH-URL-004 Bundle.type=searchset | N/A (response-only) | — | Decode path doesn't check `Bundle.type`. |

---

## Mutation operations (not Search — transaction / batch / read)

These are not SRCH-* rules but are in scope for this task.

| Area | Status | File:line | Note |
|---|---|---|---|
| GET read (`read(rt, id)`) | IMPLEMENTED | read-query-builder.ts:42-48 | Path `rt/id`, no params. |
| Bundle transaction | IMPLEMENTED | transaction-builder.ts:146-172 | `type: "transaction"`. |
| Bundle batch | IMPLEMENTED | transaction-builder.ts:174-200 | `type: "batch"`. |
| Transaction entry `urlFullUrl` | MISSING | transaction-builder.ts:119-131 | No `fullUrl` emitted; references between new resources in same transaction cannot use `urn:uuid:` placeholders. |
| Conditional create (If-None-Exist) | MISSING | transaction-builder.ts:68-79 | No API surface. Bundle.request.ifNoneExist is not plumbed. |
| Conditional update (If-Match) | MISSING | transaction-builder.ts:81-97 | ETag / version-aware concurrent updates unavailable. |
| Update in-place (PUT outside transaction) | MISSING | fhir-client.ts:99-150 | `FhirClient` exposes only `search/read/transaction/batch`. No direct `update/create/delete/patch` methods. |

---

## Verification of the 7 spec-challenger probes (task description)

1. **`where('family','eq',["O'Brien, Jr.","Smith"])` — URL output.**
   Trace: search-query-builder.ts:146 does `["O'Brien, Jr.","Smith"].join(",")` → `"O'Brien, Jr.,Smith"`. `URLSearchParams.append("family", "O'Brien, Jr.,Smith")` → form-encoded as `family=O%27Brien%2C+Jr.%2CSmith`. Server decodes to `O'Brien, Jr.,Smith` then parses on `,` per §3.2.1.3 → **three OR values**: `O'Brien`, ` Jr.`, `Smith`. **Bug — no `\\,` escape.** Cited under SRCH-COMB-003.

2. **`where('code','in', ["a|1","b|2"])` — URL output.**
   Trace: array + `"in"` op throws at line 142-144 (`array values require the "eq" operator`). With `.whereIn("code", ["a|1","b|2"])` (which forces eq): joined → `"a|1,b|2"` → `URLSearchParams.append` → `code=a%7C1%2Cb%7C2`. Server decodes to `a|1,b|2`, splits on `,` → OR of `a|1` and `b|2`. This is correct for tokens (system|code form). **Comma escape still absent** — if a token value itself contained `,`, it would be mis-split.

3. **Multi-hop chain encoding.**
   Trace: `whereChain([["subject","Patient"],["general-practitioner","Practitioner"]],"name","eq","Joe")` at line 412 emits name = `subject:Patient.general-practitioner:Practitioner.name`. Spec §3.2.1.5 allows type-scope on each reference, but the terminal segment is `.<param>` only. Emitting `:Practitioner` on the last hop is **technically spec-legal** when `general-practitioner` is polymorphic AND the target narrows to `Practitioner` — but it is NOT conditional on polymorphism. **INCORRECT** in the sense that the type is always appended regardless of whether the reference is monomorphic. See SRCH-CHAIN-003.

4. **Modifier + OR — `or([["code",":not","a"],["code",":not","b"]])`.**
   Trace: condition-tree.ts:20-29 only merges OR-of-tuples when all ops are `"eq"`. `:not` falls through to `_filter` → emits `_filter=(code ne 'a') or (code ne 'b')`. **IMPLEMENTED, but see SRCH-FILT-001 caveat: `_filter ne` ≠ `:not` semantics.** This is **INCORRECT** — the routing turns a tuple with `:not` modifier into a `_filter ne` operator, and those two are different (§3.2.1.5.5.10 says `:not` includes resources with no value; `ne` does not). The correct fallback for `:not` in an OR group would be HTTP-multiple-requests or a server's `_filter` extension, not a direct `ne` mapping. Test task #8 should lock this down.

5. **POST _search content-type.** `application/x-www-form-urlencoded` — **correct.** Conceded earlier to spec-challenger.

6. **`|` in token value URL encoding.** `URLSearchParams` percent-encodes `|` to `%7C`. Server decodes to `|` before parsing — equivalent to unencoded. Builder provides no `\\|` for LITERAL pipe inside a value (as distinct from the system|code separator). **MISSING** helper, tracked under SRCH-COMB-004.

7. **Multi-key sort `_sort=-date,code`.** Trace: line 661 produces exactly this. **Correct.**

---

## Net-new findings (not yet in AUDIT.md v0.19.0)

- SRCH-TYP-008 / SRCH-COMB-003 / SRCH-COMP-001: `$` and `\\` escape missing in `whereComposite`. Not just `,`.
- SRCH-CHAIN-003: multi-hop chain unconditionally type-scopes the final hop.
- SRCH-FILT-001: `:not` → `ne` mapping loses semantics (null-value handling).
- SRCH-MOD-013: `:type` modifier missing.
- SRCH-MOD-016: no client-side validation that modifier is applicable to param type.
- SRCH-POST-002: POST branch drops URL-level params (no hybrid mode).
- SRCH-URL-001: system-level and history-level search URLs unavailable via `FhirClient`.
- SRCH-URL-003: `Prefer: handling=lenient\|strict` not plumbed.
- Conditional create/update (If-None-Exist / If-Match) missing in transaction builder.
- `FhirClient` missing direct `create/update/delete/patch` methods outside of transactions.

## Overturned positives (AUDIT.md v0.19.0 concession)

- AUDIT line 62 ("commas in literal values not escaped") — **upgraded**: also `$`, `\\`, and `\|`.
- AUDIT line 82 / POST _search content-type — **confirmed IMPLEMENTED** (my pre-analysis was wrong; spec-challenger corrected).

## Status

Task #5 complete. Feeds test task #8 (search-param compliance tests) and doc task #14 (Spec Coverage Matrix).
