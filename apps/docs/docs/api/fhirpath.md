---
sidebar_position: 3
title: "@fhir-dsl/fhirpath"
description: "Proxy-based typed FHIRPath DSL with an AST evaluator — builds expressions, compiles to strings, evaluates against resources."
---

# @fhir-dsl/fhirpath

## Overview
`@fhir-dsl/fhirpath` is a JavaScript `Proxy`-backed FHIRPath builder. Property access on the proxy either navigates (`expr.name` → `Patient.name`), invokes a known function (`expr.name.where(...)`), or terminates (`.compile()` → string, hidden symbol → `PathOp[]`). The same proxy class backs both standalone expressions and predicate callbacks, so arithmetic and logical operators are interchangeable between contexts. The `evaluate()` function walks the AST and runs it against a resource.

## Installation
```bash
npm install @fhir-dsl/fhirpath
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `fhirpath` | function | Root builder factory: `fhirpath<Patient>("Patient")` returns a typed `FhirPathExpr`. |
| `$context` / `$resource` / `$rootResource` / `$ucum` / `$index` / `$total` | const | Pre-made variable proxies for FHIRPath environment names. |
| `envVar` | function | Build a `FhirPathExpr` for a user-supplied `%foo` env var. |
| `evaluate` | function | Evaluate a compiled op-list against a resource, returning a collection. |
| `EvalOptions` | interface | `{ strict?, env? }` — passed to `evaluate()`. |
| `FhirPathEvaluationError` | class | Raised on invalid `$this`, unknown env vars, strict-mode singleton failures, etc. |
| `createPredicateProxy` | function | Build a proxy that records predicate ops for later extraction. |
| `extractPredicate` | function | Pull the `CompiledPredicate` back out of a predicate proxy. |
| `PREDICATE_SYMBOL` | const | `Symbol.for("fhirpath.predicate")` — the hidden key used on predicate proxies. |
| `PathOp` / `NavOp` / `FilterOp` / `SubsetOp` / `CombineOp` / `StringOp` / `MathOp` / `ArithmeticOp` / `ConversionOp` / `UtilityOp` / `OperatorOp` / `LiteralOp` / `VarOp` / `FhirFnOp` / `AggregateOp` / `CompiledPredicate` | type | Discriminated unions for the op AST. |
| `FhirPathExpr` / `FhirPathOps` / `FhirPathPredicate` / `PredicateOps` / `FhirPathResource` / `FhirTypeMap` / `IsPrimitive` / `NavKeys` / `Unwrap` | type | Builder-side type machinery. |

## API

### `fhirpath`
**Signature**
```ts
function fhirpath<T extends FhirPathResource>(resourceType: string): FhirPathExpr<T>;
```
**Parameters**
- `resourceType` — The root resource type (e.g. `"Patient"`). Prepended to every compiled path.
- Type parameter `T` — The resource type (or any shape) the builder navigates over.

**Returns** — A `FhirPathExpr<T>` proxy. Access fields by property, call functions, or terminate with `.compile()`.

**Example**
```ts
import { fhirpath } from "@fhir-dsl/fhirpath";

const expr = fhirpath<Patient>("Patient")
  .name
  .where(($this) => $this.use.eq("official"))
  .given
  .first();

expr.compile();
// → "Patient.name.where(use = 'official').given.first()"
```

**Notes**
- The proxy returns `undefined` for the `then` property — this defeats accidental thenable detection if an expression is awaited.
- `toJSON()` and `toString()` both return the compiled path, so expressions serialise cleanly when embedded in JSON queries.

---

### Environment variables — `$context`, `$resource`, `$rootResource`, `$ucum`, `$index`, `$total`, `envVar`
**Signature**
```ts
const $context: FhirPathExpr<unknown>;      // %context
const $resource: FhirPathExpr<unknown>;     // %resource
const $rootResource: FhirPathExpr<unknown>; // %rootResource
const $ucum: FhirPathExpr<string>;          // %ucum  (hardcoded to "http://unitsofmeasure.org")
const $index: FhirPathExpr<number>;         // $index (iteration)
const $total: FhirPathExpr<number>;         // $total (dual semantics — see notes)

function envVar<T = unknown>(name: string): FhirPathExpr<T>;
```
**Example**
```ts
import { fhirpath, $this, $total, $ucum, envVar } from "@fhir-dsl/fhirpath";

// Arithmetic inside aggregate — $this and $total are predicate-proxies that
// support arithmetic operators. `$this.add($total)` compiles to "$this + $total".
const sum = fhirpath<Observation>("Observation")
  .valueQuantity.value
  .aggregate(($this, $total) => $this.add($total), 0);

// User env bag — envVar(name) resolves from options.env at evaluate() time.
const cutoff = envVar<string>("cutoff");
```

**Notes**
- **`%ucum` is hardcoded** to `http://unitsofmeasure.org`; no env entry is needed.
- **`$total` has dual semantics** — inside `where`/`select`/`repeat` it's a number (the collection size); inside `aggregate()` it's the accumulator collection. The evaluator wraps appropriately.
- **Env bag accepts keys with or without `%`.** `{ foo: 42 }` and `{ "%foo": 42 }` both resolve for `%foo`. Unknown env vars raise `FhirPathEvaluationError`.
- **Hidden `Symbol.for("fhirpath.ops")`** on the root expression exposes the op list — used by the core query builder to embed FHIRPath predicates into `_filter`.

---

### `evaluate` / `EvalOptions` / `FhirPathEvaluationError`
**Signature**
```ts
function evaluate(ops: PathOp[], resource: unknown, options?: EvalOptions): unknown[];

interface EvalOptions {
  strict?: boolean;                                   // raise on §4.5 singleton failures instead of returning []
  env?: Readonly<Record<string, unknown>>;            // %foo / foo — either form works
}

class FhirPathEvaluationError extends Error {}
```
**Parameters**
- `ops` — the AST extracted from a builder via the hidden `Symbol.for("fhirpath.ops")`.
- `resource` — the resource to evaluate against; it also becomes the root of `%context`, `%resource`, and `%rootResource`.
- `options.strict` — when `true`, multi-element inputs passed to a singleton-context operator throw instead of returning an empty collection.
- `options.env` — bag for user-supplied `%foo` / `foo` lookups.

**Returns** — A collection (always an array, possibly empty).

**Example**
```ts
import { fhirpath, evaluate } from "@fhir-dsl/fhirpath";

const patient = { resourceType: "Patient", name: [{ use: "official", given: ["Jane"], family: "Doe" }] };
const expr = fhirpath<Patient>("Patient").name.where(($) => $.use.eq("official")).given;
const ops = (expr as any)[Symbol.for("fhirpath.ops")] as PathOp[];
evaluate(ops, patient); // → ["Jane"]
```

**Notes** — `$this` cannot be evaluated via a bare `VarOp` outside a predicate proxy; always build predicates with `createPredicateProxy`. `$index` and `$total` are only defined inside iteration frames — outside, they throw `FhirPathEvaluationError`.

---

### `_field` primitive-sibling extensions
**Behavior** — The FHIRPath evaluator and proxy understand FHIR's primitive-extension convention: `Patient._active` resolves to `Patient.active.extension[]` (the sibling-key pattern from FHIR R4 §2.1.0.2.1). Both builder navigation and the evaluator respect this, so you can write `fhirpath<Patient>("Patient")._active.extension.where(...)` and get the underlying extension array.

**Example**
```ts
const extExpr = fhirpath<Patient>("Patient")._active.extension.where(($) => $.url.eq("http://example.org/reason"));
extExpr.compile(); // → "Patient._active.extension.where(url = 'http://example.org/reason')"
```

---

### `createPredicateProxy` / `extractPredicate` / `PREDICATE_SYMBOL`
**Signature**
```ts
function createPredicateProxy(path: string, ops: PathOp[]): unknown;
function extractPredicate(proxy: unknown): CompiledPredicate;
const PREDICATE_SYMBOL: unique symbol; // Symbol.for("fhirpath.predicate")

interface CompiledPredicate { ops: PathOp[]; compiledPath: string; }
```
**Example**
```ts
import { createPredicateProxy, extractPredicate } from "@fhir-dsl/fhirpath";

const $this = createPredicateProxy("$this", []);
const predicate = extractPredicate(($this as any).use.eq("official"));
// predicate.compiledPath === "$this.use = 'official'"
```

**Notes** — Used by `fhirpath()` internally so that `.where(cb)` callbacks produce the same AST shape as standalone builders. The predicate proxy mirrors the `ARITHMETIC_OPS` table so `$this.add($total)` works inside `aggregate()`.
