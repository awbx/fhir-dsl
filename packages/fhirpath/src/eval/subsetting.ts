import type { SubsetOp } from "../ops.js";
import { fhirpathEqual } from "./_internal/equality.js";
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

    // §5.3.6 / §5.3.7: num ≤ 0 is spec-defined. skip(-1) returns the input
    // unchanged; take(-1) returns empty. JS `slice(-n)` wraps from the end,
    // which silently produces nonsense results (skip(-1) → last element).
    case "skip":
      return op.num <= 0 ? [...collection] : collection.slice(op.num);

    case "take":
      return op.num <= 0 ? [] : collection.slice(0, op.num);

    // §5.3.8: intersect() keeps items present in both inputs AND eliminates
    // duplicates in the result. Dedupe is done on the input side while
    // filtering so we preserve first-occurrence order from the left input.
    case "intersect": {
      const otherCollection = _ctx.evaluateSub(op.other.ops, _ctx.rootResource);
      const seen: unknown[] = [];
      return collection.filter((item) => {
        if (!otherCollection.some((other) => fhirpathEqual(item, other))) return false;
        if (seen.some((s) => fhirpathEqual(s, item))) return false;
        seen.push(item);
        return true;
      });
    }

    case "exclude": {
      const otherCollection = _ctx.evaluateSub(op.other.ops, _ctx.rootResource);
      return collection.filter((item) => !otherCollection.some((other) => fhirpathEqual(item, other)));
    }
  }
}
