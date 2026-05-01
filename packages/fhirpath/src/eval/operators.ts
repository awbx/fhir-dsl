import type { CompiledPredicate, OperatorOp } from "../ops.js";
import { fhirpathEqual } from "./_internal/equality.js";
import { unwrapPrimitive } from "./_internal/primitive-box.js";
import { quantityCompare, UcumError } from "./_internal/ucum.js";
import { type EvalContext, FhirPathEvaluationError } from "./types.js";

export function evalOperator(op: OperatorOp, collection: unknown[], ctx: EvalContext): unknown[] {
  switch (op.type) {
    case "eq":
      return evalComparison(collection, op.value, ctx, fhirpathEqual);

    case "neq":
      return evalComparison(collection, op.value, ctx, (a, b) => !fhirpathEqual(a, b));

    case "lt":
      return evalComparison(collection, op.value, ctx, (a, b) => quantityAwareLess(a, b, "<"));

    case "gt":
      return evalComparison(collection, op.value, ctx, (a, b) => quantityAwareLess(b, a, ">"));

    case "lte":
      return evalComparison(collection, op.value, ctx, (a, b) => !quantityAwareLess(b, a, "<="));

    case "gte":
      return evalComparison(collection, op.value, ctx, (a, b) => !quantityAwareLess(a, b, ">="));

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

/**
 * Quantity-aware strict-less. Two same-dimension Quantities are compared
 * by canonical SI value (`5 'mg' < 1 'g'` → true). Plain numbers fall
 * through to `<`. Quantities with parseable but incompatible dimensions,
 * or unparseable units, fall back to numeric `.value` ordering — that's
 * not great but at least doesn't throw on healthy data; tests cover the
 * principled-good cases. Issue #51.
 */
function quantityAwareLess(a: unknown, b: unknown, opName: string): boolean {
  if (isQuantityShape(a) && isQuantityShape(b)) {
    const ua = quantityUnit(a);
    const ub = quantityUnit(b);
    if (ua !== undefined && ub !== undefined) {
      try {
        const sign = quantityCompare({ value: a.value, unit: ua }, { value: b.value, unit: ub });
        if (sign !== null) return sign < 0;
      } catch (err) {
        if (err instanceof UcumError) {
          throw new FhirPathEvaluationError(`${opName} on Quantity: ${err.message}`);
        }
        throw err;
      }
    }
    return (a.value as number) < (b.value as number);
  }
  return (a as number) < (b as number);
}

function isQuantityShape(v: unknown): v is { value: number; unit?: string; code?: string } {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return false;
  if ("resourceType" in v) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.value !== "number") return false;
  return "unit" in obj || "code" in obj || "system" in obj;
}

function quantityUnit(q: { unit?: string; code?: string }): string | undefined {
  if (typeof q.code === "string" && q.code !== "") return q.code;
  if (typeof q.unit === "string" && q.unit !== "") return q.unit;
  return undefined;
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
