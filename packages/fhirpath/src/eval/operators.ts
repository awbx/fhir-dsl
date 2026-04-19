import type { CompiledPredicate, OperatorOp } from "../ops.js";
import { fhirpathEqual } from "./_internal/equality.js";
import type { EvalContext } from "./types.js";

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
      const left = toSingletonBoolean(collection);
      if (left === false) return [false];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.rootResource));
      if (left === true && right === true) return [true];
      if (right === false) return [false];
      return [];
    }

    case "or": {
      const left = toSingletonBoolean(collection);
      if (left === true) return [true];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.rootResource));
      if (right === true) return [true];
      if (left === false && right === false) return [false];
      return [];
    }

    case "xor": {
      const left = toSingletonBoolean(collection);
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.rootResource));
      if (left == null || right == null) return [];
      return [left !== right];
    }

    case "not": {
      const val = toSingletonBoolean(collection);
      if (val == null) return [];
      return [!val];
    }

    case "implies": {
      const left = toSingletonBoolean(collection);
      if (left === false) return [true];
      const right = toSingletonBoolean(ctx.evaluateSub(op.other.ops, ctx.rootResource));
      if (left === true && right === true) return [true];
      if (right === true) return [true];
      if (left === true && right === false) return [false];
      return [];
    }

    case "is":
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
  if (collection.length !== 1) return [];
  const left = collection[0];

  let right: unknown;
  if (isCompiledPredicate(operand)) {
    const rightCollection = ctx.evaluateSub(operand.ops, ctx.rootResource);
    if (rightCollection.length === 0) return [];
    right = rightCollection[0];
  } else {
    right = operand;
  }

  return [comparator(left, right)];
}

function isCompiledPredicate(value: unknown): value is CompiledPredicate {
  return value != null && typeof value === "object" && "ops" in value && "compiledPath" in value;
}

function toSingletonBoolean(collection: unknown[]): boolean | undefined {
  if (collection.length !== 1) return undefined;
  const val = collection[0];
  if (typeof val === "boolean") return val;
  return undefined;
}

function matchesType(item: unknown, typeName: string): boolean {
  if (item == null) return false;
  switch (typeName) {
    case "string":
    case "String":
      return typeof item === "string";
    case "boolean":
    case "Boolean":
      return typeof item === "boolean";
    case "integer":
    case "Integer":
      return typeof item === "number" && Number.isInteger(item);
    case "decimal":
    case "Decimal":
      return typeof item === "number";
  }
  if (typeof item !== "object") return false;
  if ("resourceType" in (item as Record<string, unknown>)) {
    return (item as Record<string, unknown>).resourceType === typeName;
  }
  return false;
}
