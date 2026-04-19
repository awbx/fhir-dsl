import type { ArithmeticOp } from "../ops.js";
import type { EvalContext } from "./types.js";

// FHIRPath N1 §6.6: binary arithmetic operators are singleton-only. If either
// operand is empty or not a singleton of the expected primitive, the result is
// empty (`[]`). Division or modulo by zero is also empty.
export function evalArithmetic(op: ArithmeticOp, collection: unknown[], ctx: EvalContext): unknown[] {
  const left = collection;
  const right = ctx.evaluateOps(op.other.ops, [ctx.rootResource]);

  // §6.6.4: `&` treats empty as "" rather than propagating empty.
  if (op.type === "concat") {
    const as = singletonToString(left);
    const bs = singletonToString(right);
    if (as === undefined || bs === undefined) return [];
    return [as + bs];
  }

  if (left.length !== 1 || right.length !== 1) return [];
  const a = left[0];
  const b = right[0];
  switch (op.type) {
    case "add":
      return typeof a === "number" && typeof b === "number" ? [a + b] : [];

    case "subtract":
      return typeof a === "number" && typeof b === "number" ? [a - b] : [];

    case "multiply":
      return typeof a === "number" && typeof b === "number" ? [a * b] : [];

    case "divide":
      if (typeof a !== "number" || typeof b !== "number" || b === 0) return [];
      return [a / b];

    case "divTrunc":
      if (typeof a !== "number" || typeof b !== "number" || b === 0) return [];
      return [Math.trunc(a / b)];

    case "mod":
      if (typeof a !== "number" || typeof b !== "number" || b === 0) return [];
      return [a % b];

    case "concat":
      // Handled above with empty-coercion semantics.
      return [];
  }
}

function singletonToString(coll: unknown[]): string | undefined {
  if (coll.length === 0) return "";
  if (coll.length > 1) return undefined;
  const v = coll[0];
  if (typeof v === "string") return v;
  if (v == null) return "";
  return undefined;
}
