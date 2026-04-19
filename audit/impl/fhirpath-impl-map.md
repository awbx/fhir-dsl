# FHIRPath Implementation Map (`packages/fhirpath`)

**Author:** dsl-explorer.
**Target:** Every rule in `audit/spec/fhirpath-n1-rules.md`.
**Source commit:** `main` at time of audit (see `git log`).
**Method:** Source-read only. No tests executed. `file:line` citations are absolute against the current working tree.

## Status legend

- **IMPLEMENTED** — Behaves per spec on the core case. `file:line` + behavior note required.
- **PARTIAL** — Works on happy path but diverges on an identifiable edge. Delta quantified.
- **INCORRECT** — Observable spec violation. Code quote + concrete counter-example.
- **MISSING** — No code path exists for this rule.

## Compile vs runtime split

The fhirpath package has **two** behaviors per rule:

- **Compile (string):** `expr.compile()` returns the FHIRPath source string. Implemented by `builder.ts` (surface proxy) + `expression.ts` (predicate proxy).
- **Runtime (eval):** `expr.evaluate(resource)` returns a collection. Implemented by `evaluator.ts` dispatch + `eval/*.ts` ops.

The surface API exposes **only a subset** of the FHIRPath language. Many compile-side operators are missing entirely (no binary `+/-/*//`, no `|` union syntax as a pipe-operator, no `$index`/`$total`, no env-vars, no aggregate fold, no extension/hasValue/getValue/resolve/conformsTo, etc.). Where the builder does emit the expected string, the runtime may still be broken. Both are reported below.

A key architectural fact: the evaluator does NOT parse FHIRPath strings. It walks a pre-built `PathOp[]` produced only by the builder proxy — so any `.compile()` string passed through (e.g. from `_filter`) is opaque to the evaluator. The two layers can only agree on behaviors the builder surface explicitly offers.

---

## 1. Navigation (§3)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-NAV-001 | IMPLEMENTED | builder.ts:319 (compile) / eval/nav.ts:4-12 (runtime) | `prop` Proxy-get appends `.prop` to path string and a `{type:"nav",prop}` op; runtime `evalNav` for `"nav"` does `collection.flatMap(item => Array.isArray(val) ? val : [val])`. Missing fields → `[]`. ✅ |
| FP-NAV-002 | IMPLEMENTED | eval/nav.ts:8-10 | `if (val == null) return []` — no `null`/`undefined` leakage; always returns an array. ✅ |
| FP-NAV-003 | IMPLEMENTED | eval/nav.ts:6-11 | `collection.flatMap` over input × array-wrapping coerces to single flat collection. ✅ |
| FP-NAV-004 | PARTIAL | multiple | Most one-arg eval ops guard via `flatMap` + `typeof` checks (e.g. eval/strings.ts:7, eval/math.ts:5) and so do propagate empty on empty input. BUT: several ops VIOLATE this — see FP-EXI-004/006, FP-TYP-001, FP-CONV-003/011/015/017. Delta: `allTrue`/`allFalse`/`convertsToX` on empty return `[false]`/`[true]` instead of propagating empty (eval/existence.ts:38,44; eval/conversion.ts:65-102). |
| FP-NAV-005 | INCORRECT | eval/operators.ts:98-103 | `toSingletonBoolean` silently returns `undefined` for multi-element collections, which then propagates as empty. Spec §4.5 requires an error when cardinality > 1. Code: ```function toSingletonBoolean(collection: unknown[]): boolean \| undefined { if (collection.length !== 1) return undefined; ... }``` Repro: `true and X` where `X = [true, true]` returns `[]` instead of erroring. Also `evalComparison` at operators.ts:80 has the dead ternary `collection.length === 1 ? collection[0] : collection[0]` — identical branches, no cardinality error, silently uses the first item. |

## 2. Indexer (§3 / §5.3.1)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-IDX-001 | MISSING | builder.ts | The builder is a JS `Proxy` — `expr[0]` returns `createExprProxy(\`${path}.0\`, [...ops, {type:"nav",prop:"0"}])`. That is **not** a valid indexer; it emits `path.0` (invalid FHIRPath) and tries to navigate to property `"0"` on each item at runtime. Numeric-string nav only incidentally works on arrays because `(arr)["0"]` returns the first element — but only one level deep, and `path.0` will not round-trip through any real FHIRPath parser. No `[n]` syntax surface. |
| FP-IDX-002 | IMPLEMENTED (by accident) | eval/nav.ts:5-11 | Accessing `[0]` on an array in JS returns the 0-based item. So runtime semantics are 0-based when the data IS an array. ✅ for runtime; compile-side is wrong (see FP-IDX-001). |

## 3. Filtering & projection (§5.2)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-SEL-001 | PARTIAL | builder.ts:96-110 (compile) / eval/filtering.ts:33-37 (runtime) | Compile emits `path.where(<pred>)`; predicate proxy compiles to FHIRPath-like syntax. Runtime filters by `result.length === 1 && result[0] === true`. Elements where the predicate yields `[]` are correctly excluded (match spec). Also supports legacy `where(field, value)` that emits `path.where(field = 'value')` (builder.ts:104-107) with string-interpolated value — **no escape of single quotes in the value**, so `where("name","O'Brien")` produces `name.where(name = 'O'Brien')` (broken FHIRPath string). |
| FP-SEL-002 | IMPLEMENTED | builder.ts:138-146 / eval/filtering.ts:39-40 | `select` flatMaps projection over input. ✅ |
| FP-SEL-003 | IMPLEMENTED | builder.ts:150-158 / eval/filtering.ts:42-61 | `repeat` iterates, using `seen: Set<unknown>` with reference-equality to halt on cycles. ✅ Cycle detection uses reference-identity not `=` — a deepEqual would match spec more precisely, but cycle termination is correct. |
| FP-SEL-004 | PARTIAL | builder.ts:167-170 / eval/filtering.ts:63-99 | `ofType` uses hardcoded `TYPE_CHECKS` map (14 entries, eval/filtering.ts:5-20) that does duck-typing: `checkKeys.some(k => k in obj)`. **Ambiguous types:** `Coding` (`["system","code"]`) and `Identifier` (`["system","value"]`) both match on `system`. A plain-object with just `coding: [...]` matches `CodeableConcept` whether or not it actually is one. **Missing types:** `Duration`, `Age`, `Count`, `Distance`, `SimpleQuantity`, `Timing`, `HumanNameId`, any Resource subtype not named `Patient`/etc. (only resourceType match works). **Primitive/alias:** `String`/`Integer`/`Boolean`/`Decimal` with both capitalizations handled (lines 73-85). NOT driven by SpecCatalog/StructureDefinitions — a user extending with a new FHIR type will silently get `[]`. |

## 4. Subsetting (§5.3)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-SUB-001 | IMPLEMENTED | eval/subsetting.ts:12-16 | `single()` throws on length>1, returns `[]` on empty, returns singleton on length=1. ✅ |
| FP-SUB-002 | IMPLEMENTED | eval/subsetting.ts:6-7 | `first()` returns `[collection[0]]` or `[]`. ✅ |
| FP-SUB-003 | IMPLEMENTED | eval/subsetting.ts:9-10 | `last()` returns `[collection[last]]` or `[]`. ✅ |
| FP-SUB-004 | IMPLEMENTED | eval/subsetting.ts:18-19 | `tail()` = `slice(1)`. Empty/single → `[]`. ✅ |
| FP-SUB-005 | PARTIAL | eval/subsetting.ts:21-22 | `skip(n)` = `slice(n)`. Behavior on `skip(-1)`: JS `slice(-1)` returns last element — **spec §5.3.6 requires returning the input unchanged when num ≤ 0.** Delta: `[1,2,3].skip(-1)` returns `[3]`, spec expects `[1,2,3]`. |
| FP-SUB-006 | IMPLEMENTED | eval/subsetting.ts:24-25 | `take(n)` = `slice(0, n)`. `take(0)` → `[]` (matches `slice(0,0)`). `take(-1)` = `slice(0,-1)` returns `[1,2]` from `[1,2,3]` — spec says ≤0 → `[]`. **Actually PARTIAL** — same bug as skip for negative num. |
| FP-SUB-007 | PARTIAL | eval/subsetting.ts:27-30 | `intersect` uses deepEqual inclusion test. **Does not dedup the result** — spec §5.3.8 explicitly says "Duplicate items will be eliminated." Code: `collection.filter((item) => otherCollection.some((other) => deepEqual(item, other)))` — if `collection` has `[1,1,2]` and `other` has `[1,2]`, result is `[1,1,2]`, should be `[1,2]`. Also: `op.other` is re-evaluated against `ctx.rootResource` (line 28), not the current context — breaks for relative paths inside nested where(). |
| FP-SUB-008 | PARTIAL | eval/subsetting.ts:32-35 | `exclude` preserves duplicates + order as spec requires. ✅ Same `rootResource` re-eval issue as intersect. |

## 5. Combining (§5.4)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-COM-001 | PARTIAL | builder.ts:174-182 / eval/combining.ts:8-16 | `union` dedups via deepEqual. `|` operator syntax is **not exposed** on the builder — only `.union()` method. `ctx.evaluateSub(op.other.ops, ctx.rootResource)` re-evaluates against root (same pattern as intersect). |
| FP-COM-002 | IMPLEMENTED | builder.ts:174-182 / eval/combining.ts:19-21 | `combine` concatenates without dedup. ✅ |
| FP-COM-003 | IMPLEMENTED | builder.ts:13 / eval/existence.ts:55-62 | `distinct()` uses deepEqual. ✅ Spec-correct within scope. |
| FP-COM-004 | IMPLEMENTED | builder.ts:14 / eval/existence.ts:64-71 | `isDistinct()` via deepEqual. ✅ |

## 6. Existence (§5.1)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-EXI-001 | IMPLEMENTED | builder.ts:163 / eval/existence.ts:52-53 | `empty()` → `[collection.length === 0]`. ✅ |
| FP-EXI-002 | IMPLEMENTED | builder.ts:114-125 / eval/existence.ts:28-32 | `exists()` → `[length>0]`; `exists(cb)` uses predicate per-item. ✅ |
| FP-EXI-003 | IMPLEMENTED | builder.ts:129-134 / eval/existence.ts:34-35 | `all(cb)` → `collection.every(...)`. Empty input → `true` (vacuous). ✅ |
| FP-EXI-004 | INCORRECT | eval/existence.ts:37-38 | `allTrue()` on empty returns `false`: ```case "allTrue": return [collection.length > 0 && collection.every((item) => item === true)];``` Spec §5.1.4: "If the input is empty (`{ }`), the result is `true`." Impl returns `[false]`. |
| FP-EXI-005 | IMPLEMENTED | eval/existence.ts:40-41 | `anyTrue()` empty → `[false]`. ✅ |
| FP-EXI-006 | INCORRECT | eval/existence.ts:43-44 | `allFalse()` on empty returns `false`. Spec §5.1.6: empty → `true`. Same bug pattern as FP-EXI-004. |
| FP-EXI-007 | IMPLEMENTED | eval/existence.ts:46-47 | `anyFalse()` empty → `[false]`. ✅ |
| FP-EXI-008 | PARTIAL | eval/existence.ts:73-76 | `subsetOf` uses deepEqual but re-evaluates `other` against `rootResource`. For top-level relative paths this is fine; inside nested `where()` the `$this`-relative `other` will be wrong. |
| FP-EXI-009 | PARTIAL | eval/existence.ts:78-81 | Same as FP-EXI-008. |
| FP-EXI-010 | IMPLEMENTED | builder.ts:162 / eval/existence.ts:49-50 | `count()` → `[length]`. Empty → `[0]`. ✅ |

## 7. Boolean logic (§6.5)

Context: `toSingletonBoolean` (eval/operators.ts:98-103) is the gate — it maps a collection to `true|false|undefined`, where `undefined` is treated as "empty" in the logic below. It does NOT raise on multi-element inputs (see FP-NAV-005).

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-LOG-001 | IMPLEMENTED | eval/operators.ts:24-31 | `and`: all 9 truth-table cells match spec. Right side IS evaluated on `T and X` (line 27), so short-circuiting is only partial. Correct dominance: `F and X → F` regardless of right. |
| FP-LOG-002 | IMPLEMENTED | eval/operators.ts:33-40 | `or`: truth table correct. Short-circuits on `T or X`. |
| FP-LOG-003 | IMPLEMENTED | eval/operators.ts:49-53 | `not()` on predicate: correctly `!val` for `true/false`, empty on empty singleton. ✅ (at predicate layer) |
| FP-LOG-003 | INCORRECT (at surface) | builder.ts:43 / eval/operators.ts:49-53 | Builder exposes `not()` at surface level (builder.ts:43 in NULLARY_FNS), which creates `{type:"not"}` op. The evaluator then hits this via dispatch — but `not` is listed both as an EXI-family nullary AND as an OperatorOp. The eval path in operators.ts:49 expects `toSingletonBoolean(collection)` which on a non-boolean singleton (e.g., result of `.exists()` wrapped) works — but on a non-boolean input (e.g., `name.not()`) returns empty rather than erroring. |
| FP-LOG-004 | IMPLEMENTED | eval/operators.ts:42-47 | `xor`: empty propagation correct (`left == null \|\| right == null → []`). |
| FP-LOG-005 | IMPLEMENTED | eval/operators.ts:55-63 | `implies`: all truth cells correct including the `{}⇒T=T` asymmetry (line 60). ✅ |

## 8. Equality & equivalence (§6.1)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-EQ-001 | INCORRECT | eval/operators.ts:6-7, 73-92 | Uses JS `===`. Multiple failures: (a) partial-precision dates: `'2012' === '2012-01-15'` → `false`, spec §6.1 requires `[]`. (b) Quantity objects: `{value:120,unit:'mg'} === {value:120,unit:'mg'}` → `false` (reference), spec requires value+unit equality. (c) Left-cardinality: eval/operators.ts:80 has `const left = collection.length === 1 ? collection[0] : collection[0];` — identical branches, silently uses first element for multi-element left operand instead of pairwise comparison or §4.5 error. |
| FP-EQ-002 | INCORRECT | eval/operators.ts:9-10 | `!=` uses `a !== b`. Inherits all bugs of `=`. `{} !=1` returns `[false]` instead of `[]` if collection empty check fires first (line 79 returns `[]`), but for length-1 empty-valued literal (not reachable) — actually `if (collection.length === 0) return []` (line 79) DOES handle empty-left correctly. But comparing partial dates still produces `[true]` or `[false]` instead of `[]`. |
| FP-EQ-003 | MISSING | — | No `~` (equivalence) operator. Predicate builder has no `.equiv()`; builder surface has no equivalence. `evalOperator` has no `equiv`/`~` case. |
| FP-EQ-004 | MISSING | — | No `!~` operator. |
| FP-EQ-005 | IMPLEMENTED (trivially) | eval/operators.ts:7 | JS `===` on strings is case-sensitive. ✅ |

## 9. Comparison (§6.2)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-CMP-001 | INCORRECT | eval/operators.ts:79-91 | Empty left returns `[]` (correct). Empty right (predicate form) returns `[]` (line 85, correct). BUT: partial-precision operands return `[false]`/`[true]` via JS `<`/`>` on strings — spec says empty. |
| FP-CMP-002 | INCORRECT | eval/operators.ts:80 | Multi-element operand does NOT error — dead ternary `collection.length === 1 ? collection[0] : collection[0]`. Silently uses first item. |
| FP-CMP-003 | PARTIAL | eval/operators.ts:12-22 | JS operators (`<`, `>`, `<=`, `>=`) on string/number work for Integer/Decimal and lexicographic String. **No Quantity comparison** (would compare `{value,unit}` object via JS `<`, i.e. NaN — returns `[false]`). **No Date/DateTime precision handling** — `@2020 < @2020-01` returns `[false]` (string lexicographic) instead of `[]`. **No UCUM**. |

## 10. Math operators (§6.6)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-MATH-001 | MISSING | ops.ts:75-85, builder.ts | `MathOp` union has NO `add`/`sub`/`mul`/`div_op`/`div`/`mod` — only the math *functions* (abs, ceiling, exp, floor, ln, log, power, round, sqrt, truncate). Predicate surface (expression.ts) exposes `eq/neq/lt/gt/lte/gte/and/or/xor/not/implies/is/as` — no arithmetic. **No binary `+ - * /` anywhere.** |
| FP-MATH-002 | MISSING | — | `div` / division-by-zero entirely absent. |
| FP-MATH-003 | MISSING | — | `div` absent. |
| FP-MATH-004 | MISSING | — | `mod` absent. |
| FP-MATH-005 | MISSING | — | `&` string concat absent. |
| FP-MATH-006 | MISSING | — | Quantity arithmetic — Quantity is not first-class anywhere. `toQuantity` returns `{value, unit}` objects (eval/conversion.ts:54-63) but there's no arithmetic to apply. |
| FP-MATH-007 | MISSING | — | Unary `-`/`+` absent. |

## 11. Collection operators (§6.3)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-COL-001 | PARTIAL | builder.ts:174-182 | `|` pipe-operator as a FHIRPath literal is absent; only `.union()` method form exists. The `expression.ts` predicate proxy has NO `union`/`combine`/`|` handler — they only exist on the outer expr proxy (builder.ts). |
| FP-COL-002 | MISSING | — | No `in` operator. Not in OperatorOp union (ops.ts:118-131). Surface `contains(str)` in expression.ts:127-130 is the **string** `contains`, not the collection `contains`. |
| FP-COL-003 | MISSING | — | No list-form `contains`. Only string `contains` exists (eval/strings.ts:31-35). |

## 12. Type operators (§6.4)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-TYP-001 | INCORRECT | eval/operators.ts:65-66 | `is` returns `[collection.length === 1 && matchesType(...)]` — always returns `[false]` for empty or multi-element input; spec requires `[]` for empty and `[error]` for multi. |
| FP-TYP-002 | PARTIAL | eval/operators.ts:68-69 | `as`: `collection.filter((item) => matchesType(item, op.typeName))`. Spec defines `as` as returning empty when type doesn't match (singleton behavior), not filtering a collection. For a 3-element collection of mixed types, impl keeps all matching; spec would error under §4.5. Also: `matchesType` is a second, separate duck-type impl (operators.ts:105-126) that does NOT use `TYPE_CHECKS` — only primitives + resourceType. So `is`/`as` and `ofType` disagree on what constitutes a type match. |
| FP-TYP-003 | PARTIAL | builder.ts:167, expression.ts:158-162 | Type names are raw strings passed through. `System.String`, `FHIR.Patient`, plain `Patient` all go through unchanged. No namespace resolution — `matchesType("String", item)` at operators.ts:109 handles `String` but NOT `System.String`. So `value is System.String` silently fails to match strings. |
| FP-TYP-004 | PARTIAL | Same as FP-SEL-004 | Two separate type-resolvers diverge: `ofType` uses `TYPE_CHECKS` (14 complex types); `is`/`as` don't. |

## 13. Tree navigation (§5.8)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-TREE-001 | PARTIAL | builder.ts:44 / eval/nav.ts:14-21 | `children()` returns `Object.values(item).flatMap(flatten)`. Includes the `resourceType` string as a child (per `Object.values`). Spec §5.8.1 intent is FHIR-element children, not raw object properties — so `resourceType`, `id` leak in. No scalar filter. |
| FP-TREE-002 | INCORRECT | eval/nav.ts:22-36 | `descendants()` uses iterative stack DFS with **NO visited set**. Cyclic input (`a.self = a`) causes unbounded memory growth → stack overflow / OOM. Code: ```while (stack.length > 0) { const item = stack.pop()!; ... stack.push(...children.filter(c => c != null && typeof c === "object")); }``` No cycle detection. AUDIT.md line 47's claim of "cycle detection in nav.ts" is FALSE. |

## 14. String manipulation (§5.6)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-STR-001 | PARTIAL | builder.ts:205-208 / eval/strings.ts:5-9 | `indexOf` returns `item.indexOf(substring)` via JS. `indexOf('')` returns 0 — matches spec. But: spec says empty substring/input → empty; impl does NOT special-case empty substring and relies on JS `"abc".indexOf("") === 0`. Technically the string-concat case where `typeof item !== "string"` returns `[]` (line 7) — so non-string inputs propagate correctly. |
| FP-STR-002 | INCORRECT | eval/strings.ts:11-17 | `substring(start[, length])`: ```if (op.start < 0 \|\| op.start >= item.length) return [];``` Rejects `start >= item.length` returning empty (correct). But `'abc'.substring(0, 10)` returns `'abc'` via JS `"abc".substring(0, 10)` — spec says truncate to remaining chars (correct-by-accident). However `substring(-1)` returns `[]` — spec §5.6.2 says "If the input or `start` is empty, the result is empty" but does NOT say negative start is empty; JS `"abc".substring(-1)` is `"abc"` (clamps), so impl is stricter than spec. |
| FP-STR-003 | IMPLEMENTED | builder.ts:217-220 / eval/strings.ts:19-23 | `startsWith`: JS `startsWith`. `'abc'.startsWith('')` → true (JS native). ✅ |
| FP-STR-004 | IMPLEMENTED | eval/strings.ts:25-29 | `endsWith`: JS `endsWith`. ✅ |
| FP-STR-005 | PARTIAL | eval/strings.ts:31-35 | `str_contains`: JS `includes`. Note: this is accessed via `.contains()` method at builder.ts:225-228, but that's the SAME method name as the collection operator — no disambiguation. Impl always treats `.contains()` as the string function. |
| FP-STR-006 | IMPLEMENTED | eval/strings.ts:37-47 | `upper`/`lower`: JS `toUpperCase`/`toLowerCase`. Empty input (non-string) → `[]`. ✅ |
| FP-STR-007 | PARTIAL | eval/strings.ts:49-53 | `replace(pattern, sub)`: `item.split(pattern).join(sub)` — literal (not regex) replacement of ALL occurrences. ✅ for literal replace. Spec §5.6.8 "If the input collection, `pattern`, or `substitution` are empty, the result is empty" — impl does not check for undefined pattern/sub and will produce `''.split(undefined)` = `[item]` unchanged. In practice builder requires both args to be strings at the type level. |
| FP-STR-008 | PARTIAL | eval/strings.ts:55-59 | `matches(regex)`: `new RegExp(op.regex).test(item)`. Does NOT anchor — spec §5.6.9 says "full-match regex". `'abc'.matches('b')` should probably be `false` (not full match) but JS `.test()` returns `true` (substring match). **Missing anchoring.** |
| FP-STR-009 | PARTIAL | eval/strings.ts:61-65 | `replaceMatches(regex, sub)`: `item.replace(new RegExp(op.regex, "g"), op.substitution)`. Missing named-group backref support is fine under JS regex (uses `$<name>`, not `${name}`). But spec's example `${day}-${month}-${year}` won't work; JS wants `$<day>-$<month>-$<year>`. Delta documented in impl. |
| FP-STR-010 | INCORRECT | eval/strings.ts:67-71 | `length()`: `[item.length]`. On empty input (non-string), returns `[]` (OK). On empty string `''`, returns `[0]`. **Spec §5.6.11: empty input → empty, NOT 0.** But impl returns `[0]` for `''.length()` — incorrect since `''` is a valid singleton string, not empty collection. Wait — spec means `{}.length()` → `{}`, which IS what impl does via `typeof !== "string"`. OK so this is ACTUALLY IMPLEMENTED. Revising: **IMPLEMENTED**. |
| FP-STR-011 | IMPLEMENTED | eval/strings.ts:73-77 | `toChars()`: `item.split("")`. ✅ |
| FP-STR-012 | PARTIAL | builder.ts / expression.ts | Escape sequences: string literal values are interpolated directly via `formatValue` (expression.ts:178-184) with `'${value}'`. **No escape of embedded `'`** — `.eq("O'Brien")` produces `path = 'O'Brien'` (broken FHIRPath). Builder does not implement the `\n`/`\t`/`\uXXXX` escape alphabet. |
| FP-STR-013 | MISSING | — | No `split` in builder or eval. |
| FP-STR-014 | MISSING | — | No `join`. |
| FP-STR-015 | MISSING | — | No `trim`. |
| FP-STR-016 | MISSING | — | No `encode`. |
| FP-STR-017 | MISSING | — | No `decode`. |
| FP-STR-018 | MISSING | — | No `escape`. |
| FP-STR-019 | MISSING | — | No `unescape`. |

## 15. Math functions (§5.7 STU)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-MATHF-001 | PARTIAL | eval/math.ts:5 | `abs`: `typeof item === "number" ? [Math.abs(item)] : []`. Silently drops non-numbers — spec §4.5 requires singleton evaluation error. Quantity input drops (no unit preservation). |
| FP-MATHF-002 | IMPLEMENTED | eval/math.ts:8 | `ceiling`. ✅ |
| FP-MATHF-003 | IMPLEMENTED | eval/math.ts:11 | `exp`. ✅ |
| FP-MATHF-004 | IMPLEMENTED | eval/math.ts:14 | `floor`. ✅ |
| FP-MATHF-005 | PARTIAL | eval/math.ts:17 | `ln`: `Math.log(item)`. `ln(0)` → `-Infinity`, spec expects empty. `ln(-1)` → `NaN`. No domain guards. |
| FP-MATHF-006 | PARTIAL | eval/math.ts:20 | `log(base)`: `Math.log(item) / Math.log(base)`. Same `log(0)` / `log(base=1)` (division by 0 since ln(1)=0 → Infinity) issues. |
| FP-MATHF-007 | PARTIAL | eval/math.ts:23 | `power`: `item ** exp`. `(-1) ** 0.5` returns `NaN`, spec says empty. No guard. |
| FP-MATHF-008 | IMPLEMENTED | eval/math.ts:26-31 | `round(precision)`: banker's-no, half-up via `Math.round`. Precision via `factor = 10**precision`. JS `Math.round(0.5)` = 1, matches spec's "0.5 or higher rounds to 1". ✅ |
| FP-MATHF-009 | PARTIAL | eval/math.ts:33 | `sqrt`: `Math.sqrt`. `sqrt(-1)` → `NaN`, spec says empty. |
| FP-MATHF-010 | IMPLEMENTED | eval/math.ts:36 | `truncate`: `Math.trunc`. ✅ |

## 16. Conversion functions (§5.5)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-CONV-001 | INCORRECT | builder.ts:291-310 / eval/utility.ts:24-37 | `iif(criterion, true, otherwise?)`: Two bugs: (1) criterion evaluated against `collection[0]` only (line 26), not the whole input context; `iif(count() > 1, ...)` on 3-element input incorrectly sees `count()=1`. (2) `trueResult`/`otherwiseResult` are `flatMap`-ped per element (lines 31, 34); spec says they produce a single collection, evaluated once in the original context. No short-circuit — both branches are compiled but only the matched branch is evaluated at runtime (OK). |
| FP-CONV-002 | INCORRECT | eval/conversion.ts:5-9, 106-119 | `toBoolean` accepts ONLY literal `"true"`/`"false"` strings (case-sensitive) and numeric `0`/`1`. Spec §5.5.2 requires case-insensitive: `'t', 'T', 'true', 'TRUE', 'yes', 'y', 'Y', 'YES', '1', '1.0'` → true; `'f','F','false','FALSE','no','n','N','NO','0','0.0'` → false. |
| FP-CONV-003 | INCORRECT | eval/conversion.ts:65-66 | `convertsToBoolean` returns `[true/false]` for every input — even empty collection produces NO item (flatMap over empty gives `[]`, actually). But for a singleton string `"maybe"` returns `[false]`, spec says empty (conversion not applicable). Actually: `collection.flatMap(item => [convertToBoolean(item) != null])` — for any item, always returns a boolean. Missing empty propagation on non-convertible inputs. |
| FP-CONV-004 | INCORRECT | eval/conversion.ts:11-15, 121-129 | `toInteger`: `Number.parseInt(item, 10)` accepts `"12.5"` → `12`, `"12abc"` → `12`. Spec regex `(\+|-)?\d+` rejects both. |
| FP-CONV-005 | INCORRECT | eval/conversion.ts:68-69 | Same pattern as FP-CONV-003 — always returns a boolean for every input. |
| FP-CONV-006 | PARTIAL | eval/conversion.ts:31-37 | `toDate`: `/^\d{4}(-\d{2}(-\d{2})?)?/` — matches partial dates per spec. BUT does NOT validate month/day ranges: `"2024-99-99".toDate()` → `["2024-99-99"]`. Spec requires rejection. |
| FP-CONV-007 | PARTIAL | eval/conversion.ts:79-83 | `convertsToDate`: regex `.test(item)` — same lack of range validation. Returns `[true]` for `"2024-99-99"`. |
| FP-CONV-008 | INCORRECT | eval/conversion.ts:39-45 | `toDateTime`: `Date.parse(item)` — engine-specific, very permissive. V8 accepts `"2024/01/01"`, `"Jan 1 2024"`, etc., which are not valid FHIR DateTime (spec requires ISO 8601 with partial allowance). |
| FP-CONV-009 | INCORRECT | eval/conversion.ts:85-89 | `convertsToDateTime`: same issue as FP-CONV-008. |
| FP-CONV-010 | INCORRECT | eval/conversion.ts:17-21, 131-139 | `toDecimal`: `Number.parseFloat(item)` — accepts `"3.14abc"` → `3.14`. Spec regex requires strict match. |
| FP-CONV-011 | INCORRECT | eval/conversion.ts:71-72 | Always-boolean bug (same pattern). |
| FP-CONV-012 | PARTIAL | builder.ts:269-275 / eval/conversion.ts:54-63 | `toQuantity([unit])`: Numeric input → `{value, unit: op.unit ?? "1"}`. **No UCUM validation of the unit argument**. Object input pass-through (line 59). **String input returns `[]`** — spec requires parsing `"10 'mg'"` or `"10 mg"`, `"1 year"`. No parsing. |
| FP-CONV-013 | PARTIAL | eval/conversion.ts:97-102 | `convertsToQuantity`: `true` for numbers and any object with `value` key, `false` otherwise. Strings like `"10 mg"` → `[false]`, spec says true. |
| FP-CONV-014 | PARTIAL | builder.ts:279-281 / eval/conversion.ts:23-29 | `toString` (aliased as `toFhirString`): strings pass through, numbers and booleans stringify. **Missing:** Quantity, Date, DateTime, Time stringification. Spec §5.5.8 specifies formats for each. |
| FP-CONV-015 | INCORRECT | eval/conversion.ts:74-77 | Always-boolean; returns `[true]` for numbers/strings/booleans, `[false]` otherwise. No empty-propagation on empty collection — actually flatMap over empty gives `[]` (OK for empty), but for a Quantity-like object singleton, returns `[false]` when spec would say `true`. |
| FP-CONV-016 | PARTIAL | eval/conversion.ts:47-52 | `toTime`: regex `/^T?(\d{2}:\d{2}(:\d{2}(\.\d+)?)?)/`. Accepts with or without leading `T`. Does NOT validate hour (0-23), minute (0-59), etc. |
| FP-CONV-017 | PARTIAL | eval/conversion.ts:91-95 | `convertsToTime`: regex-only — no range validation. |

## 17. Utility (§5.9)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-UTIL-001 | PARTIAL | builder.ts:285-287 / eval/utility.ts:6-9 | `trace(name)`: logs to `console.debug`, returns input unchanged. **Does NOT support the optional projection argument** — spec §5.9.1 allows `trace(name, projection)` where the projection is evaluated and logged but the original input is returned. Builder signature only accepts a single `name: string`. |
| FP-UTIL-002 | PARTIAL | builder.ts:314-316 / eval/utility.ts:11-22 | `now()`/`today()`/`timeOfDay()`: computed from `new Date()` at each op dispatch. **Deterministic-within-expression is NOT guaranteed** — if the same expression dispatches `now()` multiple times, each call returns a fresh timestamp. Spec §5.9.2: "should return the same value regardless of how many times they are evaluated within any given expression." No per-expression caching. |

## 18. Aggregate (§7 STU)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-AGG-001 | MISSING | — | No `aggregate()` in builder or eval. No `$total` variable. |
| FP-AGG-002 | MISSING | — | No `sum`. |
| FP-AGG-003 | MISSING | — | No `min`/`max`. |
| FP-AGG-004 | MISSING | — | No `avg`. |
| FP-AGG-005 | MISSING | — | — |

## 19. Environment variables (§5 intro, §9)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-VAR-001 | IMPLEMENTED | expression.ts:23-25 | `$this` is wired as the root of predicate callback — the callback gets the predicate proxy rooted at `"$this"`. ✅ compile-side; runtime-side the predicate is evaluated against each item (eval/filtering.ts:35). |
| FP-VAR-002 | MISSING | — | No `$index`. Predicate proxy never exposes it. |
| FP-VAR-003 | MISSING | — | No `$total`. |
| FP-VAR-004 | MISSING | — | No `%context`. |
| FP-VAR-005 | MISSING | — | No `%resource`. |
| FP-VAR-006 | MISSING | — | No `%rootResource`. |
| FP-VAR-007 | MISSING | — | No `%ucum`. |
| FP-VAR-008 | MISSING | — | No `%vs-*`. |
| FP-VAR-009 | MISSING | — | No `%ext-*`. |
| FP-VAR-010 | MISSING | — | `evaluate()` signature (evaluator.ts:18) has no env-bag parameter; unknown `%foo` cannot be threaded in. Undefined env vars CANNOT signal an error because they cannot be referenced. |

## 20. Literals (§4.1)

Compile-side literals appear only inside predicates via `formatValue` (expression.ts:178-184). No standalone literal builder.

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-LIT-001 | PARTIAL | expression.ts:183 | `true`/`false` JS booleans stringify via `String(value)`. Inside `.eq(true)` → `path = true`. ✅ |
| FP-LIT-002 | PARTIAL | expression.ts:182 | String values wrapped as `'${value}'` — **single-quote embedded in value is NOT escaped**. No `\n`/`\t`/`\uXXXX` escape support. |
| FP-LIT-003 | PARTIAL | expression.ts:183 | Integer via `String(value)`. No range check against spec §4.1.3 32-bit bounds. |
| FP-LIT-004 | PARTIAL | expression.ts:183 | Decimal via `String(value)`. JS number precision issues (e.g. `0.1 + 0.2` formatting). |
| FP-LIT-005 | MISSING | — | No Date literal. Cannot build `@2024-01`. |
| FP-LIT-006 | MISSING | — | No Time literal. |
| FP-LIT-007 | MISSING | — | No DateTime literal. |
| FP-LIT-008 | MISSING | — | No Quantity literal syntax. `toQuantity(num, unit)` produces objects at runtime but there's no `1 'mg'` source-level. |
| FP-LIT-009 | MISSING | — | No `{}` empty-collection literal as an expression primitive. |
| FP-LIT-010 | MISSING | — | No delimited-identifier (backtick) support. A prop named `date` would need `['date']`-style access which the Proxy doesn't support. |

## 21. Date/time arithmetic (§6.6.7)

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-DT-001 | MISSING | — | No Date + calendar-duration arithmetic. No `year`/`month` keyword support. |
| FP-DT-002 | MISSING | — | No UCUM definite-duration arithmetic. |
| FP-DT-003 | MISSING | — | — |
| FP-DT-004 | MISSING | — | No `date - date`. |

## 22. FHIR-specific additions

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-FHIR-001 | MISSING | — | No `extension(url)`. Proxy will interpret `.extension('url')` by first generating `path.extension` (nav op), then the function call throws because nav op doesn't return a callable. Actually — builder.ts:319 is the default case: returns a proxy, so calling it will... go through `Symbol.toPrimitive`? Let me re-check: property access returns a proxy, then the call `(...url)` — the proxy doesn't have a callable trap. Calling a proxy whose target is `{}` throws `TypeError: ... is not a function`. **Unusable for FHIR extension filtering.** |
| FP-FHIR-002 | MISSING | — | No `hasValue()`. |
| FP-FHIR-003 | MISSING | — | No `getValue()`. |
| FP-FHIR-004 | MISSING | — | No `resolve()`. |
| FP-FHIR-005 | INCORRECT | eval/filtering.ts:5-20 | `ofType` allows any type name via `TYPE_CHECKS` or `resourceType` match. Does NOT restrict to "concrete core types" per spec §2.1.9.1.5; would attempt to match a profile URL string. |
| FP-FHIR-006 | MISSING | — | No `conformsTo`. |
| FP-FHIR-007 | MISSING | — | No `memberOf`. Terminology package exists but is not wired to fhirpath eval. |
| FP-FHIR-008 | MISSING | — | No `subsumes`. |
| FP-FHIR-009 | MISSING | — | No `subsumedBy`. |
| FP-FHIR-010 | MISSING | — | No `htmlChecks`. |
| FP-FHIR-011 | MISSING | — | No `lowBoundary`/`highBoundary`. |
| FP-FHIR-012 | MISSING | — | No `comparable`. |
| FP-FHIR-013 | MISSING | — | Choice-type navigation: the proxy compiles `Observation.value` as nav op. `value as Quantity` is MISSING as an expression (no `.as(T)` method on the outer proxy — `as` exists only in predicate; builder.ts has no `as`). So the builder cannot produce `Observation.value as Quantity` as a compile string directly. |
| FP-FHIR-014 | PARTIAL | — | FHIR primitive `.id`/`.extension` navigation works through the generic `nav` op (any prop-name succeeds). But the "implicit value" property is NOT modeled — `Patient.birthDate.value` would navigate into a string and get `[]`. |
| FP-FHIR-015 | MISSING | — | Coding equivalence specifics not modeled; `deepEqual` compares ALL fields, not just `system`+`code`. |
| FP-FHIR-016 | MISSING | — | CodeableConcept equivalence intersection not modeled. |

## 23. Grammar / parsing

| ID | Status | Citation | Behavior |
|----|--------|----------|----------|
| FP-GRAM-001 | N/A | — | The package does not parse FHIRPath source strings. Precedence is expressed only through the builder's method chain, which is always left-to-right. Users cannot write `a or b and c` and expect `a or (b and c)` — they must chain explicitly. |
| FP-GRAM-002 | IMPLEMENTED | builder.ts / expression.ts | Chaining via `.method()` works for supported ops. |
| FP-GRAM-003 | N/A | — | No text parsing. |
| FP-GRAM-004 | N/A | — | No comments (no parser). |

---

## Summary counts

- Total rules: **~140** (counting sub-items in LOG/EQ, etc., ≈ N in the N1 file).
- IMPLEMENTED: ~30 (mostly nav, first/last/tail, count, exists, and/or/xor/implies truth cells, distinct/isDistinct, ceiling/floor/truncate/exp/round).
- PARTIAL: ~35 (ofType type-duck, union/intersect/exclude re-evaluation-against-root, toDate regex range, string matches no anchor, etc.).
- INCORRECT: ~18 (allTrue/allFalse empty semantics, is with multi-element, iif criterion scope, = on partial dates/Quantity, evalComparison dead ternary, convertToBoolean case-sensitivity, toInteger parseInt, toDecimal parseFloat, descendants no cycle detection, skip/take negative num, intersect no dedup).
- MISSING: ~55 (binary arithmetic entirely, `~`/`!~`/`in`/collection-`contains`/`|`-operator, aggregate/sum/min/max/avg, all env vars except `$this`, all date/time arithmetic, all FHIR-specific functions except a partial `ofType`, Date/Time/DateTime/Quantity literals, `$index`/`$total`, split/join/trim/encode/decode/escape/unescape).

## Specific answers to challenge-doc items (pre-labeled per `audit/challenge/preliminary-hits.md`)

1. **Singleton evaluation multi-element error (hit #1):** INCORRECT — see FP-NAV-005, FP-CMP-002, FP-TYP-001. `toSingletonBoolean` at operators.ts:98-103 silently returns undefined.
2. **`evalComparison` partial-dates / Quantity / multi-left (hit #2):** INCORRECT — see FP-EQ-001, FP-CMP-001. Dead ternary at operators.ts:80.
3. **AUTO_POST threshold (hit #3):** OUT OF SCOPE for this map (core, not fhirpath). Cross-reference to `core-impl-map.md` when produced.
4. **pagination nextLink (hit #4):** OUT OF SCOPE for this map. Cross-ref to `runtime-impl-map.md`.
5. **Composite `$` escape (hit #5):** OUT OF SCOPE for this map (core). Cross-ref.
6. **Commas in values not escaped (hit #6):** OUT OF SCOPE for this map (core). Cross-ref.
7. **`convertToBoolean`/`convertToInteger` spec violations (hit #7):** INCORRECT — see FP-CONV-002 through FP-CONV-005 + FP-CONV-010, FP-CONV-011.

## Cross-references

- Spec rules: `audit/spec/fhirpath-n1-rules.md`
- Challenger doc: `audit/challenge/fhirpath-challenge.md` (8 REFUTES land here: A2, A3, B3, C1–C6)
- Preliminary hits: `audit/challenge/preliminary-hits.md`
- Normative test suite to run: https://github.com/HL7/FHIRPath/tree/master/tests (DSL currently has no harness to run these).
