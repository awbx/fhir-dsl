import type { PathOp } from "../ops.js";

export interface IterationLocals {
  index: number;
  /**
   * `$total` carries different meanings depending on the iteration frame:
   * in `where`/`select`/`repeat` it is the size of the iterated collection
   * (a number); in `aggregate` it is the running accumulator (any value or
   * collection). `resolveVar` wraps it via FHIRPath collection semantics.
   */
  total: unknown;
}

/** Context passed to eval modules for recursive evaluation */
export interface EvalContext {
  /** The outermost resource — what `%rootResource` resolves to. Preserved
   *  across sub-evaluations so references from inside nested where/select
   *  predicates still see the original input. */
  rootResource: unknown;
  /** The starting resource for the current evaluation frame. Operators
   *  whose right-hand subexpressions are re-rooted against the current item
   *  (and/or/xor/implies, comparison-operand fetches) read from here. Reset
   *  on each sub-evaluation. This is what `%context` and `%resource`
   *  resolve to in the absence of a Bundle. */
  focus: unknown;
  /** User-supplied `%foo` env bag from evaluate({env}). Lookup strips the `%`. */
  env: Readonly<Record<string, unknown>>;
  /** `$index` / `$total` for the current where/select iteration, if any. */
  iterationLocals?: IterationLocals;
  /** Run `ops` with a single-item starting collection `[resource]`. If
   *  `locals` is supplied, they override the context's iterationLocals for
   *  the duration of the sub-evaluation (used by where/select). */
  evaluateSub: (ops: PathOp[], resource: unknown, locals?: IterationLocals) => unknown[];
  /** Run `ops` with an explicit starting collection. Required by operators
   * whose subexpressions operate on the focus as a whole (iif criterion,
   * where the spec says the criterion is evaluated on the input collection
   * rather than per-element). */
  evaluateOps: (ops: PathOp[], startCollection: unknown[]) => unknown[];
  /** Strict mode (§4.5): multi-element singleton-eval throws instead of
   *  silently returning `[]`. Default false (matches HAPI/fhirpath.js/Firely). */
  strict?: boolean;
}

/** Thrown when strict-mode evaluation detects a spec violation. */
export class FhirPathEvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FhirPathEvaluationError";
  }
}
