import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { FhirSchema, IncludeFor, ResolveProfile, SearchPrefixFor, SortDirection } from "./types.js";

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

type ResolveIncluded<S extends FhirSchema, IncludedTypes extends string> = IncludedTypes extends keyof S["resources"]
  ? S["resources"][IncludedTypes]
  : never;

// --- Search Query Builder Interface ---

export interface SearchQueryBuilder<
  S extends FhirSchema,
  RT extends string,
  SP = Record<string, any>,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
> {
  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof>;

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
  ): SearchQueryBuilder<S, RT, SP, Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never), Prof>;

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
}

// --- Read Query Builder Interface ---

export interface ReadQueryBuilder<S extends FhirSchema, RT extends string> {
  compile(): CompiledQuery;

  execute(): Promise<S["resources"][RT] & Resource>;
}
