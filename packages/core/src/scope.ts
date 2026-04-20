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

export type IncludeExpressionsFor<S extends FhirSchema, RT extends string> = S extends {
  includeExpressions: infer IE;
}
  ? IE extends Record<string, unknown>
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

// For multi-expression params (e.g. `Encounter.subject | Encounter.patient`)
// `IncludeExpressions[K]` may be a string *union*. Apply the substitution at
// each path independently.
type ApplyOne<T, Expr, V> = [Expr] extends [string] ? (Expr extends string ? SetAtPath<T, Expr, V> : T) : T;

type ApplyAll<
  T,
  ExprMap extends Record<string, string>,
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

export type Scope<
  S extends FhirSchema,
  RT extends string,
  IncMap extends Record<string, string>,
> = RT extends keyof S["resources"]
  ? IncludeExpressionsFor<S, RT> extends infer ExprMap
    ? ExprMap extends Record<string, string>
      ? ApplyAll<S["resources"][RT], ExprMap, IncMap, S, UnionToTuple<keyof IncMap & string>>
      : S["resources"][RT]
    : S["resources"][RT]
  : never;
