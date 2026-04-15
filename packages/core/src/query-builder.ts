import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { IncludeFor, ResolveProfile, SearchPrefixFor, SortDirection } from "./types.js";

// --- Search Result Types ---

export interface BundleLink {
  relation: string;
  url: string;
}

export interface SearchResult<Primary extends Resource, Included extends Resource = never> {
  data: Primary[];
  included: [Included] extends [never] ? [] : Included[];
  total?: number;
  link?: BundleLink[];
  raw: unknown;
}

// --- Resolve included resource types from the resource map ---

type ResolveIncluded<RM extends Record<string, any>, IncludedTypes extends string> = IncludedTypes extends keyof RM
  ? RM[IncludedTypes]
  : never;

// --- Search Query Builder Interface ---

export interface SearchQueryBuilder<
  RM extends Record<string, any>,
  RT extends string,
  SP extends Record<string, any> = Record<string, any>,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
> {
  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K]["value"],
  ): SearchQueryBuilder<RM, RT, SP, Inc, Prof>;

  include<K extends string & keyof IncludeFor<RT>>(
    param: K,
  ): SearchQueryBuilder<RM, RT, SP, Inc | (IncludeFor<RT>[K] extends string ? IncludeFor<RT>[K] : never), Prof>;

  sort(param: string & keyof SP, direction?: SortDirection): SearchQueryBuilder<RM, RT, SP, Inc, Prof>;

  count(n: number): SearchQueryBuilder<RM, RT, SP, Inc, Prof>;

  offset(n: number): SearchQueryBuilder<RM, RT, SP, Inc, Prof>;

  compile(): CompiledQuery;

  execute(): Promise<
    SearchResult<
      ResolveProfile<RM, RT, Prof> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<RM, Inc> & Resource
    >
  >;
}

// --- Read Query Builder Interface ---

export interface ReadQueryBuilder<RM extends Record<string, any>, RT extends string> {
  compile(): CompiledQuery;

  execute(): Promise<RM[RT] & Resource>;
}
