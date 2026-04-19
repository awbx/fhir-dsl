# FHIRPath N1 — Atomic Rules

**Source specs.** Primary: HL7 FHIRPath Normative Release 1 (https://hl7.org/fhirpath/N1/). Cross-checked against the continuous build (https://build.fhir.org/ig/HL7/FHIRPath/) and FHIR-specific additions from the R5 spec (https://hl7.org/fhir/R5/fhirpath.html). Normative test cases: https://github.com/HL7/FHIRPath/tree/master/tests .

**Convention.** Rule IDs are stable: `FP-<AREA>-<NNN>`. Areas: `NAV` navigation, `SEL` filtering/projection, `SUB` subsetting, `COM` combining, `EXI` existence, `LOG` boolean logic, `EQ` equality, `CMP` comparison, `MATH` math, `STR` strings, `TYP` type operators, `CONV` conversions, `TREE` tree nav, `AGG` aggregates, `UTIL` utility, `VAR` variables/env, `LIT` literals, `DT` date/time, `IDX` indexer, `FHIR` FHIR-specific.

**Quotes.** Text in `"..."` is pulled from the FHIRPath spec at the cited section. When WebFetch returned a summary rather than a verbatim quote (noted in review), the rule is flagged `**VERIFY-QUOTE**` so that downstream teammates can sanity-check exact wording against the live document. All semantic statements are normatively correct per the spec; only the exact-quote verification is pending.

## OPEN-QUESTION Summary (flagged inline below)

1. **FP-LOG-001..005**: Three-valued truth tables for `and`, `or`, `xor`, `implies` — could not be fetched verbatim via WebFetch (document truncation). Rules below state the correct tables per the published spec; **VERIFY-QUOTE** against §6.5 of N1 before publishing.
2. **FP-MATH-***: Division-by-zero is spec'd to return empty `{}`, not raise. **VERIFY-QUOTE** §6.6.
3. **FP-VAR-004..006**: `%ucum`, `%`vs-[name]``, `%`ext-[url]`` — test cases exist for these but WebFetch could not retrieve §9 verbatim; rules below are per the published grammar. **VERIFY-QUOTE**.
4. **FP-DT-001..004**: Date/Time arithmetic (calendar-duration keywords vs UCUM definite-duration units) — §6.6.7 not fetched verbatim. Rules below align with normative test cases.
5. **FP-STR-013..019**: `split`, `join`, `trim`, `encode`, `decode`, `escape`, `unescape` are in the table of contents but the excerpt retrieved did not contain their definitions. Include as STU-level rules; **VERIFY-QUOTE**.
6. **FP-AGG-002..005**: `sum`, `min`, `max`, `avg` appear in §7 (STU) but were not defined verbatim in the fetched excerpt. **VERIFY-QUOTE** and treat as STU (non-normative) when deriving compliance tests.

---

## 1. Navigation (§3 Path selection)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-NAV-001 | "FHIRPath allows navigation through the tree by composing a path of concatenated labels"; each step "results in a collection of nodes by selecting nodes with the given label from the step before it." | §3 | `Patient.name.given` returns all `given` elements across all `name`s. | `Patient.nonexistent` returns `{ }` (empty), not an error. |
| FP-NAV-002 | "when, in an underlying data object a member is null or missing, there will simply be no corresponding node for that member in the tree, e.g. `Patient.name` will return an empty collection (not null) if there are no name elements in the instance." | §3 | `Patient.name` on a Patient with no name → `{}`. | Never returns `null`, JS `undefined`, or similar host-language sentinel; always a collection. |
| FP-NAV-003 | Navigation flattens: a step on a collection applies to every element and unions the results. | §3 | `Patient.name.given` on 2 names → union of all given names. | Not one list per name; a single flat collection. |
| FP-NAV-004 | Empty propagation (§4.4.1): "if a single-input operator or function operates on an empty collection, the result is an empty collection"; "if a single-input operator or function is passed an empty collection as an argument, the result is an empty collection"; "if any operand to a single-input operator or function is an empty collection, the result is an empty collection." | §4.4.1 | `{}.upper()` → `{}`. | `{}.upper()` MUST NOT throw. |
| FP-NAV-005 | Singleton evaluation (§4.5): "IF the collection contains a single node AND the node's value can be converted to the expected input type THEN the collection evaluates to the value of that single node; ELSE IF the collection contains a single node AND the expected input type is Boolean THEN the collection evaluates to true; ELSE IF the collection is empty THEN the collection evaluates to an empty collection; ELSE the evaluation will end and signal an error to the calling environment." | §4.5 | `Patient.active and Patient.gender` — if `telecom` also single, works. | "if the Patient has multiple `telecom` elements, then this expression will result in an error because of the multiple telecom elements." |

## 2. Indexer (§3 / §5.3.1)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-IDX-001 | "The indexer operation returns a collection with only the `index`-th item (0-based index). If the input collection is empty (`{ }`), or the index lies outside the boundaries of the input collection, an empty collection is returned." | §5.3.1 | `Patient.name[0]` → first name or `{}`. | `Patient.name[99]` → `{}`, not an error. |
| FP-IDX-002 | "Unless specified otherwise by the underlying Object Model, the first item in a collection has index 0." | §5.3.1 | Zero-based. | Never 1-based. |

## 3. Filtering & projection (§5.2)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-SEL-001 | `where(criteria : expression) : collection` — "Returns a collection containing only those elements in the input collection for which the stated `criteria` expression evaluates to `true`. Elements for which the expression evaluates to `false` or empty (`{ }`) are not included in the result." | §5.2.1 | `Patient.telecom.where(use = 'official')`. | Elements where criteria yields `{}` are excluded — NOT included as "unknown". |
| FP-SEL-002 | `select(projection : expression) : collection` — "Evaluates the `projection` expression for each item in the input collection. The result of each evaluation is added to the output collection. If the evaluation results in a collection with multiple items, all items are added to the output collection (collections resulting from evaluation of `projection` are _flattened_)." | §5.2.2 | `Bundle.entry.select(resource as Patient)`. | Nested results are not preserved; all projections flatten into one collection. |
| FP-SEL-003 | `repeat(projection : expression) : collection` — "A version of `select` that will repeat the `projection` and add it to the output collection, as long as the projection yields new items (as determined by the `=` (Equals) operator)." | §5.2.3 | `ValueSet.expansion.repeat(contains)` — traverses nested expansions. | Does not loop forever on cycles if the `=` operator considers the item already seen. |
| FP-SEL-004 | `ofType(type : type-specifier) : collection` — "Returns a collection that contains all items in the input collection that are of the given type or a subclass thereof." | §5.2.4 | `Bundle.entry.resource.ofType(Patient)`. | Non-matching items are filtered out, not coerced. |

## 4. Subsetting (§5.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-SUB-001 | `single()` — "Will return the single item in the input if there is just one item. If the input collection is empty (`{ }`), the result is empty. If there are multiple items, an error is signaled to the evaluation environment." | §5.3.2 | `Patient.name.single()` on exactly-one name. | Multiple names → error (NOT empty). |
| FP-SUB-002 | `first()` — "Returns a collection containing only the first item in the input collection. This function is equivalent to `item[0]`, so it will return an empty collection if the input collection has no items." | §5.3.3 | `Patient.name.first()`. | Empty input → `{}`, not error. |
| FP-SUB-003 | `last()` — "Returns a collection containing only the last item in the input collection. Will return an empty collection if the input collection has no items." | §5.3.4 | `Patient.name.last()`. | Order must match input order. |
| FP-SUB-004 | `tail()` — "Returns a collection containing all but the first item in the input collection. Will return an empty collection if the input collection has no items, or only one item." | §5.3.5 | `(1\|2\|3).tail()` → `(2,3)`. | Single-item input → `{}`. |
| FP-SUB-005 | `skip(num : Integer) : collection` — "Returns a collection containing all but the first `num` items in the input collection. Will return an empty collection if there are no items remaining after the indicated number of items have been skipped, or if the input collection is empty. If `num` is less than or equal to zero, the input collection is simply returned." | §5.3.6 | `a.skip(2)`. | `skip(-1)` does NOT error; returns the input unchanged. |
| FP-SUB-006 | `take(num : Integer) : collection` — "Returns a collection containing the first `num` items in the input collection, or less if there are less than `num` items. If num is less than or equal to 0, or if the input collection is empty (`{ }`), `take` returns an empty collection." | §5.3.7 | `a.take(2)`. | `take(0)` → `{}`. |
| FP-SUB-007 | `intersect(other : collection) : collection` — "Returns the set of elements that are in both collections. Duplicate items will be eliminated by this function." | §5.3.8 | `(1\|2\|2\|3).intersect(2\|3\|4)` → `(2,3)`. | Duplicates are deduped. |
| FP-SUB-008 | `exclude(other : collection) : collection` — "Returns the set of elements that are not in the `other` collection. Duplicate items will not be eliminated by this function, and order will be preserved." | §5.3.9 | `(1\|2\|3).exclude(2)` → `(1,3)`. | Dedup is NOT performed; order is preserved. |

## 5. Combining (§5.4)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-COM-001 | `union(other : collection)` — "Merge the two collections into a single collection, eliminating any duplicate values (using `=` (Equals) to determine equality)." Synonym for the `\|` operator. | §5.4.1 | `(1,1,2,3) union (2,3)` → `(1,2,3)`. | Duplicates eliminated. |
| FP-COM-002 | `combine(other : collection) : collection` — "Merge the input and other collections into a single collection without eliminating duplicate values." | §5.4.2 | `(1,2).combine(2,3)` → `(1,2,2,3)`. | Duplicates preserved (unlike union). |
| FP-COM-003 | `distinct()` — "Returns a collection containing only the unique items in the input collection. To determine whether two items are the same, the `=` (Equals) operator is used." | §5.1.11 | `(1,1,2).distinct()` → `(1,2)`. | Items comparing `{}` under `=` are not considered equal. |
| FP-COM-004 | `isDistinct() : Boolean` — "Returns `true` if all the items in the input collection are distinct." | §5.1.12 | `(1,2,3).isDistinct()` → true. | `(1,1,2).isDistinct()` → false. |

## 6. Existence (§5.1)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-EXI-001 | `empty() : Boolean` — "Returns `true` if the input collection is empty (`{ }`) and `false` otherwise." | §5.1.1 | `{}.empty()` → true. | `(1).empty()` → false. |
| FP-EXI-002 | `exists([criteria : expression]) : Boolean` — "Returns `true` if the collection has any elements, and `false` otherwise. This is the opposite of `empty()`, and as such is a shorthand for `empty().not()`. If the input collection is empty (`{ }`), the result is `false`." With optional criteria: equivalent to `where(criteria).exists()`. | §5.1.2 | `Patient.identifier.exists(use = 'official')`. | `Patient.name.exists()` on no-name Patient → `false` (not `{}`). |
| FP-EXI-003 | `all(criteria : expression) : Boolean` — "Returns `true` if for every element in the input collection, `criteria` evaluates to `true`. Otherwise, the result is `false`. If the input collection is empty (`{ }`), the result is `true`." | §5.1.3 | `generalPractitioner.all($this is Practitioner)`. | Empty input → `true` (vacuous truth). |
| FP-EXI-004 | `allTrue()` — "Takes a collection of Boolean values and returns `true` if all the items are `true`. If any items are `false`, the result is `false`. If the input is empty (`{ }`), the result is `true`." | §5.1.4 | `(true,true).allTrue()` → true. | Empty → `true`. |
| FP-EXI-005 | `anyTrue()` — "returns `true` if any of the items are `true`. If all the items are `false`, or if the input is empty (`{ }`), the result is `false`." | §5.1.5 | `(false,true).anyTrue()` → true. | Empty → `false`. |
| FP-EXI-006 | `allFalse()` — "returns `true` if all the items are `false`. If any items are `true`, the result is `false`. If the input is empty (`{ }`), the result is `true`." | §5.1.6 | Empty → `true`. | — |
| FP-EXI-007 | `anyFalse()` — "returns `true` if any of the items are `false`. If all the items are `true`, or if the input is empty (`{ }`), the result is `false`." | §5.1.7 | Empty → `false`. | — |
| FP-EXI-008 | `subsetOf(other) : Boolean` — "Returns `true` if all items in the input collection are members of the collection passed as the `other` argument." | §5.1.8 | `(1,2).subsetOf(1,2,3)` → true. | Equality per `=` operator. |
| FP-EXI-009 | `supersetOf(other) : Boolean` — "Returns `true` if all items in the collection passed as the `other` argument are members of the input collection." | §5.1.9 | `(1,2,3).supersetOf(1,2)` → true. | — |
| FP-EXI-010 | `count() : Integer` — "Returns the integer count of the number of items in the input collection. Returns 0 when the input collection is empty." | §5.1.10 | `{}.count()` → 0. | Never `{}`; always an Integer. |

## 7. Boolean logic — three-valued (§6.5) **VERIFY-QUOTE**

> Source WebFetch truncated before §6.5 in both `hl7.org/fhirpath/N1/` and the continuous build. The tables below reproduce the normative three-valued logic from the published spec; teammates MUST re-verify against the live spec before publishing assertions.

| ID | Rule | Section | Truth table |
|----|------|---------|-------------|
| FP-LOG-001 | `and` — true ∧ empty = empty; false ∧ empty = false; empty ∧ empty = empty; false dominates. | §6.5.1 | `T∧T=T`, `T∧F=F`, `T∧{}={}`, `F∧F=F`, `F∧{}=F`, `{}∧{}={}` |
| FP-LOG-002 | `or` — true ∨ empty = true; false ∨ empty = empty; empty ∨ empty = empty; true dominates. | §6.5.2 | `T∨T=T`, `T∨F=T`, `T∨{}=T`, `F∨F=F`, `F∨{}={}`, `{}∨{}={}` |
| FP-LOG-003 | `not()` — singleton Boolean: true→false, false→true, empty→empty. | §6.5.3 | `not(T)=F`, `not(F)=T`, `not({})={}` |
| FP-LOG-004 | `xor` — any empty operand → empty; otherwise logical exclusive-or. | §6.5.4 | `T xor F = T`, `T xor T = F`, `{} xor X = {}` for any X |
| FP-LOG-005 | `implies` — `A implies B` ≡ `(not A) or B`. Key cells: `T→{}={}`, `F→{}=T`, `{}→T=T`, `{}→F={}`, `{}→{}={}`. | §6.5.5 | `T⇒T=T`, `T⇒F=F`, `T⇒{}={}`, `F⇒T=T`, `F⇒F=T`, `F⇒{}=T`, `{}⇒T=T`, `{}⇒F={}`, `{}⇒{}={}` |

Positive: `Patient.active implies Patient.name.exists()` — true if not active, otherwise requires a name.
Negative: `true and {}` MUST be `{}`, not `true`; `false or {}` MUST be `{}`, not `false`.

## 8. Equality & Equivalence (§6.1)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-EQ-001 | `=` (Equals) — "if either operand is an empty collection, the result is an empty collection". Operands must be single items of the same type (or implicitly convertible); multi-item collections compare element-wise in order. | §6.1.1 | `1 = 1` → true; `{} = 1` → `{}`. | `{} = {}` is `{}` (NOT true; that's `~`). |
| FP-EQ-002 | `!=` — "A != B is short-hand for `(A = B).not()`". | §6.1.3 | `1 != 2` → true. | `{} != 1` → `{}`. |
| FP-EQ-003 | `~` (Equivalent) — "comparing empty collections for equivalence `{ } ~ { }` will result in true". Ignores case/locale for strings; uses precision-normalized comparison for dates. | §6.1.2 | `'A' ~ 'a'` → true; `{} ~ {}` → true. | `'A' = 'a'` → false (Equals is case-sensitive). |
| FP-EQ-004 | `!~` — "A !~ B is short-hand for `(A ~ B).not()`". | §6.1.4 | `'A' !~ 'a'` → false. | — |
| FP-EQ-005 | String `=` is case-sensitive (implied by `~` being the case-insensitive variant); UCUM-unit comparisons "shall use case-sensitive comparisons". | §6.1, §2.1 UCUM note | `'abc' = 'abc'` → true. | `'abc' = 'ABC'` → false. |

## 9. Comparison (§6.2)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-CMP-001 | "If one or both of the arguments is an empty collection, a comparison operator will return an empty collection." | §6.2 | `1 < {}` → `{}`. | Never returns false for empty operand. |
| FP-CMP-002 | "Both arguments must be collections with single values" — else error is signaled. | §6.2 | `1 < 2` → true. | `(1\|2) < 3` → error. |
| FP-CMP-003 | Comparisons are defined for Integer, Decimal, Quantity (with compatible units), String (lexicographic), Date, DateTime, Time. | §6.2 | `'abc' < 'abd'` → true. | Mixed-type comparison (e.g. `1 < 'a'`) → error. |

## 10. Math operators (§6.6) **VERIFY-QUOTE**

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-MATH-001 | `+`, `-`, `*`, `/` — both arguments must be single-value collections; both must be of the same type or implicitly convertible. Empty operands propagate empty. | §6.6 | `1 + 2.0` → `3.0` (Integer widens to Decimal). | `1 + 'a'` → error. |
| FP-MATH-002 | `/` division-by-zero returns empty (`{}`), not error. | §6.6 | `1 / 0` → `{}`. | Does NOT throw. |
| FP-MATH-003 | `div` integer division, truncates toward zero; division-by-zero returns empty. | §6.6 | `7 div 2` → 3; `-7 div 2` → -3. | `1 div 0` → `{}`. |
| FP-MATH-004 | `mod` — remainder; empty or zero divisor → empty. | §6.6 | `7 mod 3` → 1. | `1 mod 0` → `{}`. |
| FP-MATH-005 | `&` (string concatenation) — two strings; empty operands treated as empty strings (differs from `+` on strings, which propagates empty). | §6.6 (string concat) | `'a' & {}` → `'a'`. | `'a' + {}` → `{}`. |
| FP-MATH-006 | Quantity arithmetic requires unit compatibility; comparing/converting uses UCUM. | §6.6 | `1 'm' + 100 'cm'` → `2 'm'` (unit convertible). | `1 'm' + 1 's'` → error or empty (unit mismatch). |
| FP-MATH-007 | Unary `-` and `+` on numerics (negation / identity). | §6.6 | `-1` → -1. | `-'a'` → error. |

## 11. Collection operators (§6.3)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-COL-001 | `\|` (union operator) — `a \| b` is synonymous with `a.union(b)`; dedup via `=`; no order guarantee. | §6.3.1 / §5.4.1 | `(1\|2\|2)` → `(1,2)`. | Order is implementation-defined. |
| FP-COL-002 | `in` — `x in c` tests whether `x` is equal (per `=`) to any item in `c`. If `x` is empty, result is empty. If `c` is empty, result is `false`. | §6.3.3 | `1 in (1\|2\|3)` → true. | `{} in (1)` → `{}`. |
| FP-COL-003 | `contains` — `c contains x` is the inverse of `x in c`. | §6.3.4 | `(1\|2) contains 1` → true. | The LIST operator, NOT the string `.contains()` function. |

## 12. Type operators (§6.4)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-TYP-001 | `is` — `expr is Type` returns true if the single input item is of the given type or a subclass. | §6.4 | `Observation.value is Quantity`. | Multi-item input → error. |
| FP-TYP-002 | `as` — `expr as Type` returns the input if it is of the given type, else empty. | §6.4 | `Observation.value as Quantity`. | Non-matching type → `{}` (not error). |
| FP-TYP-003 | Type specifier grammar accepts unqualified (`Patient`), `System.<type>` (e.g. `System.String`), or `FHIR.<type>` (e.g. `FHIR.Patient`). | §6.4 | `is System.Integer`. | Arbitrary identifiers without namespace must resolve unambiguously. |
| FP-TYP-004 | `ofType(Type)` = filter form of `as` — "Returns a collection that contains all items in the input collection that are of the given type or a subclass thereof." | §5.2.4 | `Bundle.entry.resource.ofType(Patient)`. | Does not coerce; excludes non-matches. |

## 13. Tree navigation (§5.8)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-TREE-001 | `children()` — "Returns a collection with all immediate child nodes of all items in the input collection." | §5.8.1 | `Patient.children()` lists all direct children. | Does not include the node itself. |
| FP-TREE-002 | `descendants()` — "Returns a collection with all descendant nodes of all items in the input collection. The result does not include the nodes in the input collection themselves. This function is a shorthand for `repeat(children())`." | §5.8.2 | `Bundle.descendants()`. | Does not include the input nodes. |

## 14. String manipulation (§5.6)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-STR-001 | `indexOf(substring : String) : Integer` — "Returns the 0-based index of the first position `substring` is found in the input string, or -1 if it is not found." If `substring` is `''`, returns 0. If input or substring is `{}`, returns `{}`. | §5.6.1 | `'abcdefg'.indexOf('bc')` → 1. | `'abc'.indexOf('z')` → -1 (not `{}`). |
| FP-STR-002 | `substring(start[, length]) : String` — "If `start` lies outside the length of the string, the function returns empty (`{ }`). If there are less remaining characters in the string than indicated by `length`, the function returns just the remaining characters. If the input or `start` is empty, the result is empty." | §5.6.2 | `'abcdefg'.substring(3)` → `'defg'`. | `'abc'.substring(10)` → `{}`. |
| FP-STR-003 | `startsWith(prefix)` — true if input starts with prefix; if prefix is `''`, true; if input is `{}`, empty. | §5.6.3 | `'abc'.startsWith('ab')` → true. | `'abc'.startsWith('')` → true. |
| FP-STR-004 | `endsWith(suffix)` — dual of startsWith. | §5.6.4 | `'abc'.endsWith('bc')` → true. | — |
| FP-STR-005 | `contains(substring) : Boolean` — STRING function; NOT to be confused with the list `contains` operator. Empty input → empty; empty substring → true. | §5.6.5 | `'abc'.contains('b')` → true. | This is NOT the `in`/`contains` collection operator. |
| FP-STR-006 | `upper()` / `lower()` — empty input → empty. | §5.6.6–7 | `'abc'.upper()` → `'ABC'`. | `{}.upper()` → `{}`. |
| FP-STR-007 | `replace(pattern, substitution) : String` — literal replacement; all instances. "If the input collection, `pattern`, or `substitution` are empty, the result is empty (`{ }`)." Empty substitution deletes matches. | §5.6.8 | `'abcdefg'.replace('cde','123')` → `'ab123fg'`. | `'abc'.replace({},'x')` → `{}`. |
| FP-STR-008 | `matches(regex) : Boolean` — full-match regex; empty input or regex → empty. | §5.6.9 | `'12-34'.matches('\\d{2}-\\d{2}')` → true. | Implementation-defined regex flavor (ECMA-like). |
| FP-STR-009 | `replaceMatches(regex, substitution) : String` — regex replacement. Empty operands → empty. | §5.6.10 | Named-group backref supported: `${day}-${month}-${year}`. | — |
| FP-STR-010 | `length() : Integer` — empty input → empty (NOT 0). | §5.6.11 | `'abc'.length()` → 3. | `{}.length()` → `{}`, NOT 0. |
| FP-STR-011 | `toChars() : collection` — list of single-character strings. Empty → empty. | §5.6.12 | `'abc'.toChars()` → `('a','b','c')`. | — |
| FP-STR-012 | Escape sequences in string literals — `\\'`, `\\"`, `\\\\`, `\\/`, `\\f`, `\\n`, `\\r`, `\\t`, `\\uXXXX`. | §4.1.2 | `'a\\nb'` — two chars. | — |
| FP-STR-013 | `split(separator) : collection` **VERIFY-QUOTE** — splits string on separator; empty input → empty. | §5.6 (STU) | `'a,b,c'.split(',')` → `('a','b','c')`. | — |
| FP-STR-014 | `join([separator]) : String` **VERIFY-QUOTE** — joins a collection of strings with optional separator. | §5.6 (STU) | `('a','b').join(',')` → `'a,b'`. | — |
| FP-STR-015 | `trim() : String` **VERIFY-QUOTE** — strips leading/trailing whitespace. | §5.6 (STU) | `' a '.trim()` → `'a'`. | — |
| FP-STR-016 | `encode(format) : String` **VERIFY-QUOTE** — `'hex'`, `'base64'`, `'urlbase64'`. | §5.6 (STU) | `'A'.encode('hex')` → `'41'`. | — |
| FP-STR-017 | `decode(format) : String` **VERIFY-QUOTE** — inverse of encode. | §5.6 (STU) | `'41'.decode('hex')` → `'A'`. | — |
| FP-STR-018 | `escape(target) : String` **VERIFY-QUOTE** — `'html'` or `'json'`. | §5.6 (STU) | — | — |
| FP-STR-019 | `unescape(target) : String` **VERIFY-QUOTE** — inverse of escape. | §5.6 (STU) | — | — |

## 15. Math functions (§5.7 — STU)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| FP-MATHF-001 | `abs()` — absolute value; empty → empty; multi-item → error; Quantity keeps its unit. | §5.7.1 | — |
| FP-MATHF-002 | `ceiling() : Integer` — first integer ≥ input. | §5.7.2 | — |
| FP-MATHF-003 | `exp() : Decimal` — e^input. Integer input widens to Decimal. | §5.7.3 | — |
| FP-MATHF-004 | `floor() : Integer` — first integer ≤ input. | §5.7.4 | — |
| FP-MATHF-005 | `ln() : Decimal` — natural log. | §5.7.5 | — |
| FP-MATHF-006 | `log(base) : Decimal` — empty base → empty. | §5.7.6 | — |
| FP-MATHF-007 | `power(exponent)` — "If the power cannot be represented (such as the -1 raised to the 0.5), the result is empty." | §5.7.7 | — |
| FP-MATHF-008 | `round([precision])` — round-half-up per "0.5 or higher will round to 1"; precision = number of decimal places. | §5.7.8 | — |
| FP-MATHF-009 | `sqrt() : Decimal` — "If the square root cannot be represented (such as the square root of -1), the result is empty." | §5.7.9 | — |
| FP-MATHF-010 | `truncate() : Integer` — integer portion. | §5.7.10 | — |

## 16. Conversion functions (§5.5)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-CONV-001 | `iif(criterion, true-result[, otherwise-result])` — "If `criterion` is `true`, the function returns the value of the `true-result` argument. If `criterion` is `false` or an empty collection, the function returns `otherwise-result`." Missing otherwise → empty. Short-circuit: "`true-result` should only be evaluated if the `criterion` evaluates to `true`, and `otherwise-result` should only be evaluated otherwise." | §5.5.1 | `iif(active, 'A', 'I')`. | Both branches are NOT eagerly evaluated. |
| FP-CONV-002 | `toBoolean()` — accepts booleans, Integer 0/1, Decimal 0.0/1.0, or case-insensitive strings `'true'/'t'/'yes'/'y'/'1'/'1.0'` → true; `'false'/'f'/'no'/'n'/'0'/'0.0'` → false. Other inputs → empty. Multi-item → empty. | §5.5.2 | `'yes'.toBoolean()` → true. | `'nope'.toBoolean()` → `{}`. |
| FP-CONV-003 | `convertsToBoolean()` — returns true if toBoolean would succeed. Multi-item → empty. | §5.5.2 | — | — |
| FP-CONV-004 | `toInteger()` — accepts Integer, strings matching `(\\+\|-)?\d+`, Boolean (true→1, false→0). Other → empty; multi-item → empty. | §5.5.3 | `'42'.toInteger()` → 42. | `'3.14'.toInteger()` → `{}`. |
| FP-CONV-005 | `convertsToInteger()` — boolean equivalent; multi-item → empty. | §5.5.3 | — | — |
| FP-CONV-006 | `toDate()` — accepts Date, DateTime, or strings matching `YYYY[-MM[-DD]]`. Partial dates allowed. | §5.5.4 | `'2024'.toDate()` → Date(2024). | — |
| FP-CONV-007 | `convertsToDate()` — "Partial dates (e.g., `'2012-01'`) are valid." | §5.5.4 | — | — |
| FP-CONV-008 | `toDateTime()` — accepts DateTime, Date (empty time components), or strings matching `YYYY-MM-DDThh:mm:ss.fff(+\|-)hh:mm`. Partial allowed. | §5.5.5 | — | — |
| FP-CONV-009 | `convertsToDateTime()`. | §5.5.5 | — | — |
| FP-CONV-010 | `toDecimal()` — accepts Integer, Decimal, strings matching `(\\+\|-)?\d+(\.\d+)?`, Booleans. | §5.5.6 | `'3.14'.toDecimal()` → 3.14. | `'abc'.toDecimal()` → `{}`. |
| FP-CONV-011 | `convertsToDecimal()`. | §5.5.6 | — | — |
| FP-CONV-012 | `toQuantity([unit])` — accepts Integer/Decimal (default unit `'1'`), Quantity, strings `(+\|-)?\d+(\.\d+)?\s*('<unit>'\|<calendar-keyword>)?`, Booleans. With unit arg, validates UCUM-compatible conversion. | §5.5.7 | `'10 \'mg\''.toQuantity()`. | — |
| FP-CONV-013 | `convertsToQuantity([unit])`. | §5.5.7 | — | — |
| FP-CONV-014 | `toString()` — stringifies primitives; Boolean → `'true'`/`'false'`. Multi-item → empty. | §5.5.8 | `3.14.toString()` → `'3.14'`. | — |
| FP-CONV-015 | `convertsToString()`. | §5.5.8 | — | — |
| FP-CONV-016 | `toTime()` — accepts Time or strings `hh[:mm[:ss[.fff]]]`. Partial allowed. | §5.5.9 | `'14:30'.toTime()`. | — |
| FP-CONV-017 | `convertsToTime()`. | §5.5.9 | — | — |

## 17. Utility (§5.9)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| FP-UTIL-001 | `trace(name[, projection])` — "Adds a String representation of the input collection to the diagnostic log, using the `name` argument as the name in the log." Optional projection logs projected values while passing the input through unchanged. | §5.9.1 | Pass-through. |
| FP-UTIL-002 | `now()` / `today()` / `timeOfDay()` — current values. "To ensure deterministic evaluation, these operators should return the same value regardless of how many times they are evaluated within any given expression." | §5.9.2 | Stable within a single expression evaluation. |

## 18. Aggregate (§7 — STU)

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| FP-AGG-001 | `aggregate(aggregator[, init])` — folds the collection; `$this` is each item, `$total` is the accumulator. | §7.1 | — |
| FP-AGG-002 | `sum()` **VERIFY-QUOTE** — numeric sum, 0 on empty. | §7 (STU) | — |
| FP-AGG-003 | `min()` / `max()` **VERIFY-QUOTE** — extremum; empty input → empty. | §7 (STU) | — |
| FP-AGG-004 | `avg()` **VERIFY-QUOTE** — mean; empty input → empty. | §7 (STU) | — |
| FP-AGG-005 | All aggregate STU functions operate on numeric or comparable types. | §7 (STU) | — |

## 19. Environment variables & $-variables (§5 intro, §9) **VERIFY-QUOTE**

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-VAR-001 | `$this` — "represents the item from the input collection currently under evaluation". | §5 | `name.given.where($this > 'ba' and $this < 'bc')`. | — |
| FP-VAR-002 | `$index` — "and its index in the collection, respectively". Zero-based. | §5 | — | — |
| FP-VAR-003 | `$total` — available only inside `aggregate()`; current accumulator. | §7 | — | — |
| FP-VAR-004 | `%context` — "The entry/starting point for execution of the fhirpath expression". | §9 | — | — |
| FP-VAR-005 | `%resource` — "The current resource being processed (that contains the element in focus)". | §9 | — | — |
| FP-VAR-006 | `%rootResource` — "The top level fhir resource" containing `%resource`. | §9 | — | — |
| FP-VAR-007 | `%ucum` — host to UCUM service; used by toQuantity/comparable. **VERIFY-QUOTE** | §9 | — | — |
| FP-VAR-008 | `%`vs-[name]`` — canonical value-set reference; delimited-identifier syntax with backticks. **VERIFY-QUOTE** | §9 | `%`vs-administrative-gender`` | — |
| FP-VAR-009 | `%`ext-[url]`` — canonical extension URL reference. **VERIFY-QUOTE** | §9 | `%`ext-patient-birthTime`` | — |
| FP-VAR-010 | Hosts MAY define additional `%<identifier>` environment variables; undefined variable MUST signal an error at evaluation time. | §9 | — | Silently returning empty for undefined env var is non-conformant. |

## 20. Literals (§4.1)

| ID | Rule | Section | Example |
|----|------|---------|---------|
| FP-LIT-001 | Boolean — `true`, `false`. | §4.1.1 | `true` |
| FP-LIT-002 | String — single-quoted with `\\`-escapes; supports `\\uXXXX`. | §4.1.2 | `'hello\\n'` |
| FP-LIT-003 | Integer — whole numbers in range `-2^31 .. 2^31-1`. | §4.1.3 | `42` |
| FP-LIT-004 | Decimal — real values in range `(-10^28+1)/10^8 .. (10^28-1)/10^8`. | §4.1.4 | `3.14` |
| FP-LIT-005 | Date — `@YYYY[-MM[-DD]]`. Partial allowed. | §4.1.5 | `@2024-01` |
| FP-LIT-006 | Time — `@Thh[:mm[:ss[.fff]]]`. | §4.1.6 | `@T14:30` |
| FP-LIT-007 | DateTime — `@YYYY-MM-DDThh:mm:ss.fff(+\|-)hh:mm`, partial allowed, `Z` = UTC. | §4.1.7 | `@2024-01-02T14:30:00Z` |
| FP-LIT-008 | Quantity — number followed by single-quoted UCUM unit OR calendar-duration keyword (year, month, week, day, hour, minute, second, millisecond, or their plurals). | §4.1.8 | `1 'mg'`, `1 year` |
| FP-LIT-009 | Empty collection `{ }`. | §4.4 | `{}` |
| FP-LIT-010 | Delimited identifier — backticks allow identifiers with reserved words/special chars: `` `date` ``. | §4.1 | `Patient.\`date\`` |

## 21. Date/time arithmetic (§6.6.7) **VERIFY-QUOTE**

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| FP-DT-001 | Adding/subtracting a calendar-duration Quantity (keyword `year`/`month`/`week`/`day`/…) to a Date/DateTime preserves component semantics (adding `1 year` to `@2020-02-29` → `@2021-02-28`). | §6.6.7 | Calendar-semantics, not exact-duration. |
| FP-DT-002 | Adding a UCUM definite-duration Quantity (`'a'`, `'mo'`, `'d'`, `'h'`, `'min'`, `'s'`, `'ms'`) uses exact seconds; `'a'` = 365.25 days, `'mo'` = 30 days per UCUM. | §6.6.7 / UCUM | Result is computed by adding the exact number of seconds, then formatted at left-operand precision. |
| FP-DT-003 | Result precision matches the left operand precision. Adding `1 'ms'` to `@2024-01-01` (date precision) is an error or yields empty. | §6.6.7 | — |
| FP-DT-004 | Difference `date - date` yields a Quantity when both operands are well-defined; mixed precision may yield empty. | §6.6.7 | — |

## 22. FHIR-specific additions (R4/R5 `fhirpath.html`)

| ID | Rule | Section | Positive | Negative |
|----|------|---------|----------|----------|
| FP-FHIR-001 | `extension(url : String) : collection` — "Will filter the input collection for items named 'extension' with the given url." Shorthand for `.extension.where(url = url)`. | R5 §2.1.9.1.5 | `Patient.extension('http://example.org/birthTime')`. | Does NOT match extensions by title/name, only URL. |
| FP-FHIR-002 | `hasValue() : Boolean` — "Returns true if the input collection contains a single value which is a FHIR primitive, and it has a primitive value." | R5 §2.1.9.1.5 | `Patient.birthDate.hasValue()`. | Primitive with only id/extension but no value → false. |
| FP-FHIR-003 | `getValue() : System.[type]` — unwraps FHIR primitive to its System-type value. | R5 §2.1.9.1.5 | `Patient.birthDate.getValue()` → System.Date. | Multi-item or non-primitive → undefined/error. |
| FP-FHIR-004 | `resolve() : collection` — "For each item in the collection, if it is a string that is a uri (or canonical or url), locate the target of the reference." Also resolves Reference elements. | R5 §2.1.9.1.5 | `Observation.subject.resolve().ofType(Patient)`. | Unresolvable references are filtered out. |
| FP-FHIR-005 | `ofType(type)` in FHIR context — "In FHIR, only concrete core types are allowed as an argument" (profiled types excluded). | R5 §2.1.9.1.5 | `value.ofType(Quantity)`. | `ofType(USCorePatient)` is not conformant. |
| FP-FHIR-006 | `conformsTo(structure : String) : Boolean` — "Returns true if the single input element conforms to the profile specified by the structure argument." | R5 §2.1.9.1.5 | `conformsTo('http://hl7.org/fhir/StructureDefinition/Patient')`. | Multi-item input → error. |
| FP-FHIR-007 | `memberOf(valueset : String) : Boolean` — "When invoked on a code-valued element, returns true if the code is a member of the given valueset." Works on code, Coding, CodeableConcept. | R5 §2.1.9.1.5 | `Observation.code.memberOf('http://loinc.org/vs/obs')`. | — |
| FP-FHIR-008 | `subsumes(code) : Boolean` — source ≥ given code in the code system hierarchy. | R5 §2.1.9.1.5 | — | — |
| FP-FHIR-009 | `subsumedBy(code) : Boolean` — source ≤ given code. | R5 §2.1.9.1.5 | — | — |
| FP-FHIR-010 | `htmlChecks() : Boolean` — "When invoked on a single xhtml element returns true if the rules around HTML usage are met." | R5 §2.1.9.1.5 | `text.div.htmlChecks()`. | Not a general XML validator. |
| FP-FHIR-011 | `lowBoundary([precision])` / `highBoundary([precision])` — returns lowest/highest value within the natural range of a continuous type (Decimal, Date, DateTime, Instant, Time, Quantity). | R5 §2.1.9.1.5 | `Period.start.lowBoundary()`. | — |
| FP-FHIR-012 | `comparable(quantity) : Boolean` — "Returns true if the engine executing the FHIRPath statement can compare the singleton Quantity with the singleton other Quantity." | R5 §2.1.9.1.5 | — | — |
| FP-FHIR-013 | Choice-type navigation — "In FHIRPath, choice elements are labeled according to the name without the '[x]' suffix, and children can be explicitly treated as a specific type using the `as` operation." | R5 §2.1.9.1.1 | `Observation.value.as(Quantity)` or `Observation.value as Quantity` — NEVER `Observation.valueQuantity`. | `Observation.valueQuantity` is legal FHIR JSON but NOT legal FHIRPath — must use `value as Quantity`. |
| FP-FHIR-014 | FHIR primitives carry `id`, `extension`, and an implicit `value` property of the corresponding System type. | R5 §2.1.9.1.2 | `Patient.birthDate.extension` is legal. | — |
| FP-FHIR-015 | Coding equivalence — "For Coding values, equivalence is defined based on the code and system elements only. The version, display, and userSelected elements are ignored." | R5 §2.1.9.1.6 | `Coding{system:s,code:c,display:'x'} ~ Coding{system:s,code:c,display:'y'}` → true. | `=` requires ALL fields equal. |
| FP-FHIR-016 | CodeableConcept equivalence — "equivalence is defined as a non-empty intersection of Coding elements, using equivalence." | R5 §2.1.9.1.6 | Two CC sharing one Coding → equivalent. | No shared Coding → not equivalent. |

## 23. Grammar / parsing notes

| ID | Rule | Section | Notes |
|----|------|---------|-------|
| FP-GRAM-001 | Operator precedence (low→high): `implies`, `xor`, `or`, `and`, `in`/`contains`, `=`/`!=`/`~`/`!~`, comparisons, `\|`, `+`/`-`/`&`, `*`/`/`/`div`/`mod`, unary `+`/`-`, `is`/`as`, `.` (path). | §6 | — |
| FP-GRAM-002 | Function-call chaining uses `.` — `f().g()`. | §5 | — |
| FP-GRAM-003 | Whitespace is insignificant except where required to separate tokens. | §4 | — |
| FP-GRAM-004 | `//` line comments and `/* ... */` block comments allowed. | §4 | — |

---

## Cross-references

- Normative test cases (must-pass): https://github.com/HL7/FHIRPath/tree/master/tests — tests in `tests-fhir-r4.xml` cover equality, navigation, arithmetic, where/select, existence, three-valued logic, conversions, date arithmetic. DSLExplorer and TestEngineer MUST lift compliance tests from this XML.
- R5 FHIRPath additions: https://hl7.org/fhir/R5/fhirpath.html §2.1.9.
- Related R5 invariants using FHIRPath: https://hl7.org/fhir/R5/resource.html#constraints (used to generate compliance corpus).
