// Typed dotted paths for `.transform(...)`.
//
// Arrays require explicit numeric segments — `participant.0.actor`, not
// `participant.actor`. We deliberately do NOT auto-unwrap or auto-first-match;
// the caller decides which element they want. This keeps the runtime honest
// (walking the same structure the type describes) and rules out a whole class
// of subtle bugs where a path compiled but pointed at a missing index.
//
// Depth is capped at 6. FHIR resources are shallow in practice; deeper
// recursion explodes the union and makes hovers / autocomplete unresponsive.

type Prev = [never, 0, 1, 2, 3, 4, 5, 6];

/** Max depth for Path/PathValue recursion. Product decision — do not raise without measuring IntelliSense. */
export type PathMaxDepth = 6;

type NumericSeg = `${number}`;

type NonNullableStrict<T> = T extends null | undefined ? never : T;

/**
 * Dotted paths through `T`, capped at `D` levels deep. Distributes over unions
 * so `Path<A | B>` yields the paths valid on *either* side (important for the
 * post-include scope where a reference becomes `Reference | TargetResource`).
 *
 * Arrays contribute a numeric head segment (`0`, `1`, …) — no implicit unwrap.
 */
export type Path<T, D extends number = PathMaxDepth> = [D] extends [0]
  ? never
  : T extends readonly (infer U)[]
    ? NumericSeg | `${NumericSeg}.${Path<NonNullableStrict<U>, Prev[D] & number>}`
    : T extends object
      ? {
          [K in keyof T & string]: K | `${K}.${Path<NonNullableStrict<T[K]>, Prev[D] & number>}`;
        }[keyof T & string]
      : never;

/**
 * Resolves the value type at a given dotted path. Returns `never` if the path
 * doesn't match. Distributes over unions so nested accesses against
 * `Reference | Patient` collapse to whichever member actually has the key.
 */
export type PathValue<T, P extends string> = T extends unknown ? _PathValue<T, P> : never;

type _PathValue<T, P extends string> = P extends `${infer Head}.${infer Tail}`
  ? T extends readonly (infer U)[]
    ? Head extends NumericSeg
      ? PathValue<NonNullableStrict<U>, Tail>
      : never
    : Head extends keyof T
      ? PathValue<NonNullableStrict<T[Head]>, Tail>
      : never
  : T extends readonly (infer U)[]
    ? P extends NumericSeg
      ? NonNullableStrict<U>
      : never
    : P extends keyof T
      ? T[P]
      : never;

// The "paths to array-of-{system, X}" helpers used to be implemented as a
// filter over `Path<T>` — `{ [P in Path<T>]: PathValue<T,P> extends ... ? P : never }[Path<T>]`.
// That computes `Path<T>` once and then triggers `PathValue<T, P>` for every
// candidate path, which is quadratic over the path space. For wide types
// (Encounter + 3 includes), IntelliSense would stall for 500ms+ on every
// `t.coding(` or `t.valueOf(` call site.
//
// The direct-walk versions below follow the same recursion shape as `Path`
// but only emit a segment when the current field itself has the target
// shape — no `PathValue` re-resolution. Empirically ~10x faster on real
// FHIR schemas and produces a noticeably smaller union.

type IsCodingArray<T> = NonNullableStrict<T> extends readonly { system?: unknown; code?: unknown }[] ? true : false;
type IsSystemValueArray<T> =
  NonNullableStrict<T> extends readonly { system?: unknown; value?: unknown }[] ? true : false;

/**
 * Paths whose value is an array of `{ system?, code? }` — i.e. `CodeableConcept.coding`
 * or any structure shaped like it. Used to constrain `t.coding(path, system)`.
 */
export type PathToCodingArray<T, D extends number = PathMaxDepth> = [D] extends [0]
  ? never
  : T extends readonly (infer U)[]
    ? `${NumericSeg}.${PathToCodingArray<NonNullableStrict<U>, Prev[D] & number>}`
    : T extends object
      ? {
          [K in keyof T & string]: IsCodingArray<T[K]> extends true
            ? K
            : `${K}.${PathToCodingArray<NonNullableStrict<T[K]>, Prev[D] & number>}`;
        }[keyof T & string]
      : never;

/**
 * Paths whose value is an array of `{ system?, value? }` — i.e. `ContactPoint`
 * or `Identifier`. Used to constrain `t.valueOf(path, system)`.
 */
export type PathToSystemValueArray<T, D extends number = PathMaxDepth> = [D] extends [0]
  ? never
  : T extends readonly (infer U)[]
    ? `${NumericSeg}.${PathToSystemValueArray<NonNullableStrict<U>, Prev[D] & number>}`
    : T extends object
      ? {
          [K in keyof T & string]: IsSystemValueArray<T[K]> extends true
            ? K
            : `${K}.${PathToSystemValueArray<NonNullableStrict<T[K]>, Prev[D] & number>}`;
        }[keyof T & string]
      : never;
