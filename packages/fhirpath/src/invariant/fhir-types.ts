// FHIR type knowledge for the invariant evaluator, which has no SpecCatalog at
// runtime. Two jobs:
//
// 1. Choice-type navigation: `value` must reach `valueQuantity`, `valueString`, …
//    The base/suffix tables live in `../fhir-choice.ts`, shared with the
//    op-based evaluator. Direct lookup always wins.
//
// 2. Type tests (`is`, `as`, `ofType`): answered only when the JSON value makes
//    the answer certain. JSON can't tell `code` from `uri`, so ambiguous cases
//    throw, which surfaces the invariant as indeterminate rather than guessing.

import { choiceTypeOf, choiceTypeSatisfies, findChoiceVariant, recordChoiceType } from "../fhir-choice.js";

const STRING_PRIMITIVES = new Set([
  "string",
  "code",
  "id",
  "uri",
  "url",
  "canonical",
  "oid",
  "uuid",
  "markdown",
  "base64binary",
  "date",
  "datetime",
  "instant",
  "time",
  "xhtml",
]);
const INTEGER_PRIMITIVES = new Set(["integer", "integer64", "positiveint", "unsignedint"]);
const PRIMITIVES = new Set([...STRING_PRIMITIVES, ...INTEGER_PRIMITIVES, "boolean", "decimal"]);

/** Resolve `item[name]`, falling back to the `name[x]` choice variant present on `item`. */
export function lookupProperty(item: Record<string, unknown>, name: string): unknown {
  const direct = item[name];
  if (direct !== undefined) return direct;
  const variant = findChoiceVariant(item, name);
  if (variant === undefined) return undefined;
  recordChoiceType(variant.value, variant.type);
  return variant.value;
}

/** `FHIR.Quantity` / `System.String` / `Quantity` → bare type name. */
export function normaliseTypeName(name: string): string {
  return name.replace(/^(FHIR|System)\./, "");
}

/**
 * Is `value` of FHIR/System type `type`? Returns `undefined` when the JSON
 * shape can't settle it; callers treat that as an evaluation error.
 */
export function isOfType(value: unknown, type: string): boolean | undefined {
  const lower = type.toLowerCase();
  const primitive = PRIMITIVES.has(lower);
  if (typeof value === "boolean") return lower === "boolean";
  if (typeof value === "number") {
    if (lower === "decimal") return true;
    if (INTEGER_PRIMITIVES.has(lower)) return Number.isInteger(value);
    return false;
  }
  if (typeof value === "string") {
    if (!STRING_PRIMITIVES.has(lower)) return false;
    // `string` vs `code` vs `uri` is not visible in JSON.
    return undefined;
  }
  if (value == null || typeof value !== "object") return undefined;
  if (primitive) return false;
  const resourceType = (value as Record<string, unknown>).resourceType;
  if (typeof resourceType === "string") {
    if (type === "Resource") return true;
    if (type === "DomainResource") return !["Bundle", "Binary", "Parameters"].includes(resourceType);
    return resourceType === type;
  }
  const known = choiceTypeOf(value);
  if (known !== undefined) return choiceTypeSatisfies(known, type);
  return undefined;
}
