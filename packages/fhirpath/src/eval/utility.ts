import type { UtilityOp } from "../ops.js";
import type { EvalContext } from "./types.js";

export function evalUtility(op: UtilityOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "trace":
      // Per spec: returns the input collection unchanged, logs to environment
      console.debug(`[FHIRPath trace] ${op.name}:`, collection);
      return collection;

    case "now":
      return [new Date().toISOString()];

    case "timeOfDay": {
      const now = new Date();
      return [
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`,
      ];
    }

    case "today":
      return [new Date().toISOString().slice(0, 10)];

    case "iif": {
      // §5.9.3 / §6.3.1: criterion is evaluated ONCE against the input
      // collection (not per-element, not just collection[0]) and must yield
      // a singleton boolean. The chosen branch is likewise evaluated ONCE
      // against the same input collection — no per-element broadcast.
      const criterionResult = ctx.evaluateOps(op.criterion.ops, collection);
      const isTrue = criterionResult.length === 1 && criterionResult[0] === true;
      if (isTrue) return ctx.evaluateOps(op.trueResult.ops, collection);
      if (op.otherwiseResult) return ctx.evaluateOps(op.otherwiseResult.ops, collection);
      return [];
    }
  }
}
