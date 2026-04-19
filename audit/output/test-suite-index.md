# Spec-Compliance Test-Suite Index

**Purpose:** Catalog every new spec-compliance test file produced by the audit, what it proves, and how to run just the compliance subset. Complements `audit/output/spec-coverage-matrix.md` (the what) with the actual test filenames (the how).

**Vitest convention established by test-engineer:**
- `it(...)` — rule is IMPLEMENTED and behaves to spec. Expected to pass on `main`.
- `test.fails(...)` — rule is IMPLEMENTED but spec-incorrect. The assertion states the spec expectation; it is *expected to fail today* and will pass when the underlying bug is fixed (at which point flip to `it(...)`).
- `it.todo(...)` — rule is MISSING. No code path to test. Serves as a living todo list.

---

## Test files on disk (at audit time, commit `4f91589`)

| File | Lines | `it` | `test.fails` | `it.todo` | Total | Covers |
|---|---:|---:|---:|---:|---:|---|
| `packages/fhirpath/test/spec-compliance.test.ts` | 1065 | 80 | 34 | 59 | **173** | All FP-NAV/IDX/SEL/SUB/COM/EXI/LOG/EQ/CMP/MATH/COL/TYP/TREE/STR/MATHF/CONV/UTIL/AGG/VAR/LIT/FHIR rules |
| `packages/fhirpath/test/spec-gaps.test.ts` | 77 | 0 | 0 | 14 | **14** | MISSING-feature pins per category (arithmetic, indexer, env vars, FHIR ext, equivalence, `$index`/`$total`, aggregate, UCUM) |
| `packages/core/test/search-spec-compliance.test.ts` | 558 | 42 | 10 | 8 | **60** | All SRCH-TYP/PFX/MOD/COMB/CHAIN/HAS/COMP/RES/INC/META/FILT/QRY/POST/URL rules |
| `packages/core/test/search-url-edge-cases.test.ts` | 145 | 11 | 0 | 0 | **11** | Pins current (partly-broken) escape-family behavior so future fixes surface in the diff |
| `packages/core/test/search-url-encoding.test.ts` | — | — | — | — | — | Pre-existing encoding regression tests (not audit-produced) |
| `packages/runtime/test/runtime-spec-compliance.test.ts` | **MISSING** | — | — | — | — | **Task #9 pending** — will cover all REST-READ/UPDATE/CREATE/DELETE/PATCH/HIST/CAP/BUND/HDR/MIME/HEAD/ASYNC/ERR rules + OP-* |

**Totals on disk:** 258 test entries across 4 audit-produced files. Pending: runtime compliance suite (est. 80+ entries based on the rule count).

---

## Per-file coverage detail

### `packages/fhirpath/test/spec-compliance.test.ts` (1065 lines)

Organized by spec section. Each `describe` block maps to a FHIRPath rule family; each `it` / `test.fails` / `it.todo` names a specific rule ID.

| Describe block | Line | Rule IDs covered | Passing (`it`) | Failing-by-design (`test.fails`) | Missing (`it.todo`) |
|---|---:|---|---:|---:|---:|
| Navigation (FP-NAV-*) | 57 | FP-NAV-001..005 | 5 | 2 | 0 |
| Indexer (FP-IDX-*) | 124 | FP-IDX-001, 002 | 1 | 0 | 2 |
| Filtering & projection (FP-SEL-*) | 143 | FP-SEL-001..004 | 5 | 2 | 0 |
| Subsetting (FP-SUB-*) | 227 | FP-SUB-001..008 | 10 | 3 | 0 |
| Combining (FP-COM-*) | 298 | FP-COM-001..004 | 5 | 1 | 0 |
| Existence (FP-EXI-*) | 343 | FP-EXI-001..010 | 12 | 2 | 0 |
| Boolean logic (FP-LOG-*) | 426 | FP-LOG-001..005 | 9 | 0 | 0 |
| Equality (FP-EQ-*) | 501 | FP-EQ-001..005 | 1 | 2 | 2 |
| Comparison (FP-CMP-*) | 533 | FP-CMP-001..003 | 2 | 2 | 1 |
| Math operators (FP-MATH-*) | 558 | FP-MATH-001..007 | 0 | 0 | 8 |
| Collection operators (FP-COL-*) | 573 | FP-COL-001..003 | 0 | 0 | 3 |
| Type operators (FP-TYP-*) | 583 | FP-TYP-001..004 | 1 | 4 | 0 |
| Tree navigation (FP-TREE-*) | 626 | FP-TREE-001, 002 | 2 | 0 | 1 |
| String manipulation (FP-STR-*) | 664 | FP-STR-001..019 | 13 | 2 | 7 |
| Math functions (FP-MATHF-*) | 759 | FP-MATHF-001..010 | 4 | 4 | 0 |
| Conversion (FP-CONV-*) | 804 | FP-CONV-001..017 | 4 | 10 | 3 |
| Utility (FP-UTIL-*) | ~890 | FP-UTIL-001, 002 | 1 | 1 | 0 |
| Environment variables (FP-VAR-*) | — | FP-VAR-001..010 | 1 | 0 | 9 |
| Literals (FP-LIT-*) | — | FP-LIT-001..010 | 0 | 0 | 10 |
| FHIR additions (FP-FHIR-*) | ~970 | FP-FHIR-001..016 | 1 | 1 | 14 |

**Run this suite:**
```bash
pnpm --filter @fhir-dsl/fhirpath test -- spec-compliance
```

---

### `packages/fhirpath/test/spec-gaps.test.ts` (77 lines)

Pure `it.todo` placeholders; lives as the living backlog. Each todo cites a spec section. When the corresponding feature lands, flip to `it(...)` in `spec-compliance.test.ts`.

| Describe block | Line | Rule IDs covered | `it.todo` count |
|---|---:|---|---:|
| arithmetic operators | 29 | FP-MATH-001..005 | 4 |
| bracket indexer | 36 | FP-IDX-001 | 1 |
| environment variables | 40 | FP-VAR-001..010 | 2 |
| FHIR extensions | 45 | FP-FHIR-001..004 | 4 |
| string equivalence | 60 | FP-EQ-003, 004 | 1 |
| $index / $total | 64 | FP-VAR-002, 003 | 1 |
| aggregate() | 68 | FP-AGG-001..005 | 1 |
| UCUM Quantity equality | 72 | FP-MATH-006 | 1 |

**Run this suite:**
```bash
pnpm --filter @fhir-dsl/fhirpath test -- spec-gaps
```

---

### `packages/core/test/search-spec-compliance.test.ts` (558 lines)

| Describe block | Line | Rule IDs covered | Passing (`it`) | Failing-by-design (`test.fails`) | Missing (`it.todo`) |
|---|---:|---|---:|---:|---:|
| Parameter types (SRCH-TYP-*) | 83 | SRCH-TYP-001..009 | 6 | 2 | 0 |
| Prefixes (SRCH-PFX-*) | 147 | SRCH-PFX-001..011 | 10 | 1 | 0 |
| Modifiers (SRCH-MOD-*) | 180 | SRCH-MOD-001..016 | 12 | 1 | 1 |
| Combining values (SRCH-COMB-*) | 232 | SRCH-COMB-001..005 | 2 | 4 | 0 |
| Chained parameters (SRCH-CHAIN-*) | 289 | SRCH-CHAIN-001..003 | 2 | 1 | 0 |
| Reverse-chain (SRCH-HAS-*) | 326 | SRCH-HAS-001, 002 | 2 | 0 | 1 |
| Composites (SRCH-COMP-*) | 351 | SRCH-COMP-001..003 | 1 | 0 | 1 |
| Result control (SRCH-RES-*) | 369 | SRCH-RES-001..008 | 7 | 0 | 0 |
| Include / revinclude (SRCH-INC-*) | 413 | SRCH-INC-001..005 | 3 | 0 | 1 |
| _filter (SRCH-FILT-*) | 436 | SRCH-FILT-001..003 | 1 | 1 | 0 |
| _query (SRCH-QRY-*) | 470 | SRCH-QRY-001, 002 | 1 | 0 | 0 |
| POST _search (SRCH-POST-*) | 482 | SRCH-POST-001..003 | 5 | 0 | 1 |
| URL structure (SRCH-URL-*) | 526 | SRCH-URL-001..004 | 1 | 0 | 3 |
| Metadata params (SRCH-META-*) | 543 | SRCH-META-001..009 | 7 | 0 | 0 |

**Run this suite:**
```bash
pnpm --filter @fhir-dsl/core test -- search-spec-compliance
```

---

### `packages/core/test/search-url-edge-cases.test.ts` (145 lines)

Pins the current (partly-broken) escape behavior so that when the escape-family fix lands (BUG-003), the diff is visible.

| Describe block | Line | Covers |
|---|---:|---|
| prefix emission per operator | 51 | Exhaustive op-prefix emission |
| token value formatting is pass-through | 67 | `system\|code`, `\|code`, `system\|` variants |
| reference value formatting is pass-through | 90 | relative / absolute / urn:uuid references |
| OR via comma | 116 | Array-value joining; includes two `GAP` tests pinning today's unescaped behavior for comma and backslash |

**Note on the `GAP` tests.** Lines 134 and 140 are intentionally passing today (they assert the *current* ambiguous output). When BUG-003 is fixed these tests will fail and must be flipped/updated — the matching `test.fails` lines in `search-spec-compliance.test.ts:272-289` assert the spec-correct output and will start passing.

**Run this suite:**
```bash
pnpm --filter @fhir-dsl/core test -- search-url-edge-cases
```

---

## How to run only the spec-compliance subset

```bash
# Every spec-compliance file across every package
pnpm -r test -- 'spec-compliance|spec-gaps|url-edge-cases'

# Or per package
pnpm --filter @fhir-dsl/fhirpath test -- 'spec-compliance|spec-gaps'
pnpm --filter @fhir-dsl/core     test -- 'spec-compliance|url-edge-cases'
```

When task #9 lands, add:
```bash
pnpm --filter @fhir-dsl/runtime test -- 'spec-compliance'
```

**Expected output today (on `main` at `4f91589`):**
- All `it(...)` pass.
- All `test.fails(...)` fail (Vitest marks these as "expected fail" — green, not red).
- All `it.todo(...)` are skipped with a TODO badge.

A red Vitest run indicates either: (a) a regression in an `it(...)`, or (b) a `test.fails(...)` that now passes (bug was fixed — time to flip it).

---

## Rule-ID → test-file lookup

Maintainer shortcut: "I'm about to change `X`, which spec rules need re-verification?"

| Rule family | Test file |
|---|---|
| FP-* (all FHIRPath rules) | `packages/fhirpath/test/spec-compliance.test.ts`, `packages/fhirpath/test/spec-gaps.test.ts` |
| SRCH-* (all Search rules) | `packages/core/test/search-spec-compliance.test.ts`, `packages/core/test/search-url-edge-cases.test.ts` |
| REST-* / OP-* (all REST + Operations) | **Pending — task #9** |

---

## Status

Task #17's test-suite index is complete against the suites that exist on disk. The `runtime-spec-compliance.test.ts` slot is intentionally left as a placeholder — update this file in place when task #9 lands.
