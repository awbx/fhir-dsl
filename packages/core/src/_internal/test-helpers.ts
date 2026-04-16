// Compile-time type-assertion helpers.
// Import from "@fhir-dsl/core/_internal/test-helpers" in .test-d.ts files.
//
// Usage:
//   type _1 = Assert<Equals<ResolveSelection<Patient, "id">, { id?: string }>>;

/**
 * Exact type equality. Uses the well-known "function identity" trick:
 * two types are equal iff a probe function parameterized by each is mutually assignable.
 * Differs from `extends` in that it distinguishes `any` from other types and respects variance.
 */
export type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** Asserts at compile time that the argument is the literal `true`. */
export type Assert<T extends true> = T;

/** Alias of `Assert` for tests that read better with `Expect<...>`. */
export type Expect<T extends true> = T;
