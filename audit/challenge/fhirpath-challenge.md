# FHIRPath Challenge Doc

**Target:** Every "positive" claim in `AUDIT.md` §1 (lines 42-47), plus selected "gap" entries, plus the `packages/fhirpath/test/spec-gaps.test.ts` pin file.
**Audit under review:** commit `4f91589` on `main`.
**Spec references:** HL7 FHIRPath N1 — <http://hl7.org/fhirpath/N1/> (dated 2020-05-28, normative). Where the FHIR R4 profile refines the base spec, cited explicitly.
**Author:** spec-challenger. Role is adversarial; softening is failure.

The grading rubric:

- **CONFIRM-STRONG** — AUDIT claim holds under at least one adversarially-chosen edge case. Cite the edge.
- **CONFIRM-WEAK** — AUDIT claim holds on the happy path but breaks on edges I chose. AUDIT overstates.
- **REFUTE** — AUDIT claim is false. Minimal concrete repro included.

Upstream dependency notes (flag, not refute):

- `audit/spec/` is empty: spec-reader has not produced `fhirpath-n1-rules.md`. All spec citations below are direct from <http://hl7.org/fhirpath/N1/>.
- `audit/impl/` is empty: dsl-explorer has not produced `fhirpath-impl-map.md`. I reviewed source directly.
- `packages/fhirpath/test/spec-compliance.test.ts` does not exist: test-engineer has not yet produced task #7 output. Where my refute would be strengthened by a failing test, I include the minimal repro instead.

---

## Section A — Challenges to AUDIT.md "Positives" (AUDIT.md lines 42-47)

### A1. Three-valued boolean logic — CONFIRM-WEAK (**not** STRONG as AUDIT claims)

> AUDIT line 44: "Three-valued boolean logic (`and`/`or`/`xor`/`implies`) in `packages/fhirpath/src/eval/operators.ts` correctly propagates empty per spec §3.2.2."

**Spec reference.** FHIRPath N1 §6.5 Boolean logic (truth tables) and §5.5 Singleton Evaluation of Collections. Quoted from §5.5:

> If the collection contains a single item, that item is used. Otherwise, an error is raised.

And from §6.5:

> the Boolean operators also apply to the empty collection (`{}`). [Three-valued tables follow.]

**What the code does.** `packages/fhirpath/src/eval/operators.ts:24-63` implements `and`/`or`/`xor`/`implies`. Supporting helper `toSingletonBoolean` lives at lines 98-103:

```ts
function toSingletonBoolean(collection: unknown[]): boolean | undefined {
  if (collection.length !== 1) return undefined;
  const val = collection[0];
  if (typeof val === "boolean") return val;
  return undefined;
}
```

**Walk of all 9 cells (`and`):**

| left | right | spec expects | impl produces | verdict |
|---|---|---|---|---|
| T | T | T | `[true]` | ✅ |
| T | F | F | `[false]` | ✅ |
| T | {} | {} | `[]` | ✅ |
| F | T | F | `[false]` | ✅ |
| F | F | F | `[false]` | ✅ |
| F | {} | F | `[false]` | ✅ (short-circuits before right is evaluated) |
| {} | T | {} | `[]` | ✅ |
| {} | F | F | `[false]` | ✅ |
| {} | {} | {} | `[]` | ✅ |

Tables for `or`, `xor`, `implies` walk out similarly clean.

**But:** `toSingletonBoolean` silently returns `undefined` for **three** off-spec inputs, masking them as empty:

1. **Multi-element boolean collection.** `{true, true}` is a 2-element collection. Per §5.5, passing it to `and` must **raise an error**. The impl treats it as empty.
2. **Singleton non-boolean.** Spec §5.5 + §5.2 Boolean conversion rules say a singleton of certain non-boolean types may convert to boolean (see `toBoolean()` §5.1.1); otherwise an error. Impl silently treats any non-boolean singleton as empty, regardless of whether conversion should succeed.
3. **Empty-length collection.** Per §6.5, a singleton of `{}` is the "empty" case — OK. But `toSingletonBoolean([]).length !== 1` also returns undefined; both cases collapse to one code path, hiding a distinction the spec draws.

**Minimal repro (for the case that is most obviously off-spec):**

```ts
import { evaluate } from "@fhir-dsl/fhirpath";
// Passing a 2-element boolean collection through an `and` operator.
// Per FHIRPath §5.5, this must raise an error.
const ops = /* compile: "name.given.exists() and name.family.exists()"
               with name being a collection of 2 entries, both exists() -> true */;
// Expected: runtime error
// Actual (this impl): `[]`, i.e. silently masked as empty
```

Formal status: table correctness CONFIRM-STRONG; singleton-evaluation CONFIRM-WEAK / approaches REFUTE. Aggregate verdict for AUDIT's claim: **CONFIRM-WEAK**. AUDIT overstates by saying "correctly propagates empty per spec §3.2.2"; the empty-propagation is correct, the singleton-evaluation precondition that the spec requires is not enforced.

**Open question for team debate:** Is the team's policy to match permissive FHIRPath impls in the wild (most silently degrade) or to match the letter of the normative spec? If the former, this claim stays; if the latter, it downgrades.

---

### A2. Empty-propagation on comparison operators — **REFUTE**

> AUDIT line 46: "Empty-propagation on comparison operators is spec-compliant."

**Spec reference.** FHIRPath N1 §6.3 Equality and §6.4 Comparison. Key clauses I'll lean on:

- §6.3.1 (`=`): "If one or both of the arguments is an empty collection, a comparison operator will return an empty collection."
- §6.3.1 last paragraph: "For `Date`, `DateTime`, and `Time` values, the `=` operator will return empty (`{}`) if the values compared have differing precisions."
- §6.3.1: "For `Quantity` values, equivalent units are considered equal" (with UCUM reference).
- §6.4.1 (`<`, `<=`, `>`, `>=`): same partial-precision-yields-empty rule.

**What the code does.** `operators.ts:4-71` routes every comparison through `evalComparison`:

```ts
// operators.ts:73-92
function evalComparison(
  collection: unknown[],
  operand: unknown,
  ctx: EvalContext,
  comparator: (a: unknown, b: unknown) => boolean,
): unknown[] {
  if (collection.length === 0) return [];
  const left = collection.length === 1 ? collection[0] : collection[0];   // <-- bug

  let right: unknown;
  if (isCompiledPredicate(operand)) {
    const rightCollection = ctx.evaluateSub(operand.ops, ctx.rootResource);
    if (rightCollection.length === 0) return [];
    right = rightCollection[0];
  } else {
    right = operand;
  }
  return [comparator(left, right)];
}
```

Comparators are all JS `===`, `!==`, `<`, `>`, `<=`, `>=` (lines 7-22).

**Refute #1: partial-precision date equality silently returns `false`, not `{}`.**

Minimal repro:

```ts
// Patient.birthDate is a partial-precision year-only date.
// Comparing against a year-month-day should yield {}, not false, per §6.3.1.
const ops = compile("birthDate = '2012-01-15'");
evaluate(ops, { resourceType: "Patient", birthDate: "2012" });
// Spec-expected: []  (empty collection — precisions differ)
// Actual: [false]    ('2012' === '2012-01-15' is false in JS)
```

This is a hard REFUTE. The behavior diverges from §6.3.1 in a directly observable way.

**Refute #2: object equality uses reference identity, not value equality.** [UPDATED after builder verification]

Originally formulated as a Quantity-specific refute. After verifying `packages/fhirpath/src/builder.ts` (340 lines) and `expression.ts`, the reality is broader and more subtle:

- The builder has **no dedicated Quantity literal constructor**. No `.quantity(value, unit)` helper, no `NULLARY_FNS` entry for Quantity, no `literal()` entry point.
- However, `expression.ts:49-52` `.eq(value: unknown)` accepts ANY JS value untyped. `resolveValue()` passes plain objects straight through into `OperatorOp.value`. So a user CAN write `$this.valueQuantity.eq({ value: 120, unit: "mg" })`, which compiles to `{type: "eq", value: {value: 120, unit: "mg"}}`.
- `evalComparison` (operators.ts:91) then runs `comparator(left, right)` with `(a,b) => a === b` on two distinct object references. `{...} === {...}` is `false`. Object equality is broken.

**Repro (now reachable through the public API):**

```ts
import { fhirpath, evaluate } from "@fhir-dsl/fhirpath";
const expr = fhirpath("Observation").where(($this: any) =>
  $this.valueQuantity.eq({ value: 120, unit: "mg" })
);
expr.evaluate({ resourceType: "Observation", valueQuantity: { value: 120, unit: "mg" } });
// Spec-expected (§6.3.1, treating structurally-equal objects as equal): [{value:120,unit:"mg"}]
// Actual: []  (where() filters out because eq returns [false])
```

The same bug applies to **any** non-primitive left operand: CodeableConcept, Coding, HumanName, Address, Reference, Period. JS reference equality is always the comparator. Per §6.3.1, FHIRPath equality on compound types is defined element-by-element; this impl skips that entirely.

Note on scope: AUDIT's "positive" at line 46 says empty-propagation is spec-compliant — narrowly it's right (empty-collection handling on lines 79 and 85 returns `[]`). But the broader equality machinery behind comparison operators is broken for every compound value. The word "correctly" in AUDIT is unsupportable.

**Refute #3: multi-element left-hand side silently yields comparator on first element.**

The `left` assignment:

```ts
const left = collection.length === 1 ? collection[0] : collection[0];
```

**Both branches are identical.** A 3-element left collection, per §6.3.1 ("If there are multiple items on either side of the operator, the comparator is applied pairwise … the operator returns empty if none of the comparisons return true"), should NOT produce a single comparator call — it should either broadcast elementwise (for strict equality semantics) or error under singleton evaluation. Current code silently takes `collection[0]`, producing a false positive/negative. Repro:

```ts
evaluate(compile("name.given = 'Bob'"),
  { resourceType: "Patient", name: [{ given: ["Alice", "Bob"] }] });
// given is ["Alice", "Bob"]
// Spec: the collection "Alice","Bob" does not equal singleton "Bob", so [] per §5.5 or [false]
//       under a broader collection-equality reading of §6.3.1.
// Actual: [false]  — but actually it compares "Alice" === "Bob" → [false],
//         hiding the actual issue (silently dropping "Bob")
```

If the intent was singleton evaluation, the conditional in line 80 is a bug; if the intent was pairwise broadcasting, the loop is missing entirely.

**Aggregate verdict: REFUTE.** At least three distinct spec-equality behaviors (partial-precision date, Quantity value equality, multi-element left operand) deviate observably from FHIRPath §6.3/§6.4.

---

### A3. `children()` / `descendants()` cycle detection — **REFUTE**

> AUDIT line 47: "`children()` / `descendants()` include cycle detection in `packages/fhirpath/src/eval/nav.ts`."

**Spec reference.** FHIRPath N1 §5.2.2 `children()`: "Returns a collection with all immediate child nodes of all items in the input collection." §5.2.3 `descendants()`: "Returns a collection with all descendant nodes of all items in the input collection." The spec does not mandate cycle detection (FHIR objects are trees in practice), but AUDIT explicitly claims cycle detection exists as a positive.

**What the code does.** `packages/fhirpath/src/eval/nav.ts:13-36`:

```ts
case "descendants": {
  const result: unknown[] = [];
  const stack = [...collection];
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (item == null || typeof item !== "object") continue;
    const children = Object.values(item as Record<string, unknown>).flatMap((val) => {
      if (val == null) return [];
      return Array.isArray(val) ? val : [val];
    });
    result.push(...children);
    stack.push(...children.filter((c) => c != null && typeof c === "object"));
  }
  return result;
}
```

**There is NO cycle detection.** No `seen` set, no visited marker, no depth cap. `children` is even simpler — just `Object.values().flatMap()`. The claim is flatly false.

Cycle detection **does** exist, but in a **different** function: `repeat()` in `packages/fhirpath/src/eval/filtering.ts:42-61` uses a `Set<unknown>()`. AUDIT appears to conflate `repeat()` (which correctly cycle-guards with reference-equality, noted in AUDIT §Low line 40 as a separate gap) with `descendants()`.

**Minimal repro (3 lines + a compile step):**

```ts
import { evaluate } from "@fhir-dsl/fhirpath";
const a: any = { resourceType: "Patient", id: "a", name: [{ given: ["x"] }] };
a.self = a;
// Compile "Patient.descendants()" and run:
// stack grows unbounded → RangeError or infinite loop.
evaluate(descendantsOps, a);
```

In practice, R5 resources like `Questionnaire` with `item.item.item...` nesting are normally trees, but FHIR `contained` + `Reference`-like user-constructed structures can cycle, and JSON merge documents in `Bundle.entry[*].resource` constructed by a hostile server or a buggy client can too. This becomes a denial-of-service if `descendants()` is ever reached on such input.

**Verdict: REFUTE.** The claimed cycle detection in `nav.ts` does not exist.

---

### A4. `distinct()`, `subsetOf()`, `supersetOf()` use `deepEqual` — **CONFIRM-STRONG (correct for this scope)**

> AUDIT line 46: "`distinct()`, `subsetOf()`, `supersetOf()` use `deepEqual` (correct)."

**Spec reference.** FHIRPath N1 §5.1 `distinct()`: "Returns a collection containing only the unique items in the input collection." §5.1 `subsetOf()` / `supersetOf()`.

**What the code does.** `packages/fhirpath/src/eval/existence.ts:55-82` uses a local `deepEqual` that recursively compares keys. Let me adversarially probe:

- Objects with same shape different property order: `{a:1,b:2}` vs `{b:2,a:1}` → both produce same key count, every key matched → equal. ✅
- Nested arrays: distinct with `[1,[2,3]]` items → recurses through arrays since `typeof Array === "object"`, iterates `Object.keys` (which yields array indices) — works. ✅
- NaN: `deepEqual(NaN, NaN)` → `NaN === NaN` is false → "a == null || b == null" both false → typeof equal → typeof object is false → returns false. ⚠️ But spec §6.3 says equality is `{}` on missing/invalid, NaN sort of fits "invalid" but FHIR doesn't emit NaN in JSON. Grey area, not a clear REFUTE.
- Cyclic objects (`a.self = a`): this deepEqual is **not** cycle-safe. If distinct is called on a cyclic structure, infinite recursion. Low severity because primary evaluators check cycles, and descendants doesn't, so the cycle wouldn't propagate here unless the user directly did `.distinct()` on a cyclic input.
- Different-ordered array contents: `[1,2]` vs `[2,1]` → indices `"0"`, `"1"` → compares `1===2` → false → not equal. This **is** correct per spec §6.3.1 last paragraph: "For collections, equality returns true if the collections contain the same elements in the same order."

**Verdict: CONFIRM-STRONG for the scope AUDIT claims.** Caveat: NaN is handled weirdly; cyclic inputs recurse forever — minor follow-ups, not a refutation of the stated claim.

---

## Section B — Challenges to AUDIT.md "Gaps" (AUDIT.md §1 Highs/Mediums)

These are less contentious (AUDIT already says they're missing), but some "gaps" are understated or have additional issues worth flagging.

### B1. Binary arithmetic missing — **CONFIRM-STRONG** (AUDIT understates)

AUDIT line 19 says no `+`, `-`, `*`, `/`, `div`, `mod`, citing empty `ops.ts` entries. I confirmed from `packages/fhirpath/src/ops.ts:75-85`: `MathOp` only includes `abs`, `ceiling`, `exp`, `floor`, `ln`, `log`, `power`, `round`, `sqrt`, `truncate`. Binary arithmetic entirely absent.

**Addition:** AUDIT does **not** note that `math.ts:5-6` applies `Math.abs` silently to non-numbers (returns `[]`) rather than raising per §5.6 singleton evaluation. Also `log`/`ln`/`sqrt`/`power` don't guard domain (e.g. `ln(0)` returns `-Infinity`, spec §6.6.8 ln says "If the input is empty, the result is empty"; but `ln(0)` should probably be empty not `-Infinity`). Minor spec gap within an already-known gap.

### B2. Environment variables missing — **CONFIRM-STRONG**

AUDIT line 22 confirmed: grep for `%` in `packages/fhirpath/src/` returns lexing characters, not environment-variable handling. The `evaluate()` signature has no env-bag parameter; `expression.ts` wires only `$this`. Note `spec-gaps.test.ts:40-43` already pins this as a todo.

### B3. Polymorphic `value[x]` — **REFUTE** the AUDIT framing

AUDIT line 32 (Medium) says `ofType()` uses "hardcoded `TYPE_CHECKS`" rather than "spec-driven inference." That's CONFIRMED, but AUDIT understates the severity.

Looking at `filtering.ts:5-20`:

```ts
const TYPE_CHECKS: Record<string, string[]> = {
  Quantity: ["value", "unit"],
  CodeableConcept: ["coding"],
  ...
};
```

Then at line 96: `checkKeys.some((key) => key in obj)` — **ANY** of the check keys being present is enough to say it's the type. A `CodeableConcept` with only `coding` passes the `CodeableConcept` check. But a plain object with `coding: [...]` that's NOT a `CodeableConcept` (e.g., a user-defined extension payload) would also pass. False positives.

Worse: `Identifier: ["system", "value"]` — an object with just `system` or just `value` matches `Identifier` even if it's actually a `Coding` (also has `system`). Types are non-disjoint.

Severity: this isn't just "hardcoded"; it's semantically ambiguous. Many FHIR types share key names. `Period: ["start", "end"]` and `Range: ["low", "high"]` are reasonably disjoint, but `Coding` vs `Identifier` both have `system` and `value`. Structural collision is guaranteed.

**Verdict: AUDIT understates.** The polymorphism handling isn't just "hardcoded" — it's structurally unsound.

---

## Section C — New findings NOT in AUDIT

These are off-spec behaviors that `AUDIT.md` does not mention at all. Each stands as an independent REFUTE of the implicit claim that the package is "internally consistent."

### C1. `iif()` evaluates criterion against `collection[0]` only, not input context — **REFUTE**

**Spec reference.** FHIRPath N1 §6.5.2 `iif(criterion, true-result [, otherwise-result])`: "The function evaluates the criterion expression to a Boolean value; if true, the true-result expression is evaluated and returned; otherwise the otherwise-result expression is evaluated and returned."

The criterion is evaluated **once, in the current input context**. It is NOT per-element, and it does NOT use `collection[0]` as a proxy for the input.

**What the code does.** `packages/fhirpath/src/eval/utility.ts:24-37`:

```ts
case "iif": {
  const criterionResult = collection.length > 0 ? ctx.evaluateSub(op.criterion.ops, collection[0]) : [];
  const isTrue = criterionResult.length === 1 && criterionResult[0] === true;
  if (isTrue) {
    return collection.flatMap((item) => ctx.evaluateSub(op.trueResult.ops, item));
  }
  if (op.otherwiseResult) {
    return collection.flatMap((item) => ctx.evaluateSub(op.otherwiseResult!.ops, item));
  }
  return [];
}
```

Two independent bugs:

1. Criterion is evaluated against `collection[0]` rather than the whole input. If the criterion depends on the whole collection (e.g. `collection.count() > 1`), it sees only the first item.
2. Once criterion is decided, `trueResult` / `otherwiseResult` are then applied **per element via `flatMap`**. Per spec, both branches are evaluated against the same input context as the criterion, once. Not broadcast.

**Repro:**

```ts
// Spec: "iif(count() > 1, 'many', 'one')" on a 3-element collection:
//       criterion evaluates against whole input → count() = 3 > 1 → true → return ['many']
// Impl: criterion against collection[0] (single item) → count() = 1, result is '1 > 1' → false
//       → return otherwise broadcast per element → ['one','one','one']
```

Verdict: **REFUTE** (two distinct bugs).

### C2. `convertToBoolean` rejects spec-required strings — **REFUTE**

**Spec reference.** FHIRPath N1 §5.1.1 `toBoolean()`. Quoted:

> If the item is a String, the string must be in the following list of allowed values, comparisons are case-insensitive:
> - `'true'`, `'t'`, `'yes'`, `'y'`, `'1'`, `'1.0'` → true
> - `'false'`, `'f'`, `'no'`, `'n'`, `'0'`, `'0.0'` → false

**What the code does.** `packages/fhirpath/src/eval/conversion.ts:106-119`:

```ts
function convertToBoolean(item: unknown): boolean | undefined {
  if (typeof item === "boolean") return item;
  if (typeof item === "string") {
    if (item === "true") return true;
    if (item === "false") return false;
    return undefined;
  }
  if (typeof item === "number") {
    if (item === 1) return true;
    if (item === 0) return false;
    return undefined;
  }
  return undefined;
}
```

Exact-match on `"true"`/`"false"` only. Case-sensitive. Missing `'t'`, `'T'`, `'TRUE'`, `'yes'`, `'y'`, `'Y'`, `'1.0'`, `'no'`, `'n'`, `'N'`, `'0.0'`, `'f'`, `'F'`, `'FALSE'`, etc. Also accepts only numeric `1`/`0`, not decimal `1.0`/`0.0` (JS `1 === 1.0` is true, so this is OK by accident).

**Repro:**

```ts
evaluate(compile("'yes'.toBoolean()"), {});
// Spec: [true]
// Actual: []
evaluate(compile("'TRUE'.toBoolean()"), {});
// Spec: [true]
// Actual: []
```

Verdict: **REFUTE.** This is a spec violation.

### C3. `convertToInteger` accepts non-integer strings — **REFUTE**

**Spec reference.** FHIRPath N1 §5.1.2 `toInteger()`. Quoted:

> If the item is a String, but the string is not convertible to an Integer (using the regex format `(\+|-)?\d+`), the result is empty.

**What the code does.** `packages/fhirpath/src/eval/conversion.ts:121-129`:

```ts
function convertToInteger(item: unknown): number | undefined {
  if (typeof item === "number" && Number.isInteger(item)) return item;
  if (typeof item === "string") {
    const n = Number.parseInt(item, 10);
    return Number.isNaN(n) ? undefined : n;
  }
  if (typeof item === "boolean") return item ? 1 : 0;
  return undefined;
}
```

`Number.parseInt("12.5", 10)` returns `12` (truncates at the decimal). `parseInt("12abc", 10)` returns `12`. Both should be empty per spec (regex `(\+|-)?\d+` rejects them).

**Repro:**

```ts
evaluate(compile("'12.5'.toInteger()"), {});
// Spec: []   (not a valid integer literal)
// Actual: [12]
evaluate(compile("'12abc'.toInteger()"), {});
// Spec: []
// Actual: [12]
```

Verdict: **REFUTE.** Spec violation — the conversion must fail on any non-integer string.

### C4. `toDate` / `toDateTime` accept invalid dates — **REFUTE** (partially noted in AUDIT)

AUDIT line 34 flags "`toDate()` / `toDateTime()` loose parsing", but the case is worse than AUDIT states:

- `toDate`'s regex `/^\d{4}(-\d{2}(-\d{2})?)?/` matches `"2024-99-99"` and returns it as-is — no month/day range check.
- `toDateTime` uses `Date.parse()`, which is engine-specific for non-ISO strings (§5.1.3.2 mandates ISO 8601). `Date.parse("2024/01/01")` returns a valid timestamp in V8, but per spec this string is not a valid DateTime. Repro:

```ts
evaluate(compile("'2024-99-99'.toDate()"), {});
// Spec: []  (invalid month/day)
// Actual: ['2024-99-99']
evaluate(compile("'2024/01/01'.toDateTime()"), {});
// Spec: []  (non-ISO format)
// Actual: ['2024/01/01']  (depending on Date.parse engine behavior)
```

Verdict: **REFUTE.** AUDIT's "loose parsing" understates; the impl accepts invalid dates outright.

### C5. Operator `is` returns `[false]` on multi-element collection — **REFUTE**

`operators.ts:65-66`: `return [collection.length === 1 && matchesType(collection[0], op.typeName)];`

Per spec §6.2.1: `is` requires a single item. Multi-element input should raise under §5.5 singleton evaluation. Impl silently returns `[false]`.

```ts
evaluate(compile("name.given is String"),
  { resourceType: "Patient", name: [{ given: ["Alice", "Bob"] }] });
// Spec: error (multi-element input to `is`)
// Actual: [false]
```

Verdict: **REFUTE.**

### C6. `matchesType` for `Integer` accepts 64-bit values — **weak REFUTE**

FHIRPath `Integer` is 32-bit signed per §5.1.2.3. `Number.isInteger(9999999999999)` returns `true` in JS. So `is Integer` returns true for values outside the spec range.

```ts
evaluate(compile("(9999999999999 is Integer)"), {});
// Spec: false (out of 32-bit range)
// Actual: [true]
```

Minor severity in practice; REFUTE in the strict sense.

---

## Section D — Challenges against `packages/fhirpath/test/spec-gaps.test.ts`

The pin file correctly captures a subset of gaps but is incomplete relative to the actual source-level issues I found. Specifically:

- D1. No pin for the `evalComparison` `left` bug (Section A2 above). The file says nothing about partial-precision date equality. **Missing coverage.**
- D2. No pin for the `descendants` cycle gap (Section A3). **Missing coverage.**
- D3. No pin for `iif`'s criterion-context bug (Section C1). **Missing coverage.**
- D4. No pin for conversion spec violations (Sections C2, C3, C4). **Missing coverage.**
- D5. The existing pin at lines 54-57 ("proxy currently compiles `.extension` as a field navigation") is CONFIRM-STRONG — I verified this via `builder.ts` is proxy-based and accepts any property name.
- D6. The pin comment at lines 72-76 for Quantity UCUM equality is CONFIRM-WEAK — the stated gap holds, but the pin is a `todo`, not a positive assertion, so it doesn't refute anything.

**Expectation for test-engineer's task #7:** the new `spec-compliance.test.ts` should include failing-expectation assertions (or at minimum `it.fails`/`it.todo`) for each of the REFUTEs in Sections A2, A3, C1-C6. If it asserts that these behaviors hold correctly, the test file contradicts source and I will open a second round of refute against it.

---

## Section E — Tally

| Category | Count |
|---|---|
| CONFIRM-STRONG | 2 (A4, B2) |
| CONFIRM-WEAK | 2 (A1, B1) |
| REFUTE against AUDIT.md positives | 2 (A2, A3) |
| REFUTE / new findings (not in AUDIT) | 7 (B3 severity, C1-C6) |
| Open questions for debate | 3 (see Section A1, A4 caveats, D) |

**Headline disputes for team debate (task #13):**

1. AUDIT claim A3 ("cycle detection in `nav.ts`") is **flatly false**. This must be corrected in AUDIT.md before release, or the audit loses credibility on easier items.
2. AUDIT claim A2 ("comparison operators spec-compliant") is **false** in at least three observable ways. Priority fix candidate.
3. AUDIT understates the polymorphism gap (B3): the implementation is not merely "hardcoded" — it's structurally unsound for non-disjoint FHIR types like `Coding` vs `Identifier`. Either rewrite using SpecCatalog type info (which now exists per recent commits) or narrow TYPE_CHECKS to disjoint keys.
4. New finding C1 (`iif`) is a straight bug unrelated to any "gap" — the fix lives in utility.ts and should ship regardless of the larger audit decisions.

*End of challenge doc. Author: spec-challenger.*
