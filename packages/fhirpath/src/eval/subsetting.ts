import type { SubsetOp } from "../ops.js";
import type { EvalContext } from "./types.js";

export function evalSubsetting(op: SubsetOp, collection: unknown[], _ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "first":
      return collection.length > 0 ? [collection[0]!] : [];

    case "last":
      return collection.length > 0 ? [collection[collection.length - 1]!] : [];

    case "single":
      if (collection.length > 1) {
        throw new Error(`single() expected at most one element, got ${collection.length}`);
      }
      return collection.length === 1 ? [collection[0]!] : [];

    case "tail":
      return collection.slice(1);

    case "skip":
      return collection.slice(op.num);

    case "take":
      return collection.slice(0, op.num);

    case "intersect": {
      const otherCollection = _ctx.evaluateSub(op.other.ops, _ctx.rootResource);
      return collection.filter((item) => otherCollection.some((other) => deepEqual(item, other)));
    }

    case "exclude": {
      const otherCollection = _ctx.evaluateSub(op.other.ops, _ctx.rootResource);
      return collection.filter((item) => !otherCollection.some((other) => deepEqual(item, other)));
    }
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
