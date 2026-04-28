// Phase 2.1 — runtime helpers for accessing FHIR profile slices.
//
// The generator emits `<baseProp>_<sliceName>?: T` fields on profile types
// as a *type-level convenience*. At runtime the array (e.g. `extension`)
// still holds the actual data, and the slice-named field never exists. To
// get a typed reference to a specific slice element, use the helpers
// below — they walk the array and pick the matching entry by URL,
// fixed-value path, or a custom predicate.
//
// The generator also records a `discriminator` on each `SliceModel`. We
// intentionally don't ship a fully typed `slice()` accessor here yet — the
// runtime helpers cover the common cases (extension URL, simple path
// matching) and stay framework-agnostic. A future phase can layer typed
// codegen on top of these primitives.

export interface UrlBearing {
  url?: string;
}

/**
 * Find the first item in `items` whose `url` field equals `url`. Designed
 * for FHIR `Extension[]` arrays, where each extension's `url` is the
 * discriminator. Returns `undefined` when nothing matches or the array is
 * absent.
 */
export function extensionByUrl<T extends UrlBearing>(items: readonly T[] | undefined, url: string): T | undefined {
  if (!items) return undefined;
  for (const item of items) {
    if (item.url === url) return item;
  }
  return undefined;
}

/**
 * Find every item in `items` whose `url` field equals `url`. Use this for
 * extension slices declared with `max: "*"` — e.g., a profile that allows
 * many `us-core-race` entries.
 */
export function extensionsByUrl<T extends UrlBearing>(items: readonly T[] | undefined, url: string): T[] {
  if (!items) return [];
  const result: T[] = [];
  for (const item of items) {
    if (item.url === url) result.push(item);
  }
  return result;
}

/**
 * Find the first item satisfying a predicate. Equivalent to
 * `Array.prototype.find` but null-safe and explicitly typed for the
 * "missing array" case that FHIR optional fields produce.
 */
export function findSlice<T>(items: readonly T[] | undefined, predicate: (item: T) => boolean): T | undefined {
  if (!items) return undefined;
  for (const item of items) {
    if (predicate(item)) return item;
  }
  return undefined;
}

/**
 * Read a dotted path from a value. Used by `findSliceByPath` to evaluate
 * the discriminator path the generator captured. Stops at the first
 * undefined segment. Treats arrays transparently — `code.coding.code`
 * against `{ coding: [{ code: "x" }] }` returns `"x"` (first match).
 */
export function readPath(value: unknown, path: string): unknown {
  if (!path) return value;
  const segments = path.split(".");
  let current: unknown = value;
  for (const segment of segments) {
    if (current == null) return undefined;
    if (Array.isArray(current)) {
      // If we're walking an array, prefer the first element whose path
      // segment is defined. This matches how `discriminator.path` is
      // typically interpreted: a dotted FHIRPath evaluated against each
      // candidate slice instance.
      const head = current[0];
      current = head == null ? undefined : (head as Record<string, unknown>)[segment];
      continue;
    }
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Find the first item where reading `path` produces a value equal to
 * `expected`. Mirrors how FHIR `discriminator.type = "value"` slices are
 * resolved at runtime.
 */
export function findSliceByPath<T>(items: readonly T[] | undefined, path: string, expected: unknown): T | undefined {
  if (!items) return undefined;
  for (const item of items) {
    if (readPath(item, path) === expected) return item;
  }
  return undefined;
}
