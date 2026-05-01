# Performance baseline — v1.0.0

These numbers are the v1 floor. CI does not yet enforce them, but
regressions here should be treated as bugs. Re-run after any change
that touches the generator, the native validator, or the FHIRPath
proxy / evaluator.

## How to run

```bash
node scripts/perf-baseline.mjs
```

Requires Node 22+ (`--experimental-strip-types`). The script invokes a
child process for the validator bench so it can import the generator's
TypeScript template directly.

## v1.0.0 numbers

Captured on `darwin arm64`, Node v22.17.0, warm cache.

| Signal | Result | Target | Headroom |
|---|---|---|---|
| Generator end-to-end (R4 + US Core 6.1.0, warm cache) | **221 ms** | under 30 s | 136× |
| 1000-resource Bundle validation (Patient-shape native schema) | **1.7 ms** | under 100 ms | 58× |
| FHIRPath `Patient.name.family` × 10 000 evaluates | **5.8 ms** | under 500 ms | 86× |

## What's measured, what isn't

**Generator.** The end-to-end run from cached StructureDefinition + IG
through to type emission for 146 resources, 49 profiles, and 10
extensions. Cold-cache numbers depend on network and registry state;
they are not a stability floor and are not captured here.

**Bundle validation.** The native Standard Schema runtime is the
default validator emitted by `fhir-gen --validator native`. The bench
shape is a Patient with `id`, `birthDate`, and `name[]` (HumanName
entries with `use`/`family`/`given`) — representative of the typical
hot path and roughly the average resource shape. zod-emitted
validators run roughly 3-5× slower; if you've chosen `--validator zod`,
budget accordingly.

**FHIRPath evaluation.** Single-property nav (`Patient.name.family`)
is the most common pattern by a wide margin. Heavier expressions
(deeply chained `where()`, aggregates, `descendants()`) are not
covered by this floor — they are O(n) over the resource graph and
should be measured per-expression.

## Regression policy

- A regression beyond 2× any baseline number on this hardware blocks
  the next minor release until investigated.
- Hardware variability (CI runners, M-series vs. x86) is real;
  comparisons should re-run the baseline locally rather than trust
  absolute milliseconds across machines.
- A regression accompanied by a feature that explains it (new
  per-property invariants, deeper schema graphs) is acceptable if
  documented in the CHANGELOG.

## Methodology notes

- Each bench warms with at least 100 iterations before the timed run
  to avoid v8 inlining noise on the first call.
- The generator bench runs against a populated `.cache/r4/` so we
  measure transformation cost, not network / disk fetch.
- All three benches run in-process to keep startup costs out of the
  numbers (with the exception of the validator bench, which uses a
  child process for the TS-strip-types boundary).
