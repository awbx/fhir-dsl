import type { PathOp } from "../ops.js";

/** Context passed to eval modules for recursive evaluation */
export interface EvalContext {
  rootResource: unknown;
  evaluateSub: (ops: PathOp[], resource: unknown) => unknown[];
}
