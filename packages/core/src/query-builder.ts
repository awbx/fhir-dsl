import type { Resource, SearchParam } from "@fhir-dsl/types";
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
> {
  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  whereComposite<K extends string & CompositeKeys<SP>>(
    param: K,
    values: CompositeValues<SP[K]>,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
  ): SearchQueryBuilder<S, RT, SP, Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never), Prof>;

  revinclude<SrcRT extends string & keyof RevIncludeFor<S, RT>, Param extends string & RevIncludeFor<S, RT>[SrcRT]>(
    sourceResource: SrcRT,
    param: Param,
  ): SearchQueryBuilder<S, RT, SP, Inc | SrcRT, Prof>;

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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  sort(param: string & keyof SP, direction?: SortDirection): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  count(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  offset(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  compile(): CompiledQuery;

  execute(): Promise<
    SearchResult<
      ResolveProfile<S, RT, Prof> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >
  >;

  stream(options?: StreamOptions): AsyncIterable<ResolveProfile<S, RT, Prof> & Resource>;
}

// --- Read Query Builder Interface ---

export interface ReadQueryBuilder<S extends FhirSchema, RT extends string> {
  compile(): CompiledQuery;

  execute(): Promise<S["resources"][RT] & Resource>;
}
