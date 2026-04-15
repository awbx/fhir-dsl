import type { Bundle, Resource } from "@fhir-dsl/types";
import type { CompiledQuery, CompiledSearchParam } from "./compiled-query.js";
import type { BundleLink, ResolveIncluded, SearchQueryBuilder, SearchResult } from "./query-builder.js";
import type {
  FhirSchema,
  IncludeFor,
  ResolveProfile,
  RevIncludeFor,
  SearchParamFor,
  SearchPrefixFor,
  SortDirection,
} from "./types.js";

// --- Internal query state ---

interface QueryState {
  resourceType: string;
  params: CompiledSearchParam[];
  includes: string[];
  revIncludes: string[];
  sorts: Array<{ param: string; direction: SortDirection }>;
  count?: number | undefined;
  offset?: number | undefined;
  profile?: string | undefined;
}

export type Executor = (query: CompiledQuery) => Promise<unknown>;

// --- Immutable Search Query Builder Implementation ---

export class SearchQueryBuilderImpl<
  S extends FhirSchema,
  RT extends string,
  SP,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
> implements SearchQueryBuilder<S, RT, SP, Inc, Prof>
{
  readonly #state: QueryState;
  readonly #executor: Executor;

  constructor(resourceType: string, executor: Executor, state?: QueryState, profile?: string) {
    this.#executor = executor;
    this.#state = state ?? {
      resourceType,
      params: [],
      includes: [],
      revIncludes: [],
      sorts: [],
      profile,
    };
  }

  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      params: [
        ...this.#state.params,
        {
          name: param,
          prefix: op === "eq" ? undefined : (op as string),
          value: value as string | number,
        },
      ],
    });
  }

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
  ): SearchQueryBuilder<S, RT, SP, Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never), Prof> {
    return new SearchQueryBuilderImpl(this.#state.resourceType, this.#executor, {
      ...this.#state,
      includes: [...this.#state.includes, param],
    });
  }

  revinclude<SrcRT extends string & keyof RevIncludeFor<S, RT>, Param extends string & RevIncludeFor<S, RT>[SrcRT]>(
    sourceResource: SrcRT,
    param: Param,
  ): SearchQueryBuilder<S, RT, SP, Inc | SrcRT, Prof> {
    return new SearchQueryBuilderImpl(this.#state.resourceType, this.#executor, {
      ...this.#state,
      revIncludes: [...this.#state.revIncludes, `${sourceResource}:${param}`],
    });
  }

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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    const name = `${refParam}:${targetResource}.${targetParam}`;
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      params: [
        ...this.#state.params,
        {
          name,
          prefix: op === "eq" ? undefined : (op as string),
          value: value as string | number,
        },
      ],
    });
  }

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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    const name = `_has:${sourceResource}:${refParam}:${searchParam}`;
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      params: [
        ...this.#state.params,
        {
          name,
          prefix: op === "eq" ? undefined : (op as string),
          value: value as string | number,
        },
      ],
    });
  }

  sort(param: string & keyof SP, direction: SortDirection = "asc"): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      sorts: [...this.#state.sorts, { param, direction }],
    });
  }

  count(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      count: n,
    });
  }

  offset(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      offset: n,
    });
  }

  compile(): CompiledQuery {
    const params: CompiledSearchParam[] = [...this.#state.params];

    if (this.#state.profile) {
      params.push({ name: "_profile", value: this.#state.profile });
    }

    for (const inc of this.#state.includes) {
      params.push({
        name: "_include",
        value: `${this.#state.resourceType}:${inc}`,
      });
    }

    for (const revInc of this.#state.revIncludes) {
      params.push({
        name: "_revinclude",
        value: revInc,
      });
    }

    if (this.#state.sorts.length > 0) {
      const sortValue = this.#state.sorts.map((s) => (s.direction === "desc" ? `-${s.param}` : s.param)).join(",");
      params.push({ name: "_sort", value: sortValue });
    }

    if (this.#state.count !== undefined) {
      params.push({ name: "_count", value: this.#state.count });
    }

    if (this.#state.offset !== undefined) {
      params.push({ name: "_offset", value: this.#state.offset });
    }

    return {
      method: "GET",
      path: this.#state.resourceType,
      params,
    };
  }

  async execute(): Promise<
    SearchResult<
      ResolveProfile<S, RT, Prof> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >
  > {
    const query = this.compile();
    const bundle = (await this.#executor(query)) as Bundle;

    const entries = bundle.entry ?? [];

    const data: Array<ResolveProfile<S, RT, Prof> & Resource> = [];
    const included: Resource[] = [];

    for (const entry of entries) {
      if (!entry.resource) continue;
      if (entry.search?.mode === "include") {
        included.push(entry.resource);
      } else {
        data.push(entry.resource as ResolveProfile<S, RT, Prof> & Resource);
      }
    }

    const links: BundleLink[] | undefined = bundle.link;

    type ResultType = SearchResult<
      ResolveProfile<S, RT, Prof> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >;

    return {
      data,
      included,
      total: bundle.total,
      link: links,
      raw: bundle,
    } as ResultType;
  }
}
