import type { FilterOp } from "../ops.js";
import type { EvalContext } from "./types.js";

export function evalExistence(
  op: Extract<
    FilterOp,
    {
      type:
        | "exists"
        | "exists_predicate"
        | "all"
        | "allTrue"
        | "anyTrue"
        | "allFalse"
        | "anyFalse"
        | "count"
        | "empty"
        | "distinct"
        | "isDistinct"
        | "subsetOf"
        | "supersetOf";
    }
  >,
  collection: unknown[],
  ctx: EvalContext,
): unknown[] {
  switch (op.type) {
    case "exists":
      return [collection.length > 0];

    case "exists_predicate":
      return [collection.some((item) => isTruthy(ctx.evaluateSub(op.predicate.ops, item)))];

    case "all":
      return [collection.every((item) => isTruthy(ctx.evaluateSub(op.predicate.ops, item)))];

    case "allTrue":
      return [collection.length > 0 && collection.every((item) => item === true)];

    case "anyTrue":
      return [collection.some((item) => item === true)];

    case "allFalse":
      return [collection.length > 0 && collection.every((item) => item === false)];

    case "anyFalse":
      return [collection.some((item) => item === false)];

    case "count":
      return [collection.length];

    case "empty":
      return [collection.length === 0];

    case "distinct": {
      const seen: unknown[] = [];
      return collection.filter((item) => {
        if (seen.some((s) => deepEqual(s, item))) return false;
        seen.push(item);
        return true;
      });
    }

    case "isDistinct": {
      const seen: unknown[] = [];
      for (const item of collection) {
        if (seen.some((s) => deepEqual(s, item))) return [false];
        seen.push(item);
      }
      return [true];
    }

    case "subsetOf": {
      const otherCollection = ctx.evaluateSub(op.other.ops, ctx.rootResource);
      return [collection.every((item) => otherCollection.some((o) => deepEqual(item, o)))];
    }

    case "supersetOf": {
      const otherCollection = ctx.evaluateSub(op.other.ops, ctx.rootResource);
      return [otherCollection.every((item) => collection.some((c) => deepEqual(c, item)))];
    }
  }
}

function isTruthy(result: unknown[]): boolean {
  return result.length === 1 && result[0] === true;
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
