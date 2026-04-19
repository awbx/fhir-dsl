# FHIR R5 Search — Atomic Rules

**Source specs.** Primary: https://hl7.org/fhir/R5/search.html (Search framework). Secondary: https://hl7.org/fhir/R5/searchparameter.html (SearchParameter resource). Parameter Registry: https://hl7.org/fhir/R5/searchparameter-registry.html . Section numbers are taken from the R5 search page as of the current publication (subject to minor drift — `**VERIFY-SECTION**` flagged where the WebFetch response disagreed with a prior text layout).

**Convention.** Rule IDs: `SRCH-<AREA>-<NNN>`. Areas: `TYP` parameter types, `PFX` prefixes, `MOD` modifiers, `COMB` combining/escaping, `CHAIN` chaining/reverse-chain, `COMP` composites, `RES` result/page control, `INC` include/revinclude, `META` `_id`/`_lastUpdated`/`_tag`/..., `FILT` `_filter`, `QRY` `_query`, `POST` HTTP POST, `TXT` `_text`/`_content`.

## OPEN-QUESTION Summary

1. **SRCH-PFX-TOKEN**: The spec states prefixes apply to "number, date, and quantity". It does **not** say they apply to `token`, `string`, `reference`, `uri`, `composite`, `special`. A token parameter with a prefix (e.g. `code=eq1234`) is ill-formed. **OPEN-QUESTION**: How servers MUST react — §3.2.1.5.6 does not explicitly prescribe. Common-practice: reject or treat prefix as part of the value; DSLs should validate client-side.
2. **SRCH-MOD-TOKEN-CASE**: The R5 spec describes token matching via "the text, display, code and code/codesystem (for codes)" but the fetched excerpt did **not** contain an explicit case-sensitivity normative sentence for token code matching. **OPEN-QUESTION** — assume "case-sensitive on code+system, case-insensitive on text" pending re-verification of §3.2.1.5.4.
3. **SRCH-CHAIN-003**: Chained-parameter grammar (`[ref].[sub-param]` and `[ref]:[Type].[sub-param]`) — the precise semantic of `:iterate` on chained parameters is ambiguous when combined with `_include:iterate`. **VERIFY-QUOTE** §3.2.1.6.7.
4. **SRCH-HAS-001**: `_has` reverse-chain syntax (`_has:<resource>:<param>:<sub-param>=...`) — the excerpt did not include the full normative text for recursive nesting; DSL authors should re-verify §3.2.1.5.
5. **SRCH-INC-002**: `_include=*` wildcard semantics vary by implementation; the spec permits `*` ("include all references") but does not define which specific parameter names it resolves to.
6. **SRCH-COMB-ESC-001**: The escape rule is "prepend `\\`". Backslash must itself be doubled (`\\\\`). Applies to the separator chars `,`, `|`, `$`, and `\\` itself. Spec text: "When any of these characters appear in an actual parameter value, they must be prepended by the character `\\`, which also must be used to prepend itself."

---

## 1. Parameter types (§3.2.1.5)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-TYP-001 | `number` — "Search parameter SHALL be a number (a whole number, or a decimal)." Supports prefixes. | §3.2.1.5.1 | `value-quantity=5.4` | `value-quantity=abc` → rejected |
| SRCH-TYP-002 | `date` — "Search parameter is on a date/time." Format: partial or full ISO 8601; supports prefixes. | §3.2.1.5.2 | `date=2024-01-02T14:30:00Z` | `date=yesterday` → rejected |
| SRCH-TYP-003 | `string` — "Search parameter is a simple string, like a name part." Default: case-insensitive + accent-insensitive + starts-with. | §3.2.1.5.3 | `name=Joh` matches `John`, `johan`, `Jöhn`. | Prefixes (eq,gt,…) do NOT apply. |
| SRCH-TYP-004 | `token` — "Search parameter on a coded element or identifier." Matches `[system]|[code]`, `\|[code]` (no system), `[code]` (any system). Also matches `.text`/`.display` for CodeableConcepts. | §3.2.1.5.4 | `code=http://loinc.org\|12345-8` | Prefixes do NOT apply. |
| SRCH-TYP-005 | `reference` — "A reference to another resource (Reference or canonical)." Forms: `[id]`, `[Type]/[id]`, absolute URL. | §3.2.1.5.5 | `subject=Patient/123` | `subject=gt123` — prefixes do NOT apply. |
| SRCH-TYP-006 | `quantity` — "A search parameter that searches on a quantity." Form: `[prefix][number]\|[system]\|[code]`. Supports prefixes; system+code are optional; comparison is UCUM-aware. | §3.2.1.5.6 | `value-quantity=ge5.4\|http://unitsofmeasure.org\|mg` | Unit mismatch yields no match, not an error. |
| SRCH-TYP-007 | `uri` — "A search parameter that searches on a URI (RFC 3986)." Default: exact-match, case-sensitive. | §3.2.1.5.7 | `url=http://example.org/FHIR/SP/foo` | Prefixes do NOT apply. |
| SRCH-TYP-008 | `composite` — "A composite search parameter that combines a search on two values together." Values joined by `$`. | §3.2.1.5.8 | `code-value-quantity=http://loinc.org\|8480-6$gt120` | `$` in literal value MUST be escaped `\\$`. |
| SRCH-TYP-009 | `special` — "Special logic applies to this parameter per the description." Each special param defines its own grammar. | §3.2.1.5.9 | `_filter`, `near` (Location) | No uniform grammar. |

## 2. Prefixes (§3.2.1.5.6) — apply to number/date/quantity ONLY

| ID | Prefix | Semantic (quoted) | Applies to | Example |
|----|--------|-------------------|------------|---------|
| SRCH-PFX-001 | `eq` | "the range of the parameter value fully contains the range of the resource value" | number, date, quantity | `date=eq2024` matches a resource date in 2024 |
| SRCH-PFX-002 | `ne` | "the range of the parameter value does not fully contain the range of the resource value" | number, date, quantity | `ne2024` excludes exact-year matches |
| SRCH-PFX-003 | `gt` | "the range above the parameter value intersects (i.e. overlaps) with the range of the resource value" | number, date, quantity | `gt2024-01-01` |
| SRCH-PFX-004 | `lt` | "the range below the parameter value intersects (i.e. overlaps) with the range of the resource value" | number, date, quantity | `lt5` |
| SRCH-PFX-005 | `ge` | "the range above the parameter value intersects or the range of the parameter value fully contains the resource value" | number, date, quantity | `ge2024-01-01` |
| SRCH-PFX-006 | `le` | "the range below the parameter value intersects or the range of the parameter value fully contains the resource value" | number, date, quantity | `le5` |
| SRCH-PFX-007 | `sa` | "the range of the parameter value does not overlap with the range of the resource value, and the range above the parameter value contains the resource value" | number, date, quantity | `sa2024` — strictly after 2024 |
| SRCH-PFX-008 | `eb` | "the range of the parameter value does not overlap with the range of the resource value, and the range below the parameter value contains the resource value" | number, date, quantity | `eb2024` — strictly before 2024 |
| SRCH-PFX-009 | `ap` | "the range of the parameter value overlaps with the range of the resource value" | number, date, quantity | `ap2024-01-02` — approximate |
| SRCH-PFX-010 | Absence of prefix defaults to `eq`. | §3.2.1.5.6 | — | `date=2024` ≡ `date=eq2024` |

**Negative (SRCH-PFX-011):** Applying a prefix to a non-ordered type (`string`, `token`, `reference`, `uri`, `composite`, `special`) is ill-formed. Per spec scope, prefixes are only defined for number/date/quantity; behavior on other types is **OPEN-QUESTION** (see summary).

## 3. Modifiers (§3.2.1.5.5)

| ID | Modifier | Section | Applies to | Quoted semantic |
|----|----------|---------|------------|-----------------|
| SRCH-MOD-001 | `:exact` | §3.2.1.5.5.5 | string | "Tests whether the value in a resource exactly matches the supplied parameter value (the whole string, including casing and accents)." |
| SRCH-MOD-002 | `:contains` | §3.2.1.5.5.4 | string, uri | "Tests whether the value in a resource includes the supplied parameter value anywhere within the field being searched." |
| SRCH-MOD-003 | `:not` | §3.2.1.5.5.10 | token | "Tests whether the value in a resource does not match the specified parameter value. Note that this includes resources that have no value for the parameter." |
| SRCH-MOD-004 | `:in` | §3.2.1.5.5.7 | token | "Tests whether the coding is in the specified value set." Value must be a ValueSet canonical URL. |
| SRCH-MOD-005 | `:not-in` | §3.2.1.5.5.11 | token | "Tests whether the coding is not in the specified value set." |
| SRCH-MOD-006 | `:above` | §3.2.1.5.5.1 | token, reference, uri | "Tests whether the value in a resource is or subsumes the supplied parameter value (is-a, or hierarchical relationships)." |
| SRCH-MOD-007 | `:below` | §3.2.1.5.5.2 | token, reference, uri | "Tests whether the value in a resource is or is subsumed by the supplied parameter value (is-a, or hierarchical relationships)." |
| SRCH-MOD-008 | `:identifier` | §3.2.1.5.5.6 | reference | "Supplied token should be used to match against the identifier element of a reference instead of the reference element." |
| SRCH-MOD-009 | `:of-type` | §3.2.1.5.5.12 | token (Identifier targets only) | "Filter for resource Identifier, based on the Identifier.type.coding.system, Identifier.type.coding.code and Identifier.value." Syntax: `identifier:of-type=<system>\|<code>\|<value>`. |
| SRCH-MOD-010 | `:text` | §3.2.1.5.5.13–14 | token, reference, string | (token/ref) "Supplied string should be used to perform a string-search against the text associated with a code or value." (string) "Parameter value should be processed as input to a search with advanced text handling." |
| SRCH-MOD-011 | `:code-text` | §3.2.1.5.5.3 | reference, token | "Supplied string input should be matched as case-insensitive and combining-character insensitive match against the start of target string." |
| SRCH-MOD-012 | `:missing` | §3.2.1.5.5.9 | ALL types (date, number, quantity, reference, string, token, uri) | "Allows clients to filter based on whether resources contain values that can match a search parameter. Searching for [parameter]:missing=true requests all resources that do not have a value in the matching element. Searching for [parameter]:missing=false requests all resources that do have a value in the matching element." |
| SRCH-MOD-013 | `:type` | §3.2.1.5.5.16 | reference | "Tests whether the value in a resource points to a resource of the supplied parameter type." Syntax: `subject:type=Patient`. |
| SRCH-MOD-014 | `:iterate` | §3.2.1.5.5.8 | _include, _revinclude only | "Indicates that an inclusion directive should be applied to an included resource instead of the matching resource." |
| SRCH-MOD-015 | Chained reference form as pseudo-modifier: `<ref>:<Type>` scopes a chain to a specific target type (e.g. `subject:Patient.name=Joe`). | §3.2.1.5.5 | reference | `subject:Patient.name=Joe` |

**Negative (SRCH-MOD-016):** Using a modifier on a parameter type where it is not defined (e.g. `date:exact=2024`) is ill-formed. Servers SHOULD respond 400 `OperationOutcome` per §3.2.1.5.5.

## 4. Combining values (§3.2.1.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-COMB-001 | Comma = **OR**: "In order to search for unions of results (values joined by 'OR'), values can be separated by a comma (',') character." | §3.2.1.3 | `given=John,Joan` → given name is John OR Joan | `given=John,Joan` does NOT mean BOTH |
| SRCH-COMB-002 | Repeated parameter = **AND**: "When multiple search parameters passed to a single search, they are used to create an intersection of the results - in other words, multiple parameters are joined via 'AND'." | §3.2.1.3 | `given=John&given=Smith` → both required | `given=John,Smith` is OR |
| SRCH-COMB-003 | Escape rule (§3.2.1.3.2 / §3.2.1.5.7): "When any of these characters appear in an actual parameter value, they must be prepended by the character `\\`, which also must be used to prepend itself." Characters: `,`, `\|`, `$`, `\\`. | §3.2.1.5.7 | `code=a\\,b` → literal `a,b`; `code=a\\\\b` → literal `a\\b`; `param=xx\\$xx` → literal `xx$xx`. | `code=a,b` parses as OR of `a` and `b`. |
| SRCH-COMB-004 | `\|` appears literally in token values as system-code separator — if `\|` is part of a literal token value, escape with `\\\|`. | §3.2.1.5.7 | `code=http://s\|c` (legal token), `code=a\\\|b` (literal `a\|b`). | — |
| SRCH-COMB-005 | OR within a multi-value parameter is only defined over the same parameter; cross-parameter OR requires `_filter`. | §3.2.1.3 / §3.2.1.7 | `_filter=name eq 'John' or code eq '12345-6'` | `name=John,code=12345-6` is not valid cross-param OR. |

## 5. Chained & reverse-chained parameters (§3.2.1.5, §3.2.1.5.3 chained)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-CHAIN-001 | Chained parameter form: `<reference-param>.<sub-param>=<value>` searches the referenced resource. | §3.2.1.5 (Chained) | `Patient?general-practitioner.name=Joe` | `Patient.general-practitioner` (dot-path without a sub-param) is not a chained search. |
| SRCH-CHAIN-002 | Type-scoped chain: `<reference-param>:<Type>.<sub-param>=<value>` when the reference targets multiple resource types. | §3.2.1.5 | `Observation?subject:Patient.name=Joe` | Must disambiguate when reference target is a choice — otherwise server MAY return 400. |
| SRCH-CHAIN-003 | Chains MAY be nested (`a.b.c=`). Depth limits are implementation-defined. **VERIFY-QUOTE**. | §3.2.1.5 | `Observation?subject:Patient.general-practitioner.name=Joe` | — |
| SRCH-HAS-001 | `_has` reverse-chain: `_has:<Resource>:<search-param>:<sub-param>=<value>` finds resources that are *referenced by* matching resources. | §3.2.1.5.1 (Reverse Chaining) | `Patient?_has:Observation:patient:code=12345-6` — patients referenced by an Observation with given code. | — |
| SRCH-HAS-002 | `_has` MAY be chained: `_has:A:x:_has:B:y:z=v` (patient referenced by A referenced by B with z=v). Left-to-right association. | §3.2.1.5.1 | `Patient?_has:Group:member:_has:CarePlan:subject:status=active` | — |

## 6. Composite parameters (§3.2.1.5.8)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-COMP-001 | Composite combines two search parameters; values are joined with `$`. | §3.2.1.5.8 | `code-value-quantity=http://loinc.org\|8480-6$gt120` | `$` literal MUST be escaped `\\$`. |
| SRCH-COMP-002 | Each composite parameter is defined by a `SearchParameter` of type `composite` whose `.component` array specifies the two sub-parameters and expressions. | SearchParameter R5 | `code-value-quantity`, `component-code-value-quantity`. | Arbitrary `$`-joins are NOT legal — only registered composites. |
| SRCH-COMP-003 | Multi-value composites use `,` for OR AT THE TOP LEVEL: `code-value-quantity=a$x,b$y` → `(a∧x) OR (b∧y)`. | §3.2.1.5.8 | — | — |

## 7. Result control (§3.2.1.6)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-RES-001 | `_count=<n>` — page size hint; "Limiting Page Size". Server MAY return fewer than n. | §3.2.1.6.3 | `_count=20` | Server MAY override; `_count` is NOT a hard upper bound on Bundle.total. |
| SRCH-RES-002 | `_sort=<field>` — ascending. `_sort=-<field>` — descending (minus prefix). Multiple keys: `_sort=status,-date`. | §3.2.1.6.1 | `_sort=-date,code` | — |
| SRCH-RES-003 | `_total=none\|estimate\|accurate` — controls whether Bundle.total is populated. Default is implementation-defined. | §3.2.1.6.2 | `_total=accurate` | — |
| SRCH-RES-004 | `_summary=true\|text\|data\|count\|false` — `true` = summary elements only, `text` = narrative + id + meta, `data` = everything except narrative, `count` = only Bundle.total (no entries), `false` = full. | §3.2.1.6.4 | `_summary=text` | `_summary=count` implies `_count=0`. |
| SRCH-RES-005 | `_elements=<name>,<name>` — field subsetting: returns only listed top-level elements plus mandatory elements and meta. | §3.2.1.6.5 | `_elements=identifier,status` | Nested-element subsetting is NOT supported. |
| SRCH-RES-006 | `_contained=true\|false\|both` — controls whether contained resources are returned as top-level matches. Default `false`. | §3.2.1.6.7 | — | — |
| SRCH-RES-007 | `_containedType=container\|contained` — when `_contained≠false`, chooses whether the container or the contained resource is reported as the match. | §3.2.1.6.7 | — | — |
| SRCH-RES-008 | `_score` — server MAY populate `Bundle.entry.search.score` for relevance. Not a request parameter; it's a response annotation. | §3.2.1.6.6 | — | Clients MAY request relevance via modifiers like `:text`. |

## 8. Paging (§3.2.1.3.2, §3.2.1.3.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-PAGE-001 | Response Bundle.link SHOULD contain `self` — "servers SHALL return the parameters that were actually used to process a search". | §3.2.1.3.2 | `link.relation=self` | — |
| SRCH-PAGE-002 | "Common links include: `first`, `last`, `next`, and `prev`" — server-opaque URLs; clients MUST NOT synthesize them from query parameters. | §3.2.1.3.3 | Follow `next` by URL. | Reconstructing a next-page URL by appending `&page=2` is non-conformant. |
| SRCH-PAGE-003 | Page URLs are opaque and MAY include stateful tokens; they remain valid for an implementation-defined time. | §3.2.1.3.3 | — | — |

## 9. Include / revinclude (§3.2.1.6.7)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| SRCH-INC-001 | `_include=<Resource>:<search-param>[:<target-type>]` adds referenced resources. | §3.2.1.6.7 | `Observation?_include=Observation:subject:Patient` | Scopes include to Patient-referenced subjects only. |
| SRCH-INC-002 | `_include=*` — wildcard, "include all references". Semantic scope is implementation-interpreted. **OPEN-QUESTION**. | §3.2.1.6.7 | — | — |
| SRCH-INC-003 | `_revinclude=<Resource>:<search-param>[:<target-type>]` — adds resources that reference the matched result. | §3.2.1.6.7 | `Patient?_revinclude=Observation:subject` | — |
| SRCH-INC-004 | `:iterate` on `_include`/`_revinclude` — applies the include directive to an already-included resource recursively. Default (no iterate) only applies to primary matches. | §3.2.1.5.5.8 | `_include=Patient:link&_include:iterate=Patient:link` | Without `:iterate`, chains do not traverse. |
| SRCH-INC-005 | `_include:iterate` MAY cause cycles; servers MAY bound the iteration depth. | §3.2.1.5.5.8 | — | — |

## 10. Metadata / common parameters

| ID | Parameter | Type | Section | Notes |
|----|-----------|------|---------|-------|
| SRCH-META-001 | `_id` | token | §3.2.1.5 (common params) | Logical resource ID; matches `Resource.id`. |
| SRCH-META-002 | `_lastUpdated` | date | §3.2.1.5 | Matches `Resource.meta.lastUpdated`. All date prefixes apply. |
| SRCH-META-003 | `_tag` | token | §3.2.1.5 | Matches `Resource.meta.tag` (Coding). |
| SRCH-META-004 | `_profile` | uri | §3.2.1.5 | Matches `Resource.meta.profile` (canonical). |
| SRCH-META-005 | `_security` | token | §3.2.1.5 | Matches `Resource.meta.security`. |
| SRCH-META-006 | `_source` | uri | §3.2.1.5 | Matches `Resource.meta.source`. |
| SRCH-META-007 | `_text` | string | §3.2.1.5 / §3.2.1.5.5.13 | Full-text match against narrative. |
| SRCH-META-008 | `_content` | string | §3.2.1.5 | Full-text across all text content. |
| SRCH-META-009 | `_list` | token/reference | §3.2.1.5 | Filters by membership in a referenced List. Syntax: `_list=<List.id>`. |

## 11. _filter (§3.2.1.7)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| SRCH-FILT-001 | `_filter=<FHIRPath-like expression>` — advanced search expression with operators (`eq`, `ne`, `gt`, `lt`, `ge`, `le`, `sa`, `eb`, `ap`, `pr` present, `po` value-set, `su` subsumes, `sb` subsumed-by, `in`, `ni`, `re` regex), combined with `and`/`or`/`not(...)`. | §3.2.1.7 | Grammar defined in §3.2.1.7.x |
| SRCH-FILT-002 | `_filter` enables cross-parameter OR that plain search cannot express. | §3.2.1.7 | `_filter=(name eq 'Joe') or (code eq '12345-6')` |
| SRCH-FILT-003 | `_filter` support is OPTIONAL for servers; clients MUST check CapabilityStatement. | §3.2.1.7 | Absence → fallback to multi-request merging. |

## 12. _query (§3.2.1.8)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| SRCH-QRY-001 | `_query=<name>` invokes a server-registered Named Query; additional parameters are the query's arguments per its SearchParameter definitions. | §3.2.1.8 | Named queries are defined by SearchParameter resources with `code=<name>`. |
| SRCH-QRY-002 | Named queries MAY redefine or override standard parameter semantics — client behavior is query-specific. | §3.2.1.8 | Check the query's OperationDefinition/SearchParameter for parameter shapes. |

## 13. HTTP POST search (§3.2.1.4)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| SRCH-POST-001 | `POST [base]/[Type]/_search` with body `application/x-www-form-urlencoded` carries search params. Functionally equivalent to GET for filtering semantics. | §3.2.1.4 | Use when URL length would exceed server limits, or when params contain sensitive PII. |
| SRCH-POST-002 | URL-level params (e.g. `_format`) MAY be passed as query string on the POST URL; body carries the filter params. | §3.2.1.4 | Hybrid form is allowed. |
| SRCH-POST-003 | `POST _search` responses are identical in shape to GET (Bundle of `searchset`). | §3.2.1.4 | — |

## 14. URL structure & errors

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| SRCH-URL-001 | Search URL form: `[base]/[Type]?<params>` for type-level, `[base]?<params>` for system-level, `[base]/[Type]/[id]/_history?<params>` for history-level filtering. | §3 | — |
| SRCH-URL-002 | Parameter names are case-sensitive; values on `string` parameters are case-insensitive by default. | §3.2.1.5 | — |
| SRCH-URL-003 | Unknown parameters — server SHOULD return 400 with OperationOutcome, OR (if `Prefer: handling=lenient`) ignore unknown parameters. | §3.2.1.1.1 (Prefer: handling) | `Prefer: handling=strict` → 400 on any unknown param. |
| SRCH-URL-004 | Response Bundle.type = `searchset` for search results. | §3.2.1.3 | `history` for history queries. |

## 15. Default matching rules — summary table

| Parameter type | Default match | Case-sensitive? | Accent-sensitive? | Prefixes allowed? | :exact | :contains | :missing | :not |
|----------------|---------------|-----------------|-------------------|-------------------|--------|-----------|----------|------|
| string | starts-with | No | No | No | yes | yes | yes | no |
| token | exact on code+system; also matches display/text | Yes (code) | Yes (code) | No | no | no | yes | yes |
| date | interval overlap per prefix | N/A | N/A | yes | no | no | yes | no |
| number | interval overlap per prefix | N/A | N/A | yes | no | no | yes | no |
| quantity | interval overlap, unit-aware (UCUM) | N/A | N/A | yes | no | no | yes | no |
| reference | exact id/URL match | Yes | N/A | No | no | no | yes | no |
| uri | exact, case-sensitive | Yes | N/A | No | no | yes | yes | no |
| composite | per-component | per-component | per-component | per-component | per-component | per-component | yes | no |
| special | per-param | — | — | — | — | — | yes | no |

---

## Cross-references

- FHIRPath used inside `_filter` grammar — see `fhirpath-n1-rules.md` §7 (Boolean logic) and §8 (Equality).
- `_include:iterate` interacts with `subject:Patient.name=…` chained params — both may be in play in the same URL; DSL authors MUST preserve semantics.
- SearchParameter resource shape (https://hl7.org/fhir/R5/searchparameter.html) — DSLExplorer should use this to validate parameter type / modifier / prefix applicability.
