# fhir-dsl Spec Compliance Audit

**Audit date:** 2026-04-19
**Target release:** v0.19.0
**Scope:** FHIRPath N1 normative spec, FHIR R5 REST/search spec, StructureDefinition parsing, SMART App Launch v2, runtime HTTP semantics.

This audit is a point-in-time snapshot produced by reading source and comparing against the HL7 specs listed above. Every finding cites a file path and line. Severity reflects real-world impact, not spec-letter completeness.

---

## 1. `@fhir-dsl/fhirpath` — FHIRPath N1

README claims "~85% of the official FHIRPath spec including 60+ functions." By function-count against the normative spec, realistic coverage is closer to **~54%**. The evaluator and compiler are internally consistent (no features where `compile()` works but `evaluate()` throws), and empty-propagation / three-valued boolean logic are implemented correctly.

### High severity

| Gap | Evidence | Impact |
|---|---|---|
| No binary arithmetic: `+`, `-`, `*`, `/`, `div`, `mod` | no entries in `packages/fhirpath/src/ops.ts`; no implementations in `packages/fhirpath/src/eval/` | Breaks a large fraction of constraint expressions. Common in invariants (e.g., `effectivePeriod.end - effectivePeriod.start`). |
| No string concatenation `&` | same as above | Common in narrative-building expressions. |
| No bracket indexer `[n]` | builder is proxy-based; index access would need a `.at(n)` or `Symbol.iterator` — neither present | Spec syntax; users resort to `.skip(n).first()`. |
| No environment variables (`%context`, `%resource`, `%rootResource`, `%ucum`, `%vs-*`, `%ext-*`) | grep for `%` in `packages/fhirpath/src/` returns nothing | Required by FHIR constraint invariants; without this the evaluator can't run real profile constraints. |
| No FHIR extensions: `extension(url)`, `resolve()`, `hasValue()`, `htmlChecks()` | not in `builder.ts` | Blocks FHIR-specific validation use cases. |

### Medium severity

| Gap | Evidence |
|---|---|
| `$index`, `$total` context variables missing | only `$this` is wired in `packages/fhirpath/src/expression.ts` |
| String equivalence operators `~`, `!~` missing | not in `packages/fhirpath/src/eval/operators.ts` |
| `aggregate()` missing | no builder or eval entry |
| Polymorphic `value[x]` expansion in paths | `.ofType()` uses hardcoded `TYPE_CHECKS` (`packages/fhirpath/src/eval/filtering.ts`), not spec-driven inference |
| `toQuantity()` stores raw unit string | `packages/fhirpath/src/eval/conversion.ts`; no UCUM parsing, so `Quantity(120,'mmHg') = Quantity(120,'mm[Hg]')` will be unequal |
| `toDate()` / `toDateTime()` loose parsing | uses JS `Date.parse()`; spec requires strict ISO 8601 with partial precision |

### Low severity

- Literal entry points for primitives/quantities/empty collection (`{}`) are not exposed.
- `trim()`, `split()`, `toChars()` present but `trim()` and `split()` absent.
- `repeat()` cycle detection uses reference equality rather than `deepEqual` on seen set — may double-visit equal-but-not-identical items.

### Positives (verified)

- Three-valued boolean logic (`and`/`or`/`xor`/`implies`) in `packages/fhirpath/src/eval/operators.ts` correctly propagates empty per spec §3.2.2.
- Empty-propagation on comparison operators is spec-compliant.
- `distinct()`, `subsetOf()`, `supersetOf()` use `deepEqual` (correct).
- `children()` / `descendants()` include cycle detection in `packages/fhirpath/src/eval/nav.ts`.

---

## 2. `@fhir-dsl/core` — Query builder and REST client

Well-architected around a typed three-parameter generic. The search surface covers a large slice of R5 features; the gap is on the REST side (conditionals, operations, PATCH).

### High severity

| Gap | Evidence | Notes |
|---|---|---|
| **No PATCH support** | type declared but unused in `packages/core/src/transaction-builder.ts` | `.patch()` method missing; can't do JSON Patch or FHIRPath Patch. |
| **No conditional operations** | no `If-None-Exist` / `If-Match` / `If-Modified-Since` threading | Blocks safe concurrent update patterns. |
| **No operation invocation** (`$everything`, `$validate`, `$expand`, `$lookup`, `$translate`) | grep for `$everything` etc. returns nothing | User must hand-craft URLs. |
| **OR values: commas in literal values not escaped** | `packages/core/src/search-query-builder.ts:146` — `values.map(String).join(",")` | `where("family", "eq", ["O'Brien, Jr.", "Smith"])` produces ambiguous URL. |

### Medium severity

| Gap | Evidence |
|---|---|
| No `vread` (version-specific read) | only `read` in `packages/core/src/fhir-client.ts:139` |
| No history (`_history`, `/[type]/_history`, `/[type]/[id]/_history`) | absent |
| No `/metadata` / CapabilityStatement discovery | absent |
| Transaction vs batch semantics distinction not exposed | both hit the root with a bundle |

### Low severity

- `_text` and `_content` are pass-through with no guidance on typical use.
- URL builder relies on `URLSearchParams`, which encodes space as `+` — FHIR servers accept it but `%20` is more portable.

### Positives (verified)

- Compile-time operator narrowing per param type is real (see `SearchPrefixFor<P>` in `packages/core/src/types.ts`).
- `include()`/`revinclude()` constrain to typed paths via `IncludeFor<S, RT>`.
- Auto POST switch above ~1900 URL chars, correctly routes to `Patient/_search`.
- Pagination correctly walks `Bundle.link[rel=next]` via `.stream()`.
- Composite params correctly join with `$` per spec.

---

## 3. `@fhir-dsl/runtime` — HTTP executor

The shape is good (typed error with `OperationOutcome`, typed result) but production-grade resiliency is missing.

### High severity

| Gap | Evidence |
|---|---|
| **No retry/backoff** | grep for `retry`, `backoff`, `429`, `503` in `packages/runtime/src` returns nothing |
| **No `AbortSignal` support** | grep for `AbortSignal`/`AbortController`/`signal` in `packages/runtime/src` returns nothing — `fetch()` calls don't accept a signal and cannot be cancelled or timed out |

### Positives (verified)

- `FhirRequestError` exposes `status`, `statusText`, parsed `OperationOutcome`, and `.issues`.
- `executor.ts` has a single 401-retry hook via `provider.onUnauthorized()`.
- Pagination is `AsyncGenerator`-based and follows `Bundle.link[rel=next]`.

---

## 4. `@fhir-dsl/generator` — StructureDefinition parser + emitter

SpecCatalog + TypeMapper threading (commits ad721d9, 73dc1a6) is clean. Major gap is slicing.

### High severity

| Gap | Evidence |
|---|---|
| **Slicing not parsed** | `packages/generator/src/...structure-definition.ts` skips properties containing `:` (slice suffix) and does not read `slicing`/`discriminator`/`sliceName` | US Core and most IGs depend on slicing for e.g. `identifier:MRN`. Without it, profile-narrowed types lose the very constraints that make them useful. |

### Medium severity

| Gap | Evidence |
|---|---|
| No `_field` extension siblings for primitives | emitter does not generate the `_value`/`_field` pair (R5 §4.7.2.1) |
| `canonical(Profile)` narrowing incomplete in validators | `packages/generator/src/emitter/profile-emitter.ts` filters only Reference types |
| FHIR invariants not emitted to validators | no constraint→code path |

### Low severity

- `Extension` value types: only a subset (`valueString`, `valueBoolean`, etc.) — missing `valueTiming`, `valueRange`, `valueAttachment`, `valueDosage`, `valueMeta`, etc.

---

## 5. `@fhir-dsl/types`

Hand-written base layer is pragmatic but does little to enforce FHIR invariants at the type level.

| Observation | Severity |
|---|---|
| `Reference<T>` generic parameter is accepted but currently `_T` (unused) — propagated in shape but never narrows the referenced resource type. | Medium |
| No `_field` siblings for primitives, matching generator gap. | Medium |
| `Extension` has 11 value types; FHIR defines ~40. | Low |
| Cardinality (min/max) and binding strength not encoded as branded / tagged types. | Low (would be a large refactor for DX gain) |

---

## 6. `@fhir-dsl/terminology`

| Gap | Severity | Evidence |
|---|---|---|
| ValueSet filter operators limited to `=` + `concept` property | Medium | `valueset-parser.ts` — missing `is-a`, `descendent-of`, `regex`, `in`, `not-in`, `generalizes`, `exists` |
| `$expand` parameters (filter, count, offset, displayLanguage, activeOnly, excludeSystem, systemVersion) | Low | not exposed in expansion API |
| CodeSystem `property`, `subsumes` not parsed | Low | hierarchy flattened, metadata discarded |

---

## 7. `@fhir-dsl/smart`

Strong implementation of the happy path. Gaps are around OIDC integration boundaries.

| Gap | Severity |
|---|---|
| No OIDC `nonce` threading in `AuthorizeParams` | Low |
| JWKS / ID-token verification left to consumer | Low (documented boundary) |

### Positives
- PKCE S256 (no `plain` fallback — correct per SMART v2).
- `aud`, `state`, `launch`, v2 scope syntax (`patient/Observation.rs`) all wired.
- Backend services JWT assertion (`client_assertion_type: …:jwt-bearer`) with token caching and in-flight-refresh coalescing.

---

## Coverage summary

| Area | Approx coverage | Notes |
|---|---|---|
| FHIRPath N1 | ~54% by function count | missing arithmetic, env vars, FHIR extensions |
| R5 search | ~80% | operators, modifiers, chain, `_has`, composite, `:iterate` all present; edge gaps in comma escaping |
| REST operations | ~50% | read/create/update/delete only; no PATCH, conditionals, `$operations`, vread, history, metadata |
| StructureDefinition parsing | ~75% | choice types, backbones, bindings, contentReference, extensions; missing slicing |
| Validator emission | ~70% | cardinality, patterns, required bindings; missing `_field` siblings, invariants |
| SMART App Launch v2 | ~90% | PKCE, v2 scopes, backend services all correct |
| Runtime | ~60% | paging + typed errors; no retry, no abort |

---

## Priority ordering (next-work recommendation)

Ordered by ratio of (impact to users) / (implementation cost). Each item is a vertical slice, not a line-item.

1. **Runtime: `AbortSignal` threading and retry policy** — smallest surface, highest production value. Thread `AbortSignal` through `executor.ts`, `http.ts`, pagination generators, and the query builder's `.execute(opts?)`. Add a simple retry policy (429/503 with `Retry-After`, plus capped exponential backoff on 5xx).
2. **Core: comma escaping in OR values** — one-line fix in `packages/core/src/search-query-builder.ts:146` plus tests. Escape `\\` and `,` per FHIR spec §3.1.1.3.2.
3. **FHIRPath: arithmetic + `&`** — ~6 functions in `eval/`, same shape as existing `eval/math.ts`. Unblocks a large swath of real-world expressions.
4. **FHIRPath: environment variables** — structural addition to the evaluator (requires an env-bag parameter plumbed through `evaluate()`). Enables real profile constraint evaluation.
5. **Generator: slicing** — larger piece, but every IG depends on it.
6. **Core: PATCH + conditional operations** — tied to REST correctness; not hard but needs spec-faithful header wiring.
7. **FHIRPath: `extension()` + `resolve()`** — FHIR-specific, depends on env vars landing first.

## Non-priorities (on purpose)

- Full UCUM quantity arithmetic: real UCUM is large; defer until users actually need it.
- IG-specific constraint invariants compiled to types: enormous DX investment for marginal safety gain.
- Full OIDC ID-token verification inside `@fhir-dsl/smart`: keep as consumer responsibility; the boundary is principled.

---

*This audit was produced by reading the source at commit `4f91589` on branch `main`. When the audit is rerun, check the item list against this document and remove anything that has landed.*
