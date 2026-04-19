/**
 * FHIRPath §6.1 equality: two items are equal if they are the same value, or,
 * for compound types (Quantity, Coding, CodeableConcept, HumanName, Reference,
 * …), if every property is recursively equal. Strict property-set match; no
 * UCUM-aware Quantity canonicalization here (tracked separately in spec-gaps).
 *
 * Date/DateTime/Time equality is NOT normalized by precision — a separate spec
 * concern. This helper handles the common structural-equality cases that
 * `===` misses.
 */
import { unwrapPrimitive } from "./primitive-box.js";

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
  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => fhirpathEqual(aObj[key], bObj[key]));
}
