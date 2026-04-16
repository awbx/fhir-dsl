// Internal type utilities shared across @fhir-dsl/core.
// Not part of the public API — import path is not re-exported from index.
// Kept small and focused: each utility does one thing.

/** Flattens an intersection so IDE hovers show a single object type. */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Distributes a union into an intersection (classic functor trick). */
export type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void
  ? I
  : never;

/** Strips array wrappers and null/undefined. */
export type Unwrap<T> = NonNullable<T extends readonly (infer U)[] ? U : T>;

/** True when the unwrapped type is a JS primitive (terminal — no further navigation). */
export type IsPrimitive<T> = Unwrap<T> extends string | number | boolean | bigint | symbol ? true : false;

/** String-only keys available on the unwrapped type. */
export type NavKeys<T> = Extract<keyof Unwrap<T>, string>;

/**
 * Depth counter used by Path/PathValue to bound recursion.
 * Index 0 is the base case (recursion stops).
 */
type DepthStep = [never, 0, 1, 2, 3, 4, 5];

/**
 * Dotted paths through an object, capped at `D` levels deep.
 * Default depth of 3 keeps IDE autocomplete responsive on large FHIR shapes.
 */
export type Path<T, D extends number = 3> = D extends 0
  ? never
  : Unwrap<T> extends infer U
    ? U extends object
      ? {
          [K in NavKeys<U>]: K | `${K}.${Path<U[K & keyof U], DepthStep[D] & number>}`;
        }[NavKeys<U>]
      : never
    : never;

/** Resolves the value at a given dotted path. Returns `never` if the path is invalid. */
export type PathValue<T, P extends string> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof Unwrap<T>
    ? PathValue<Unwrap<T>[Head], Tail>
    : never
  : P extends keyof Unwrap<T>
    ? Unwrap<T>[P]
    : never;

/**
 * Picks top-level keys from `T` and flattens the result.
 * Matches FHIR `_elements` semantics (top-level element names only).
 */
export type PickFields<T, K extends keyof T> = Prettify<Pick<T, K>>;
