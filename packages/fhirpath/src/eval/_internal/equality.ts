/**
 * FHIRPath §6.1 equality: two items are equal if they are the same value, or,
 * for compound types (Quantity, Coding, CodeableConcept, HumanName, Reference,
 * …), if every property is recursively equal. Strict property-set match.
 *
 * Quantity equality is UCUM-aware (#51): same-dimension quantities are
 * compared by their canonical SI value, so `5 'mg' = 0.005 'g'` returns
 * true. When unit parsing fails or dimensions differ, fall back to the
 * structural property-set match (still correct for unit-equal pairs).
 *
 * Date/DateTime/Time equality is NOT normalized by precision — a separate spec
 * concern. This helper handles the common structural-equality cases that
 * `===` misses.
 */
import { unwrapPrimitive } from "./primitive-box.js";
import { quantityEqual, UcumError } from "./ucum.js";

function isQuantityShape(v: unknown): v is { value: number; unit?: string; code?: string } {
  if (v == null || typeof v !== "object" || Array.isArray(v)) return false;
  if ("resourceType" in v) return false;
  const obj = v as Record<string, unknown>;
  if (typeof obj.value !== "number") return false;
  return "unit" in obj || "code" in obj || "system" in obj;
}

function quantityUnit(q: { unit?: string; code?: string }): string | undefined {
  // FHIR Quantity: prefer machine-readable code (UCUM symbol) over the
  // human-readable display unit. `code` lives at `Quantity.code`; `unit`
  // is the human display string.
  if (typeof q.code === "string" && q.code !== "") return q.code;
  if (typeof q.unit === "string" && q.unit !== "") return q.unit;
  return undefined;
}

export function fhirpathEqual(a: unknown, b: unknown): boolean {
  // FP.9: a boxed primitive (a value that carries `_field` extension
  // metadata) still compares as the underlying primitive — only the
  // value-axis participates in equality, not the Element metadata.
  a = unwrapPrimitive(a);
  b = unwrapPrimitive(b);
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  // §2.1.20: string equality is NFC-normalized — identically-looking strings
  // in composed vs decomposed forms must compare equal.
  if (typeof a === "string" && typeof b === "string") return a.normalize("NFC") === b.normalize("NFC");
  if (typeof a !== "object") return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!fhirpathEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // UCUM-aware Quantity equality. Try canonical-value comparison first;
  // fall back to structural property match when units don't parse or
  // are dimensionally incompatible.
  if (isQuantityShape(a) && isQuantityShape(b)) {
    const ua = quantityUnit(a);
    const ub = quantityUnit(b);
    if (ua !== undefined && ub !== undefined) {
      try {
        const verdict = quantityEqual({ value: a.value, unit: ua }, { value: b.value, unit: ub });
        if (verdict !== null) return verdict;
      } catch (err) {
        // Unsupported special unit (Celsius, pH, ...) — fall through to
        // structural equality so callers still get a sensible answer.
        if (!(err instanceof UcumError)) throw err;
      }
    }
    // Either no parseable units or dimensions differ — structural fall-back.
  }

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => fhirpathEqual(aObj[key], bObj[key]));
}
