import type { PathOp } from "../ops.js";

/** Context passed to eval modules for recursive evaluation */
export interface EvalContext {
  rootResource: unknown;
  /** Run `ops` with a single-item starting collection `[resource]`. */
  evaluateSub: (ops: PathOp[], resource: unknown) => unknown[];
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
