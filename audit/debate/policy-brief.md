---
name: Policy brief — three FHIRPath semantics where spec and ergonomics diverge
description: First cut authored by spec-challenger at dsl-explorer's request. Supplies task #13 arbitration with concrete spec quotes, impl behavior, ergonomic counter-argument, and recommended resolution.
type: debate-brief
---

# Policy brief — spec vs ergonomics

**Status:** reviewed and amended (Row 2 IEEE 754 wording, Row 3 `mathDomainMode` opt-in). Merged into `audit/debate/decisions.md` as the FP.1-ARBITER cross-reference. See [decisions.md → FP.1-ARBITER](./decisions.md#fp1-arbiter).

**Scope:** three FHIRPath semantic policies where strict §-compliance diverges from DSL ergonomics. Each row = quoted spec, current behavior (file:line), ergonomic counter-argument, recommended resolution with opt-in escape hatch.

---

## Row 1 — Singleton evaluation on multi-element collection

### Quoted spec (FP-NAV-005, §4.5)

> "IF the collection contains a single node AND the node's value can be converted to the expected input type THEN the collection evaluates to the value of that single node; ELSE IF the collection contains a single node AND the expected input type is Boolean THEN the collection evaluates to true; ELSE IF the collection is empty THEN the collection evaluates to an empty collection; **ELSE the evaluation will end and signal an error to the calling environment.**"

Example: "if the Patient has multiple `telecom` elements, then this expression will result in an error because of the multiple telecom elements."

### Current behavior

`packages/fhirpath/src/eval/operators.ts:98-103` — `toSingletonBoolean()` returns `undefined` for `collection.length !== 1`. Callers then propagate `[]` (empty) instead of raising. Three-valued logic tables (`and`/`or`/`xor`/`implies` at `operators.ts:24-63`) ARE correct once inputs are singleton, but the enforcement gate is silent.

Additional: `operators.ts:80` — `const left = collection.length === 1 ? collection[0] : collection[0]` (dead ternary) silently picks `collection[0]` on multi-element LHS for `=`/`<`/`<=`/`>`/`>=`. Same class of violation.

### Options

| Option | Behavior | Spec-conformance |
|---|---|---|
| A. Strict error (spec) | `throw new SingletonEvaluationError("Patient.telecom: expected 0..1, got 3")` | ✓ Spec-correct |
| B. Silent first-item | `collection[0]` silently wins | ✗ Violates §4.5 |
| C. Silent empty | `[]` propagates; downstream ops empty-propagate | ✗ Violates §4.5 (ELSE error clause) |

Current DSL mixes B (at `operators.ts:80` for comparison) and C (at `operators.ts:98` for boolean). Inconsistent.

### Ergonomic counter-argument

> "Real FHIR data is messy. Requiring `.first()`/`.single()` annotations everywhere a cardinality is uncertain is noise. Other FHIRPath implementations (hapi-fhir, fhirpath.js in some modes) are lenient; strict errors will trip users up when they migrate."

Valid concern. But:
- hapi-fhir errors are controllable via engine options; lenience is opt-in.
- `fhirpath.js` errors unless `{ throwIfNotSingle: false }` is passed. Default IS strict.
- Empty propagation is worse than an error because bugs manifest as "no results" far from the cause.

### Recommended resolution

**A (strict) as default, with `singletonMode` escape hatch.**

```ts
const client = createFhirClient({
  fhirpath: {
    singletonMode: "strict" | "permissive-first" | "permissive-empty"
  }
});
```

- `strict` (default): raise `SingletonEvaluationError`. Matches §4.5.
- `permissive-first`: silent `collection[0]` (current B-for-comparisons behavior). Opt-in.
- `permissive-empty`: silent `[]` (current C-for-boolean behavior). Opt-in.

Consistency requirement: whichever mode is picked applies uniformly to boolean-context, comparison-context, and `is`-context. Current inconsistency (B for comparisons, C for booleans) should NOT be preserved as an option.

**Rationale:** the spec is not ambiguous — it says "signal an error" in the ELSE clause. The ergonomic cost is borne by users who opt in. The correctness win is that bugs surface early and loudly, not far from their cause.

---

## Row 2 — Implicit conversion in comparisons

### Quoted spec (FP-EQ-001, §6.1.1)

> "Operands must be single items of the same type (or implicitly convertible); multi-item collections compare element-wise in order."

> "`{ } = 1` → `{ }`"

Additional (§6.3.1): partial-precision dates `@2012 = @2012-01-15` → `{}` (precision mismatch). Quantity equality is structural (value + unit), with UCUM conversion.

### Current behavior

`packages/fhirpath/src/eval/operators.ts:7` — `case "eq": return evalComparison(collection, op.value, ctx, (a, b) => a === b);`

JS `===` is used for all equality types. Consequences:
- `"2012" === "2012-01-15"` → `false` (should be `{}` per precision mismatch)
- `{value:120,unit:"mg"} === {value:120,unit:"mg"}` → `false` (reference identity, not structural)
- `"café" === "cafe\u0301"` → `false` (NFC vs NFD — arguably spec gap, not bug)
- `3 === 3.0` → `true` (correct by accident of IEEE 754 single-number-space; matches §6.1 implicit numeric promotion)
- `"abc" === "ABC"` → `false` (correct for `=`, NOT for `~`)

### Options

| Option | Behavior | Spec-conformance |
|---|---|---|
| A. Strict spec §6.1/§6.3.1 | type-aware dispatch: Date precision → `{}` on mismatch; Quantity → value+unit with UCUM; String → NFC-normalized | ✓ Spec-correct |
| B. JS `===` everywhere (current) | reference equality; many false negatives | ✗ Violates §6.1, §6.3.1 |
| C. Promote numeric; leave others as `===` | partially correct, partially not | Mixed |

### Ergonomic counter-argument

> "UCUM conversion and partial-precision date logic are 500+ lines of new code. Users can pre-normalize inputs before `.eq()`. Perfect is the enemy of shipped."

Valid for Quantity + UCUM (argueably requires a dependency or a big helper). Less valid for Date precision (cheap: parse ISO, check precision level, compare as far as mutual precision allows, return `{}` on mismatch).

### Recommended resolution

**A (strict spec) for Date precision now; split Quantity/UCUM into a follow-up.**

- **Date precision equality** — cheap fix. Add a `compareDates(left, right) → boolean | null` helper; `null` means incomparable (spec `{}`). 20 lines.
- **Quantity structural equality (no UCUM)** — cheap. Compare `{value, unit, system, code}` structurally; `null` if types differ.
- **Quantity UCUM conversion** — defer. Add `ucum: "strict" | "ignore" | "lenient"` config. Default `strict` returns `{}` for unit-mismatch (spec-conformant); `ignore` treats unit as a label; `lenient` would require UCUM lib (e.g. `ucum-lhc`).
- **String NFC** — pair with the search NFC fix (row FP.10 in decisions.md). Library-wide normalization helper at input boundaries (search values AND FHIRPath string literals).

**Rationale:** `===` is broken for the common case (comparing two `Quantity` objects fetched from the same server IS a real use-case and it silently returns false). Fixing Date + structural Quantity is cheap; UCUM + NFC can stage.

---

## Row 3 — Empty propagation in arithmetic and comparisons

### Quoted spec (FP-MATH-001, FP-MATH-002, §4.4.1)

> "if any operand to a single-input operator or function is an empty collection, the result is an empty collection."

> "`/` division-by-zero returns empty (`{}`), not error."

Example: `1 + {}` → `{}`, not `1`. `1 / 0` → `{}`, not `Infinity`. `{}.upper()` → `{}`, never a throw.

### Current behavior

Arithmetic operators are NOT in the current impl surface (dsl-explorer has marked `+ - * / div mod` as SPEC-GAP-BY-DESIGN in decisions.md row FP.12). However:

- `evalComparison` at `operators.ts:73-92` is called BY non-arithmetic equality/comparison paths and does handle `collection.length === 0 → []` correctly at line 79.
- Math functions (`abs`, `ceiling`, `sqrt`, `ln`, `exp`, `log`, `power`, `round`, `truncate`) are partially in. `sqrt(-1)` leaks `NaN` per FP-MATHF-009; `ln(0)` leaks `-Infinity`. Not empty-propagating as spec requires.

### Options

| Option | Behavior | Spec-conformance |
|---|---|---|
| A. Empty everywhere per §4.4.1 | any missing operand → `{}`; division-by-zero → `{}`; `sqrt(-1)` → `{}` | ✓ Spec-correct |
| B. Ergonomic zero/NaN fallback | `1 + {}` → `1`, `sqrt(-1)` → `NaN` | ✗ Violates §4.4.1 |
| C. Throw on domain error; empty on missing operand | `sqrt(-1)` throws, `1 + {}` → `{}` | Partial ✗ |

### Ergonomic counter-argument

> "`{}` propagation in a long chain means a missing field at step 3 silently produces `{}` at step 12. Debugging is hard. Returning `0` / `NaN` / `false` lets users see intermediate state."

Sympathetic to the debug concern, but the spec-compliant answer is `.trace()` (FP-UTIL per §5.9), not behavioral drift. If the user wants `{}` surfaced early, they add `.iif(exists(), then, else)` explicitly.

### Recommended resolution

**A (empty everywhere) as default, with narrow `mathDomainMode` opt-in for debug environments.**

- The arithmetic operators aren't implemented yet (FP.12). When they land, they MUST empty-propagate per §4.4.1 — don't inherit JS operator semantics.
- The in-tree math functions (`sqrt`/`ln`/`power`/`exp`/`log`) MUST guard domain and return `[]` not leak `NaN`/`Infinity`. Test-engineer has this as `test.fails` rows FP-MATHF-005/007/009.
- Add `.trace(label)` (currently MISSING per FP-UTIL-003) as the spec-native debug tool. **Prerequisite for full Row 3 ergonomics** — until `.trace()` ships, users have no signal to distinguish `sqrt(-1) → {}` (domain error) from `sqrt({}) → {}` (missing input). Docs-engineer should surface the FP-UTIL-003 gap prominently alongside the Row 3 recommendation in task #15.

```ts
const client = createFhirClient({
  fhirpath: {
    mathDomainMode: "strict-empty" | "throw"
  }
});
```

- `strict-empty` (default): `{}` per §4.4.1. Spec-conformant.
- `throw`: raise `MathDomainError` for `sqrt(-1)`, `1/0`, `ln(0)`, etc. Off-by-default; intended for dev/test environments where fail-fast beats silent empty. Mirrors Row 1's `singletonMode` opt-in structure.

**Rationale:** the spec answer is unambiguous and is the default. The `throw` mode does NOT weaken §4.4.1 conformance (opt-in, documented as non-spec) — it only gives users who explicitly want fail-fast a switch, and avoids the `sqrt(-1) === sqrt({})` indistinguishability problem while FP-UTIL-003 (`.trace()`) is unfixed.

---

## Summary

| Row | Spec rule | Current | Recommended | Escape hatch |
|---|---|---|---|---|
| 1. Singleton | §4.5 error | mixed silent-first/silent-empty | **A: strict error** | `singletonMode: "permissive-first" \| "permissive-empty"` |
| 2. Equality types | §6.1/§6.3.1 type-aware | JS `===` | **A: type-aware** | `ucum: "strict" \| "ignore" \| "lenient"` for Quantity only |
| 3. Empty in arithmetic | §4.4.1 empty | `NaN`/`Infinity` leak | **A: empty everywhere** | `mathDomainMode: "throw"` (dev/test opt-in); `.trace()` for debug (FP-UTIL-003 prerequisite) |

**Common thread:** pick the spec answer as the default. Where real ergonomic cost exists (Row 1's `.single()` noise, Row 2's UCUM lib dependency), offer narrowly-scoped opt-ins. Do NOT default to lenience — the current behavior already demonstrates the cost: real bugs hide behind silent empty.

**Impact on docs:**
- `README.md` / `AUDIT.md` "FHIRPath compliance" section should cite this brief.
- `docs-engineer`'s Missing-Features list (task #15) should rank the singleton-mode config + Date-precision equality HIGH (cheap wins, correctness-critical).
- Bug Report (task #16) should quote this brief's "Current behavior" sections verbatim for the affected rows.

---

**Next:** dsl-explorer reviews, merges into `decisions.md` as FP.1 arbiter note, and flags any divergence. Spec-reader adjudicates any disagreement.
