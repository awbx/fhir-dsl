# Spec-Challenger Preliminary Hit-List (pre-test)

These are pre-read candidate refutations from `spec-challenger` BEFORE any test-engineer suites landed. They must be formalized into the final challenge docs with (a) quoted spec text, (b) file:line repro, (c) a failing test that proves the refute. Listed here so the signal is not lost if context scrolls.

| # | AUDIT.md target | Candidate finding | Action required |
|---|---|---|---|
| 1 | line 13 — "empty-propagation / three-valued boolean logic implemented correctly" | `toSingletonBoolean` silently returns `undefined` for multi-element collections; per §5.5 singleton evaluation this should ERROR | Verify against spec §5.5 exact text; construct a 3-element collection and show evaluator output |
| 2 | line 46 — "Empty-propagation on comparison operators spec-compliant" | `evalComparison` uses JS `===`; breaks for Quantity equality, partial-precision Date (§5.6.1 requires `{}` not `false` for precision mismatch) | Trace `evalComparison` file:line; write failing test comparing partial dates `@2023` vs `@2023-05` |
| 3 | line 80 — "Auto POST switch above ~1900 chars" | Threshold is `.length` (UTF-16 code units), not bytes; measures form body even on GET path | Verify actual code constant + what it measures; test with multi-byte Unicode crossing byte vs char-count boundary |
| 4 | line 83 — "Pagination correctly walks Bundle.link[rel=next]" | No host validation on nextLink.url; passes directly to fetch | Document security implication; spec allows cross-host but server configs may not; not a strict refute |
| 5 | line 84 — "Composite params correctly join with $" | `Object.values(...).join("$")` with no escape for literal `$` in component values | Find file:line; write test with value containing `$` |
| 6 | line 62 — "OR values: commas in literal values not escaped" | AUDIT already flags as bug; spec-challenger confirms from static reading of `search-query-builder.ts:146` | Already a known bug — test should lock down the fix contract |
| 7 | Not in AUDIT.md | `convertToBoolean` / `convertToInteger` violate §5.1 conversion rules (missing "t"/"T"/"yes"; parseInt accepts "12.5" → 12 instead of empty) | Cite §5.1 text exactly; write failing conversion tests |

**Status:** preliminary. Each row becomes one entry in `audit/challenge/fhirpath-challenge.md` or `audit/challenge/rest-challenge.md` once test-engineer's suites exist.
