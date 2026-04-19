/**
 * FHIR primitive `_field` extension-sibling box (FP.9 / §2.1.9.2).
 *
 * FHIR allows primitive properties to carry metadata — `id`, `extension`,
 * `fhir_comments` — via a sibling object named `_<field>`. Example:
 *
 * ```jsonc
 * {
 *   "family": "Smith",
 *   "_family": { "extension": [{ "url": "...", "valueString": "..." }] }
 * }
 * ```
 *
 * The FHIRPath type model merges the two: `Patient.name.family` is a
 * single logical element with a primitive value plus Element metadata, so
 * `Patient.name.family.extension` must reach the `_family.extension`. In
 * JavaScript, primitives (`string`, `number`, `boolean`) cannot carry
 * properties, so `evalNav` wraps the primitive in a box when the sibling
 * is present. Downstream consumers unbox via `unwrapPrimitive()` before
 * reading the primitive value.
 *
 * The box is intentionally opaque: a plain object with a branded Symbol
 * and a `__value` payload. `extension`, `id`, … fields from the sibling
 * are spread in directly so subsequent `.extension` / `.id` navigation
 * finds them through the normal `NavOp` path.
 */

export const PRIMITIVE_BOX: unique symbol = Symbol.for("fhirpath.primitive-box");

export interface PrimitiveBox {
  [PRIMITIVE_BOX]: true;
  __value: string | number | boolean;
  [key: string]: unknown;
}

export function boxPrimitive(value: string | number | boolean, sibling: Record<string, unknown>): PrimitiveBox {
  return { [PRIMITIVE_BOX]: true, __value: value, ...sibling };
}

export function isPrimitiveBox(value: unknown): value is PrimitiveBox {
  return (
    value != null && typeof value === "object" && (value as Record<string | symbol, unknown>)[PRIMITIVE_BOX] === true
  );
}

/** Unbox a boxed primitive, or return the value unchanged. */
export function unwrapPrimitive(value: unknown): unknown {
  return isPrimitiveBox(value) ? value.__value : value;
}
