import type { CombineOp } from "../ops.js";
import type { EvalContext } from "./types.js";

export function evalCombining(op: CombineOp, collection: unknown[], ctx: EvalContext): unknown[] {
  const otherCollection = ctx.evaluateSub(op.other.ops, ctx.focus);

  switch (op.type) {
    case "union": {
      // Union: merge and deduplicate
      const result = [...collection];
      for (const item of otherCollection) {
        if (!result.some((existing) => deepEqual(existing, item))) {
          result.push(item);
        }
      }
      return result;
    }

    case "combine":
      // Combine: merge without deduplication
      return [...collection, ...otherCollection];
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object") return false;
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}
