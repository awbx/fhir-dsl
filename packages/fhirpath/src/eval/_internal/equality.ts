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
export function fhirpathEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
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
