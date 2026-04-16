import type {
  CodeableConcept,
  Coding,
  HumanName,
  Identifier,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  Resource,
} from "@fhir-dsl/types";

// --- Type utilities for FHIRPath navigation ---

/** Strip array wrapper and undefined/null to get the element type */
export type Unwrap<T> = NonNullable<T extends readonly (infer U)[] ? U : T>;

/** True when the unwrapped type is a JS primitive (terminal — no further navigation) */
export type IsPrimitive<T> = Unwrap<T> extends string | number | boolean ? true : false;

/** String keys available for navigation on the unwrapped type */
export type NavKeys<T> = string & keyof Unwrap<T>;

// --- FHIRPath type map for ofType() narrowing ---

export interface FhirTypeMap {
  Quantity: Quantity;
  CodeableConcept: CodeableConcept;
  Coding: Coding;
  HumanName: HumanName;
  Identifier: Identifier;
  Reference: Reference;
  Period: Period;
  Range: Range;
  Ratio: Ratio;
  string: string;
  String: string;
  boolean: boolean;
  Boolean: boolean;
  integer: number;
  Integer: number;
  decimal: number;
  Decimal: number;
}

// --- Predicate type for expression callbacks ---

/**
 * A predicate expression node used inside where(), select(), all(), etc.
 * Supports navigation, comparison operators, and boolean logic.
 */
export type FhirPathPredicate<T> = PredicateOps<T> &
  (IsPrimitive<T> extends true ? unknown : { readonly [K in NavKeys<T>]: FhirPathPredicate<Unwrap<T>[K]> });

export interface PredicateOps<T> {
  /** Equals comparison */
  eq(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;
  /** Not equals comparison */
  neq(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;
  /** Less than comparison */
  lt(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;
  /** Greater than comparison */
  gt(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;
  /** Less than or equal comparison */
  lte(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;
  /** Greater than or equal comparison */
  gte(value: Unwrap<T> | FhirPathPredicate<Unwrap<T>>): FhirPathPredicate<boolean>;

  /** Boolean AND */
  and(other: FhirPathPredicate<boolean>): FhirPathPredicate<boolean>;
  /** Boolean OR */
  or(other: FhirPathPredicate<boolean>): FhirPathPredicate<boolean>;
  /** Boolean XOR */
  xor(other: FhirPathPredicate<boolean>): FhirPathPredicate<boolean>;
  /** Boolean NOT */
  not(): FhirPathPredicate<boolean>;
  /** Boolean IMPLIES */
  implies(other: FhirPathPredicate<boolean>): FhirPathPredicate<boolean>;

  /** String contains */
  contains(substring: string): FhirPathPredicate<boolean>;
  /** String starts with */
  startsWith(prefix: string): FhirPathPredicate<boolean>;
  /** String ends with */
  endsWith(suffix: string): FhirPathPredicate<boolean>;
  /** Regex match */
  matches(regex: string): FhirPathPredicate<boolean>;

  /** Existence check */
  exists(): FhirPathPredicate<boolean>;
  /** Empty check */
  empty(): FhirPathPredicate<boolean>;
  /** Count */
  count(): FhirPathPredicate<number>;

  /** Type check */
  is(typeName: string): FhirPathPredicate<boolean>;
  /** Type cast */
  as(typeName: string): FhirPathPredicate<T>;
}

// --- FHIRPath expression builder type (composed from sub-interfaces) ---

export interface FhirPathCoreOps<T> {
  /** Return the compiled FHIRPath expression string */
  compile(): string;
  /** Evaluate the expression against a resource, returning a collection */
  evaluate(resource: unknown): Unwrap<T>[];
}

export interface FhirPathExistenceOps<T> {
  /** Filter by field equality (legacy shorthand) */
  where<K extends NavKeys<T>>(field: K, value: string): FhirPathExpr<T>;
  /** Filter by expression predicate */
  where(predicate: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<boolean>): FhirPathExpr<T>;

  /** True if collection is non-empty, or if any item matches criteria */
  exists(): FhirPathExpr<boolean>;
  exists(predicate: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<boolean>): FhirPathExpr<boolean>;

  /** True if all items match criteria */
  all(predicate: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<boolean>): FhirPathExpr<boolean>;

  /** True if all items are true */
  allTrue(): FhirPathExpr<boolean>;
  /** True if any item is true */
  anyTrue(): FhirPathExpr<boolean>;
  /** True if all items are false */
  allFalse(): FhirPathExpr<boolean>;
  /** True if any item is false */
  anyFalse(): FhirPathExpr<boolean>;

  /** Number of elements */
  count(): FhirPathExpr<number>;
  /** True if collection is empty */
  empty(): FhirPathExpr<boolean>;
  /** Remove duplicate values */
  distinct(): FhirPathExpr<T>;
  /** True if all values are distinct */
  isDistinct(): FhirPathExpr<boolean>;
}

export interface FhirPathSubsetOps<T> {
  /** First element */
  first(): FhirPathExpr<Unwrap<T>>;
  /** Last element */
  last(): FhirPathExpr<Unwrap<T>>;
  /** Exactly one element or error */
  single(): FhirPathExpr<Unwrap<T>>;
  /** All but the first element */
  tail(): FhirPathExpr<T>;
  /** Skip first n elements */
  skip(count: number): FhirPathExpr<T>;
  /** Take first n elements */
  take(count: number): FhirPathExpr<T>;
  /** Elements present in both collections */
  intersect(other: FhirPathExpr<T>): FhirPathExpr<T>;
  /** Elements not present in other collection */
  exclude(other: FhirPathExpr<T>): FhirPathExpr<T>;
}

export interface FhirPathProjectionOps<T> {
  /** Project each element through expression */
  select<R>(projection: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<R>): FhirPathExpr<R>;
  /** Recursively project until stable */
  repeat<R>(projection: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<R>): FhirPathExpr<R>;
  /** Filter collection to elements of the specified type */
  ofType<N extends keyof FhirTypeMap>(type: N): FhirPathExpr<FhirTypeMap[N]>;
}

export interface FhirPathCombiningOps<T> {
  /** Merge two collections (deduplicated) */
  union(other: FhirPathExpr<T>): FhirPathExpr<T>;
  /** Merge two collections (with duplicates) */
  combine(other: FhirPathExpr<T>): FhirPathExpr<T>;
}

export interface FhirPathStringOps {
  /** Index of substring (-1 if not found) */
  indexOf(substring: string): FhirPathExpr<number>;
  /** Extract substring */
  substring(start: number, length?: number): FhirPathExpr<string>;
  /** True if string starts with prefix */
  startsWith(prefix: string): FhirPathExpr<boolean>;
  /** True if string ends with suffix */
  endsWith(suffix: string): FhirPathExpr<boolean>;
  /** True if string contains substring */
  contains(substring: string): FhirPathExpr<boolean>;
  /** Convert to uppercase */
  upper(): FhirPathExpr<string>;
  /** Convert to lowercase */
  lower(): FhirPathExpr<string>;
  /** Replace occurrences of pattern */
  replace(pattern: string, substitution: string): FhirPathExpr<string>;
  /** True if string matches regex */
  matches(regex: string): FhirPathExpr<boolean>;
  /** Replace regex matches */
  replaceMatches(regex: string, substitution: string): FhirPathExpr<string>;
  /** String length */
  length(): FhirPathExpr<number>;
  /** Split string into characters */
  toChars(): FhirPathExpr<string>;
}

export interface FhirPathMathOps {
  /** Absolute value */
  abs(): FhirPathExpr<number>;
  /** Round up to integer */
  ceiling(): FhirPathExpr<number>;
  /** e^x */
  exp(): FhirPathExpr<number>;
  /** Round down to integer */
  floor(): FhirPathExpr<number>;
  /** Natural logarithm */
  ln(): FhirPathExpr<number>;
  /** Logarithm with base */
  log(base: number): FhirPathExpr<number>;
  /** Raise to power */
  power(exponent: number): FhirPathExpr<number>;
  /** Round to precision */
  round(precision?: number): FhirPathExpr<number>;
  /** Square root */
  sqrt(): FhirPathExpr<number>;
  /** Truncate to integer */
  truncate(): FhirPathExpr<number>;
}

export interface FhirPathConversionOps {
  /** Convert to boolean */
  toBoolean(): FhirPathExpr<boolean>;
  /** Convert to integer */
  toInteger(): FhirPathExpr<number>;
  /** Convert to decimal */
  toDecimal(): FhirPathExpr<number>;
  /** Convert to string (FHIRPath toString) */
  toFhirString(): FhirPathExpr<string>;
  /** Convert to date */
  toDate(): FhirPathExpr<string>;
  /** Convert to dateTime */
  toDateTime(): FhirPathExpr<string>;
  /** Convert to time */
  toTime(): FhirPathExpr<string>;
  /** Convert to Quantity */
  toQuantity(unit?: string): FhirPathExpr<Quantity>;
  /** Can convert to boolean? */
  convertsToBoolean(): FhirPathExpr<boolean>;
  /** Can convert to integer? */
  convertsToInteger(): FhirPathExpr<boolean>;
  /** Can convert to decimal? */
  convertsToDecimal(): FhirPathExpr<boolean>;
  /** Can convert to string? */
  convertsToString(): FhirPathExpr<boolean>;
  /** Can convert to date? */
  convertsToDate(): FhirPathExpr<boolean>;
  /** Can convert to dateTime? */
  convertsToDateTime(): FhirPathExpr<boolean>;
  /** Can convert to time? */
  convertsToTime(): FhirPathExpr<boolean>;
  /** Can convert to Quantity? */
  convertsToQuantity(): FhirPathExpr<boolean>;
}

export interface FhirPathUtilityOps<T> {
  /** Debug trace (returns input unchanged) */
  trace(name: string): FhirPathExpr<T>;
  /** Immediate children of each element */
  children(): FhirPathExpr<unknown>;
  /** All descendants of each element */
  descendants(): FhirPathExpr<unknown>;
  /** Conditional: if criterion then trueResult else otherwiseResult */
  iif<R>(
    criterion: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<boolean>,
    trueResult: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<R>,
    otherwiseResult?: ($this: FhirPathPredicate<Unwrap<T>>) => FhirPathPredicate<R>,
  ): FhirPathExpr<R>;
  /** Current dateTime */
  now(): FhirPathExpr<string>;
  /** Current time */
  timeOfDay(): FhirPathExpr<string>;
  /** Current date */
  today(): FhirPathExpr<string>;
}

/** Composed FHIRPath operations interface */
export interface FhirPathOps<T>
  extends FhirPathCoreOps<T>,
    FhirPathExistenceOps<T>,
    FhirPathSubsetOps<T>,
    FhirPathProjectionOps<T>,
    FhirPathCombiningOps<T>,
    FhirPathStringOps,
    FhirPathMathOps,
    FhirPathConversionOps,
    FhirPathUtilityOps<T> {}

/**
 * A type-safe FHIRPath expression node.
 *
 * When `T` resolves to a complex FHIR type, every property of the unwrapped
 * type is available as a navigable key with full autocomplete.
 * When `T` resolves to a primitive, only collection operations remain.
 */
export type FhirPathExpr<T> = FhirPathOps<T> &
  (IsPrimitive<T> extends true ? unknown : { readonly [K in NavKeys<T>]: FhirPathExpr<Unwrap<T>[K]> });

/** Constraint for the `fhirpath()` entry point — accepts any FHIR Resource. */
export type FhirPathResource = Resource;
