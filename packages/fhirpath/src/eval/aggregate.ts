import type { AggregateOp } from "../ops.js";
import type { EvalContext } from "./types.js";

// FHIRPath N1 §5.3: `aggregate(aggregator, init?)` walks the input collection
// and threads `$total` (accumulator, starts as init or `{}`) plus `$index`
// through the aggregator, returning the final $total. `sum`/`min`/`max`/`avg`
// are STU numeric conveniences — per §5.3.1 they evaluate to empty when the
// collection is empty OR contains any non-numeric element.
export function evalAggregate(op: AggregateOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "aggregate": {
      // init is evaluated once against the current focus; absent init starts
      // the accumulator at `{}` (empty collection).
      let total: unknown[] = op.init ? ctx.evaluateOps(op.init.ops, [ctx.focus]) : [];
      collection.forEach((item, index) => {
        // `$total` binds to the *collection* value of the accumulator so a
        // multi-valued accumulator round-trips; `$index` is 0-based.
        total = ctx.evaluateSub(op.aggregator.ops, item, { index, total });
      });
      return total;
    }
    case "sum": {
      const nums = toNumbers(collection);
      if (nums === undefined) return [];
      return [nums.reduce((a, b) => a + b, 0)];
    }
    case "min": {
      const nums = toNumbers(collection);
      if (nums === undefined) return [];
      return [Math.min(...nums)];
    }
    case "max": {
      const nums = toNumbers(collection);
      if (nums === undefined) return [];
      return [Math.max(...nums)];
    }
    case "avg": {
      const nums = toNumbers(collection);
      if (nums === undefined) return [];
      return [nums.reduce((a, b) => a + b, 0) / nums.length];
    }
  }
}

function toNumbers(collection: unknown[]): number[] | undefined {
  if (collection.length === 0) return undefined;
  const out: number[] = [];
  for (const v of collection) {
    if (typeof v !== "number") return undefined;
    out.push(v);
  }
  return out;
}
