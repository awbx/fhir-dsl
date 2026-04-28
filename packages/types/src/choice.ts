// Choice-type ("value[x]") accessors.
//
// FHIR choice types like `Observation.value[x]` are emitted as a set of
// per-variant optional fields (`valueQuantity`, `valueString`, …). The
// spec forbids more than one being set at a time, but TypeScript can't
// express "at most one" through optional fields without breaking the
// `interface X extends Y` ergonomics that downstream consumers rely on.
//
// Instead, this module gives consumers a typed accessor that returns a
// discriminated union over whichever variant is actually present. Use
// `choiceOf(obs, "value")` to read; the type system guarantees the
// return shape narrows to the typed variant per resource.

/**
 * Type-level: discriminated union of every `${prefix}${Suffix}` field on
 * `T` whose suffix starts with an uppercase letter (FHIR's choice-type
 * naming convention). Each branch carries the literal key + the
 * non-undefined value type for that field.
 */
export type ChoiceOf<T, Prefix extends string> = {
  [P in ChoiceKeys<T, Prefix>]: { key: P; value: NonNullable<T[P]> };
}[ChoiceKeys<T, Prefix>];

type ChoiceKeys<T, Prefix extends string> = {
  [K in keyof T]: K extends `${Prefix}${infer Suffix}`
    ? Suffix extends `${Uppercase<infer _F>}${string}`
      ? K
      : never
    : never;
}[keyof T];

/**
 * Runtime: returns the active choice-type branch + its discriminator
 * key, or `undefined` if no variant is set.
 *
 *   const v = choiceOf(observation, "value");
 *   if (v?.key === "valueQuantity") {
 *     console.log(v.value.unit);
 *   }
 *
 * Underscore-prefixed siblings (`_valueQuantity` for primitive
 * extensions) are intentionally skipped — they're not the value, they
 * carry metadata about it.
 */
export function choiceOf<T, Prefix extends string>(obj: T, prefix: Prefix): ChoiceOf<T, Prefix> | undefined {
  if (obj == null || typeof obj !== "object") return undefined;
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value === undefined || value === null) continue;
    if (!key.startsWith(prefix) || key.length === prefix.length) continue;
    if (key.startsWith("_")) continue;
    const next = key.charAt(prefix.length);
    if (next !== next.toUpperCase() || next === next.toLowerCase()) continue;
    return { key, value } as ChoiceOf<T, Prefix>;
  }
  return undefined;
}
