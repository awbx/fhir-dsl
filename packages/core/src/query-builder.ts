import type { Resource, SearchParam } from "@fhir-dsl/types";
import type { Prettify } from "./_internal/type-utils.js";
import type { CompiledQuery } from "./compiled-query.js";
import type {
  CompositeKeys,
  CompositeValues,
  DatePrefix,
  FhirSchema,
  IncludeFor,
  ResolveProfile,
  RevIncludeFor,
  SearchParamFor,
  SearchPrefixFor,
  SortDirection,
} from "./types.js";

export type SummaryMode = "true" | "false" | "text" | "data" | "count";
export type TotalMode = "none" | "estimate" | "accurate";
export type ContainedMode = "true" | "false" | "both";
export type ContainedTypeMode = "container" | "contained";

// --- Result projection (used by .select()) ---

/**
 * Narrows a resource type to the picked fields.
 * `resourceType` is always preserved since FHIR servers include it regardless.
 * When `Sel` is `never`, the full resource is returned (no projection).
 */
export type ApplySelection<R, Sel extends string> = [Sel] extends [never]
  ? R
  : Prettify<Pick<R, Extract<Sel | "resourceType", keyof R>>>;

// --- Search Result Types ---

export interface BundleLink {
  relation: string;
  url: string;
}

export interface SearchResult<Primary extends Resource, Included extends Resource = never> {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number | undefined;
  link?: BundleLink[] | undefined;
  raw: unknown;
}

// --- Stream Options ---

export interface StreamOptions {
  signal?: AbortSignal;
}

// --- Resolve included resource types from the resource map ---

export type ResolveIncluded<
  S extends FhirSchema,
  IncludedTypes extends string,
> = IncludedTypes extends keyof S["resources"] ? S["resources"][IncludedTypes] : never;

// --- Search Query Builder Interface ---

export interface SearchQueryBuilder<
  S extends FhirSchema,
  RT extends string,
  SP = Record<string, SearchParam>,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
  Sel extends string = never,
> {
  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * Multi-value OR: emits a single `param=v1,v2,v3` query.
   * Only the `eq` operator is allowed — FHIR forbids per-value prefixes inside an OR list.
   */
  where<K extends string & keyof SP>(
    param: K,
    op: "eq",
    values: readonly (SP[K] extends { value: infer V } ? V : string)[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * Multi-value OR shorthand — equivalent to `where(param, "eq", values)`.
   * Emits `param=v1,v2,v3`.
   */
  whereIn<K extends string & keyof SP>(
    param: K,
    values: readonly (SP[K] extends { value: infer V } ? V : string)[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `:missing` modifier — `param:missing=true|false` */
  whereMissing<K extends string & keyof SP>(param: K, missing: boolean): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  // --- Common search parameters (shared across resources) ---

  /** FHIR `_id` — match resource(s) by logical id. Multiple ids = OR. */
  whereId(...ids: string[]): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_lastUpdated` — filter by Resource.meta.lastUpdated with a date prefix. */
  whereLastUpdated(op: DatePrefix, value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_tag` — match by tag. Use `system|code` or just `code`. */
  withTag(value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_security` — match by security label. */
  withSecurity(value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_source` — filter by Resource.meta.source URI. */
  fromSource(uri: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  // --- Result-shaping parameters ---

  /** FHIR `_summary` — request partial resources. */
  summary(mode: SummaryMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_total` — request total count behavior. */
  total(mode: TotalMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_contained` — control inclusion of contained resources. */
  contained(mode: ContainedMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_containedType` — when `_contained=true`, choose container or contained. */
  containedType(mode: ContainedTypeMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  whereComposite<K extends string & CompositeKeys<SP>>(
    param: K,
    values: CompositeValues<SP[K]>,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
  ): SearchQueryBuilder<
    S,
    RT,
    SP,
    Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never),
    Prof,
    Sel
  >;

  revinclude<SrcRT extends string & keyof RevIncludeFor<S, RT>, Param extends string & RevIncludeFor<S, RT>[SrcRT]>(
    sourceResource: SrcRT,
    param: Param,
  ): SearchQueryBuilder<S, RT, SP, Inc | SrcRT, Prof, Sel>;

  whereChained<
    RefParam extends string & keyof IncludeFor<S, RT>,
    TargetRT extends string & (IncludeFor<S, RT>[RefParam] extends string ? IncludeFor<S, RT>[RefParam] : never),
    K extends string & keyof SearchParamFor<S, TargetRT>,
  >(
    refParam: RefParam,
    targetResource: TargetRT,
    targetParam: K,
    op: SearchPrefixFor<SearchParamFor<S, TargetRT>[K]>,
    value: SearchParamFor<S, TargetRT>[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  has<
    SrcRT extends string & keyof RevIncludeFor<S, RT>,
    RefParam extends string & RevIncludeFor<S, RT>[SrcRT],
    K extends string & keyof SearchParamFor<S, SrcRT>,
  >(
    sourceResource: SrcRT,
    refParam: RefParam,
    searchParam: K,
    op: SearchPrefixFor<SearchParamFor<S, SrcRT>[K]>,
    value: SearchParamFor<S, SrcRT>[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  sort(param: string & keyof SP, direction?: SortDirection): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  count(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  offset(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * Narrow the returned resources to the given top-level fields.
   * Compiles to FHIR's `_elements` search parameter and refines the
   * `execute()` / `stream()` result type via `Pick`.
   *
   * Calling `.select()` again replaces the previous selection.
   * `resourceType` is always implicitly included (servers return it regardless).
   */
  select<K extends string & keyof ResolveProfile<S, RT, Prof>>(
    fields: readonly K[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, K>;

  /**
   * Validate every returned resource against its generated Standard Schema on `.execute()` / `.stream()`.
   * Requires schemas to be wired into the client (generate with `--validator native|zod`);
   * otherwise this call throws `ValidationUnavailableError` immediately.
   */
  validate(): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * Force POST `[type]/_search` with form-encoded body instead of GET. Useful when
   * the query string would exceed server limits, or when the params contain values
   * that should not appear in URL logs.
   */
  usePost(): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  compile(): CompiledQuery;

  execute(): Promise<
    SearchResult<
      ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >
  >;

  stream(options?: StreamOptions): AsyncIterable<ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource>;
}

// --- Read Query Builder Interface ---

export interface ReadQueryBuilder<S extends FhirSchema, RT extends string> {
  /**
   * Validate the returned resource against its generated Standard Schema on `.execute()`.
   * Requires schemas to be wired into the client (generate with `--validator native|zod`);
   * otherwise this call throws `ValidationUnavailableError` immediately.
   */
  validate(): ReadQueryBuilder<S, RT>;

  compile(): CompiledQuery;

  execute(): Promise<S["resources"][RT] & Resource>;
}
