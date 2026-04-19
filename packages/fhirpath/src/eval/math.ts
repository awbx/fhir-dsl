import type { MathOp } from "../ops.js";
import { unwrapPrimitive } from "./_internal/primitive-box.js";

export function evalMath(op: MathOp, collection: unknown[]): unknown[] {
  // FP.9: unbox primitive carriers so math ops see the numeric value.
  collection = collection.map(unwrapPrimitive);
  switch (op.type) {
    case "abs":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.abs(item)] : []));

    case "ceiling":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.ceil(item)] : []));

    case "exp":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.exp(item)] : []));

    case "floor":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.floor(item)] : []));

    case "ln":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.log(item)] : []));

    case "log":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.log(item) / Math.log(op.base)] : []));

    case "power":
      return collection.flatMap((item) => (typeof item === "number" ? [item ** op.exponent] : []));

    case "round":
      return collection.flatMap((item) => {
        if (typeof item !== "number") return [];
        const factor = 10 ** (op.precision ?? 0);
        return [Math.round(item * factor) / factor];
      });

    case "sqrt":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.sqrt(item)] : []));

    case "truncate":
      return collection.flatMap((item) => (typeof item === "number" ? [Math.trunc(item)] : []));
  }
}
