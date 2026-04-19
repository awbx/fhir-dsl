import type { CompiledPredicate, OperatorOp } from "../ops.js";
import { fhirpathEqual } from "./_internal/equality.js";
import { unwrapPrimitive } from "./_internal/primitive-box.js";
import { type EvalContext, FhirPathEvaluationError } from "./types.js";

export function evalOperator(op: OperatorOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "eq":
      return evalComparison(collection, op.value, ctx, fhirpathEqual);

    case "neq":
      return evalComparison(collection, op.value, ctx, (a, b) => !fhirpathEqual(a, b));

    case "lt":
      return evalComparison(collection, op.value, ctx, (a, b) => (a as number) < (b as number));

    case "gt":
      return evalComparison(collection, op.value, ctx, (a, b) => (a as number) > (b as number));

    case "lte":
      return evalComparison(collection, op.value, ctx, (a, b) => (a as number) <= (b as number));

    case "gte":
      return evalComparison(collection, op.value, ctx, (a, b) => (a as number) >= (b as number));

    case "and": {
      const left = toSingletonBoolean(collection, ctx, "and (left)");
      if (left === false) return [false];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.focus), ctx, "and (right)");
      if (left === true && right === true) return [true];
      if (right === false) return [false];
      return [];
    }

    case "or": {
      const left = toSingletonBoolean(collection, ctx, "or (left)");
      if (left === true) return [true];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.focus), ctx, "or (right)");
      if (right === true) return [true];
      if (left === false && right === false) return [false];
      return [];
    }

    case "xor": {
      const left = toSingletonBoolean(collection, ctx, "xor (left)");
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.focus), ctx, "xor (right)");
      if (left == null || right == null) return [];
      return [left !== right];
    }

    case "not": {
      const val = toSingletonBoolean(collection, ctx, "not");
      if (val == null) return [];
      return [!val];
    }

    case "implies": {
      const left = toSingletonBoolean(collection, ctx, "implies (left)");
      if (left === false) return [true];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.focus), ctx, "implies (right)");
      if (left === true && right === true) return [true];
      if (right === true) return [true];
      if (left === true && right === false) return [false];
      return [];
    }

    case "is":
      if (collection.length > 1 && ctx.strict) {
        throw new FhirPathEvaluationError(
          `Singleton evaluation (§4.5): 'is' received ${collection.length} items; expected 0 or 1.`,
        );
      }
      // §6.4: `is` on empty collection returns empty (not [false]).
      if (collection.length === 0) return [];
      return [collection.length === 1 && matchesType(collection[0], op.typeName)];

    case "as":
      return collection.filter((item) => matchesType(item, op.typeName));
  }
}

function evalComparison(
  collection: unknown[],
  operand: unknown,
  ctx: EvalContext,
  comparator: (a: unknown, b: unknown) => boolean,
): unknown[] {
  // §4.5 Singleton Evaluation: empty → empty propagation; multi-element is
  // outside the singleton-eval contract. Lenient default returns [] rather
  // than silently coercing to collection[0] (was a dead-ternary bug).
  if (collection.length > 1 && ctx.strict) {
    throw new FhirPathEvaluationError(
      `Singleton evaluation (§4.5): comparison operand received ${collection.length} items; expected 0 or 1.`,
    );
  }
  if (collection.length !== 1) return [];
  // FP.9: boxed primitives (values carrying `_field` extension metadata)
  // compare on the value-axis only. fhirpathEqual already unwraps; ordering
  // comparators (lt/gt/lte/gte) cast to `number`, which would NaN on a box,
  // so unwrap here.
  const left = unwrapPrimitive(collection[0]);

  let right: unknown;
  if (isCompiledPredicate(operand)) {
    const rightCollection = ctx.evaluateSub(operand.ops, ctx.focus);
    if (rightCollection.length === 0) return [];
    right = unwrapPrimitive(rightCollection[0]);
  } else {
    right = unwrapPrimitive(operand);
  }

  return [comparator(left, right)];
}

function isCompiledPredicate(value: unknown): value is CompiledPredicate {
  return value != null && typeof value === "object" && "ops" in value && "compiledPath" in value;
}

function toSingletonBoolean(collection: unknown[], ctx: EvalContext, where: string): boolean | undefined {
  if (collection.length > 1 && ctx.strict) {
    throw new FhirPathEvaluationError(
      `Singleton evaluation (§4.5): ${where} received ${collection.length} items; expected 0 or 1.`,
    );
  }
  if (collection.length !== 1) return undefined;
  const val = unwrapPrimitive(collection[0]);
  if (typeof val === "boolean") return val;
  return undefined;
}

function matchesType(item: unknown, typeName: string): boolean {
  if (item == null) return false;
  // FP.9: a boxed primitive matches the primitive type of its value.
  const unwrapped = unwrapPrimitive(item);
  switch (typeName) {
    case "string":
    case "String":
      return typeof unwrapped === "string";
    case "boolean":
    case "Boolean":
      return typeof unwrapped === "boolean";
    case "integer":
    case "Integer":
      return typeof unwrapped === "number" && Number.isInteger(unwrapped);
    case "decimal":
    case "Decimal":
      return typeof unwrapped === "number";
  }
  if (typeof item !== "object") return false;
  if ("resourceType" in (item as Record<string, unknown>)) {
    return (item as Record<string, unknown>).resourceType === typeName;
  }
  return false;
}
