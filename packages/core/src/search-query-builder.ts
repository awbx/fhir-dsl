import type { Resource } from "@fhir-dsl/types";
import type { CompiledQuery, CompiledSearchParam } from "./compiled-query.js";
import type { BundleLink, SearchQueryBuilder, SearchResult } from "./query-builder.js";
import type { IncludeFor, ResolveProfile, SearchPrefixFor, SortDirection } from "./types.js";

// --- Internal query state ---

interface QueryState {
  resourceType: string;
  params: CompiledSearchParam[];
  includes: string[];
  sorts: Array<{ param: string; direction: SortDirection }>;
  count?: number;
  offset?: number;
  profile?: string;
}

export type Executor = (query: CompiledQuery) => Promise<unknown>;

// --- Immutable Search Query Builder Implementation ---

export class SearchQueryBuilderImpl<
  RM extends Record<string, any>,
  RT extends string,
  SP extends Record<string, any>,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
> implements SearchQueryBuilder<RM, RT, SP, Inc, Prof>
{
  readonly #state: QueryState;
  readonly #executor: Executor;

  constructor(resourceType: string, executor: Executor, state?: QueryState, profile?: string) {
    this.#executor = executor;
    this.#state = state ?? {
      resourceType,
      params: [],
      includes: [],
      sorts: [],
      profile,
    };
  }

  where<K extends string & keyof SP>(
    param: K,
    op: SearchPrefixFor<SP[K]>,
    value: SP[K]["value"],
  ): SearchQueryBuilder<RM, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<RM, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
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

  include<K extends string & keyof IncludeFor<RT>>(
    param: K,
  ): SearchQueryBuilder<RM, RT, SP, Inc | (IncludeFor<RT>[K] extends string ? IncludeFor<RT>[K] : never), Prof> {
    return new SearchQueryBuilderImpl(this.#state.resourceType, this.#executor, {
      ...this.#state,
      includes: [...this.#state.includes, param],
    });
  }

  sort(param: string & keyof SP, direction: SortDirection = "asc"): SearchQueryBuilder<RM, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<RM, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      sorts: [...this.#state.sorts, { param, direction }],
    });
  }

  count(n: number): SearchQueryBuilder<RM, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<RM, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
      ...this.#state,
      count: n,
    });
  }

  offset(n: number): SearchQueryBuilder<RM, RT, SP, Inc, Prof> {
    return new SearchQueryBuilderImpl<RM, RT, SP, Inc, Prof>(this.#state.resourceType, this.#executor, {
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

  async execute(): Promise<SearchResult<ResolveProfile<RM, RT, Prof> & Resource, [Inc] extends [never] ? never : any>> {
    const query = this.compile();
    const bundle = (await this.#executor(query)) as any;

    const entries: Array<{ resource?: any; search?: { mode?: string } }> = bundle.entry ?? [];

    const data: Array<ResolveProfile<RM, RT, Prof> & Resource> = [];
    const included: Array<Resource> = [];

    for (const entry of entries) {
      if (!entry.resource) continue;
      if (entry.search?.mode === "include") {
        included.push(entry.resource);
      } else {
        data.push(entry.resource);
      }
    }

    const links: BundleLink[] | undefined = bundle.link;

    return {
      data,
      included: included as any,
      total: bundle.total,
      link: links,
      raw: bundle,
    };
  }
}
