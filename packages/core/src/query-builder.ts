import type { Resource, SearchParam } from "@fhir-dsl/types";
import type { Prettify } from "./_internal/type-utils.js";
import type { CompiledQuery } from "./compiled-query.js";
import type {
  CompositeKeys,
  CompositeValues,
  FhirSchema,
  IncludeFor,
  ResolveProfile,
  RevIncludeFor,
  SearchParamFor,
  SearchPrefixFor,
  SortDirection,
} from "./types.js";

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
  compile(): CompiledQuery;

  execute(): Promise<S["resources"][RT] & Resource>;
}
