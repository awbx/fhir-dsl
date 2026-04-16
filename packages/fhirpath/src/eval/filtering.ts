import type { FilterOp } from "../ops.js";
import type { EvalContext } from "./types.js";

/** FHIR type name → duck-type check keys */
const TYPE_CHECKS: Record<string, string[]> = {
  Quantity: ["value", "unit"],
  CodeableConcept: ["coding"],
  Coding: ["system", "code"],
  HumanName: ["family", "given"],
  Address: ["city", "line"],
  ContactPoint: ["system", "value"],
  Identifier: ["system", "value"],
  Reference: ["reference"],
  Period: ["start", "end"],
  Range: ["low", "high"],
  Ratio: ["numerator", "denominator"],
  Attachment: ["contentType"],
  Annotation: ["text"],
  Money: ["value", "currency"],
};

export function evalFiltering(
  op: Extract<FilterOp, { type: "where" | "where_simple" | "select" | "repeat" | "ofType" }>,
  collection: unknown[],
  ctx: EvalContext,
): unknown[] {
  switch (op.type) {
    case "where_simple":
      return collection.filter(
        (item) => item != null && typeof item === "object" && (item as Record<string, unknown>)[op.field] === op.value,
      );

    case "where":
      return collection.filter((item) => {
        const result = ctx.evaluateSub(op.predicate.ops, item);
        return result.length === 1 && result[0] === true;
      });

    case "select":
      return collection.flatMap((item) => ctx.evaluateSub(op.projection.ops, item));

    case "repeat": {
      const result: unknown[] = [];
      const seen = new Set<unknown>();
      let current = [...collection];
      while (current.length > 0) {
        const next: unknown[] = [];
        for (const item of current) {
          const projected = ctx.evaluateSub(op.projection.ops, item);
          for (const p of projected) {
            if (!seen.has(p)) {
              seen.add(p);
              result.push(p);
              next.push(p);
            }
          }
        }
        current = next;
      }
      return result;
    }

    case "ofType":
      return collection.filter((item) => matchesType(item, op.typeName));
  }
}

function matchesType(item: unknown, typeName: string): boolean {
  if (item == null) return false;

  // Primitive type checks
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
  const obj = item as Record<string, unknown>;

  // FHIR resource type check
  if ("resourceType" in obj && obj.resourceType === typeName) return true;

  // Duck-type check for complex types
  const checkKeys = TYPE_CHECKS[typeName];
  if (checkKeys) {
    return checkKeys.some((key) => key in obj);
  }

  return false;
}
