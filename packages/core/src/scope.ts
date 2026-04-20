import type { FhirSchema } from "./types.js";

// Scope<S, RT, IncMap> — the "virtual" resource shape the caller of
// `.transform(t => ...)` sees.
//
// For each entry `[param, targetResourceType]` in `IncMap`, we look up the
// search-param's canonical FHIRPath expression (from the generator-emitted
// `IncludeExpressions<S, RT>`) and union-in the target resource at that path.
//
// The replacement is a *union*: `Reference<…>` stays in the type alongside the
// target resource. That lets callers path into either side — `subject.name`
// walks the Patient, `subject.reference` walks the Reference. The runtime
// decides at access time which to use based on the next path segment.

// Interfaces don't satisfy `Record<string, X>` constraints (declaration
// merging could add incompatible fields), which is why we can't gate on
// `extends Record<string, unknown>` here — generated `IncludeExpressions` is
// almost always emitted as an interface. Check `object` instead.
type IsAny<T> = 0 extends 1 & T ? true : false;

export type IncludeExpressionsFor<S extends FhirSchema, RT extends string> = S extends {
  includeExpressions: infer IE;
}
  ? IsAny<IE> extends true
    ? Record<string, never>
    : IE extends object
      ? RT extends keyof IE
        ? IE[RT]
        : Record<string, never>
      : Record<string, never>
  : Record<string, never>;

type ResolveResource<S extends FhirSchema, Name extends string> = Name extends keyof S["resources"]
  ? S["resources"][Name]
  : never;

// Union-to-tuple trick. Order is implementation-defined, but since SetAtPath
// applications commute (each targets a different sub-path / different field)
// the order doesn't affect the final type.
type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
type LastInUnion<U> =
  UnionToIntersection<U extends unknown ? (x: U) => void : never> extends (x: infer L) => void ? L : never;
type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never] ? [] : [...UnionToTuple<Exclude<U, Last>>, Last];

// Walk `T` by path `P`, replacing the *field at the end of the path* with `V`
// (unioned with whatever was there). Transparently traverses arrays by
// descending into the element type — FHIR expressions like
// `Encounter.participant.actor` implicitly iterate across `participant[]`
// without spelling out an index.
type SetAtPath<T, P extends string, V> = T extends readonly (infer U)[]
  ? SetAtPath<U, P, V>[]
  : P extends `${infer Head}.${infer Tail}`
    ? Head extends keyof T
      ? Omit<T, Head> & {
          [K in Head]: T[Head] extends readonly (infer _U)[]
            ? SetAtPath<NonNullable<T[Head]>, Tail, V>
            : SetAtPath<NonNullable<T[Head]>, Tail, V> | Extract<T[Head], undefined | null>;
        }
      : T
    : P extends keyof T
      ? Omit<T, P> & {
          [K in P]: T[P] extends readonly (infer U)[]
            ? (U | V)[]
            : NonNullable<T[P]> | V | Extract<T[P], undefined | null>;
        }
      : T;

// ApplyOne handles the case where `IncludeExpressions[K]` may be a single
// string literal OR a union of literals (multi-expression params like
// `Encounter.subject | Encounter.patient`). We distribute over the union so
// the substitution lands on every path independently. If `Expr` isn't a
// string for whatever reason (missing expression, schema drift), no-op.
type ApplyOne<T, Expr, V> = [Expr] extends [never] ? T : Expr extends string ? SetAtPath<T, Expr, V> : T;

// ApplyAll — iterate each `[param, target]` entry in IncMap and substitute the
// target resource at the corresponding expression path. Arms (top to bottom):
//   1. Keys tuple is empty               → return T unchanged (base case).
//   2. Head not a string                 → skip, recurse.
//   3. Head not in IncMap                → skip (defensive — keys always from IncMap).
//   4. Head not in ExprMap               → no-op skip (param has no canonical
//                                          expression — still recurse so other
//                                          keys apply).
//   5. Head has a usable expression      → apply substitution, recurse.
type ApplyAll<
  T,
  ExprMap,
  IncMap extends Record<string, string>,
  S extends FhirSchema,
  Keys extends readonly unknown[],
> = Keys extends readonly [infer Head, ...infer Rest]
  ? Head extends string
    ? Head extends keyof IncMap
      ? Head extends keyof ExprMap
        ? ApplyAll<ApplyOne<T, ExprMap[Head], ResolveResource<S, IncMap[Head] & string>>, ExprMap, IncMap, S, Rest>
        : ApplyAll<T, ExprMap, IncMap, S, Rest>
      : ApplyAll<T, ExprMap, IncMap, S, Rest>
    : ApplyAll<T, ExprMap, IncMap, S, Rest>
  : T;

export type Scope<S extends FhirSchema, RT extends string, IncMap extends Record<string, string>> =
  IsAny<IncMap> extends true
    ? RT extends keyof S["resources"]
      ? S["resources"][RT]
      : never
    : RT extends keyof S["resources"]
      ? ApplyAll<S["resources"][RT], IncludeExpressionsFor<S, RT>, IncMap, S, UnionToTuple<keyof IncMap & string>>
      : never;
