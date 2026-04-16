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
      // Evaluate criterion against each item in collection
      const criterionResult = collection.length > 0 ? ctx.evaluateSub(op.criterion.ops, collection[0]) : [];

      const isTrue = criterionResult.length === 1 && criterionResult[0] === true;

      if (isTrue) {
        return collection.flatMap((item) => ctx.evaluateSub(op.trueResult.ops, item));
      }
      if (op.otherwiseResult) {
        return collection.flatMap((item) => ctx.evaluateSub(op.otherwiseResult!.ops, item));
      }
      return [];
    }
  }
}
