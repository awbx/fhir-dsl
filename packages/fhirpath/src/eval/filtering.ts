import type { FilterOp } from "../ops.js";
import type { EvalContext } from "./types.js";

/**
 * FHIR type name → required-key list. Matching requires ALL listed keys to be
 * present (previously `.some()` which was far too permissive — a Coding with
 * just `system` was duck-matched as Identifier).
 *
 * Some FHIR compound types share signatures (Identifier and ContactPoint both
 * carry `system`+`value`). `matchesType` applies a small set of disambiguators
 * below so the common false-positives stop firing; edge cases that can't be
 * told apart structurally (a bare `{system:"foo",value:"bar"}`) fall back to
 * returning true for any matching type — same as today, just less broadly.
 */
const TYPE_CHECKS: Record<string, string[]> = {
  Quantity: ["value"], // + disambiguator below
  CodeableConcept: ["coding"],
  Coding: ["code"], // + disambiguator: must NOT have "coding"
  HumanName: ["family"],
  Address: ["line"],
  ContactPoint: ["system", "value"], // + disambiguator: system is a short enum, not a URI
  Identifier: ["system", "value"], // + disambiguator: system is a URI, OR has assigner/type
  Reference: ["reference"],
  Period: ["start"],
  Range: ["low"],
  Ratio: ["numerator", "denominator"],
  Attachment: ["contentType"],
  Annotation: ["text"],
  Money: ["value", "currency"],
};

const CONTACT_POINT_SYSTEMS = new Set(["phone", "fax", "email", "pager", "url", "sms", "other"]);

function systemLooksLikeUri(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.includes("://") || value.startsWith("urn:");
}

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

    case "where": {
      const total = collection.length;
      return collection.filter((item, index) => {
        const result = ctx.evaluateSub(op.predicate.ops, item, { index, total });
        return result.length === 1 && result[0] === true;
      });
    }

    case "select": {
      const total = collection.length;
      return collection.flatMap((item, index) => ctx.evaluateSub(op.projection.ops, item, { index, total }));
    }

    case "repeat": {
      const result: unknown[] = [];
      const seen = new Set<unknown>();
      let current = [...collection];
      while (current.length > 0) {
        const next: unknown[] = [];
        const total = current.length;
        for (let index = 0; index < current.length; index++) {
          const item = current[index];
          const projected = ctx.evaluateSub(op.projection.ops, item, { index, total });
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
  // Resources with a different resourceType cannot duck-match a compound type.
  if ("resourceType" in obj) return false;

  const checkKeys = TYPE_CHECKS[typeName];
  if (!checkKeys?.every((key) => key in obj)) return false;

  // Disambiguators for structurally-overlapping types.
  switch (typeName) {
    case "Quantity":
      // Quantity has `value` + at least one of unit/code/system. Rules out
      // plain {value:5} or HumanName-with-no-family resources that slipped in.
      return "unit" in obj || "code" in obj || "system" in obj;
    case "Coding":
      // Coding has `code` but NOT a `coding` array (that's CodeableConcept).
      return !("coding" in obj);
    case "ContactPoint":
      // ContactPoint.system is a short enum (phone/email/…), not a URI.
      return typeof obj.system === "string" && CONTACT_POINT_SYSTEMS.has(obj.system);
    case "Identifier":
      // Identifier.system is a URI; ContactPoint's is a short enum word.
      // Accept richer Identifier shapes (assigner/type) too.
      return systemLooksLikeUri(obj.system) || "assigner" in obj || "type" in obj;
    default:
      return true;
  }
}
