import type { Bundle, Resource } from "@fhir-dsl/types";
import type { CompiledQuery, CompiledSearchParam } from "./compiled-query.js";
import type {
  ApplySelection,
  BundleLink,
  ResolveIncluded,
  SearchQueryBuilder,
  SearchResult,
  StreamOptions,
} from "./query-builder.js";
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
  fieldSelection?: readonly string[] | undefined;
}

export type Executor = (query: CompiledQuery) => Promise<unknown>;
export type UrlExecutor = (url: string) => Promise<unknown>;

// --- Immutable Search Query Builder Implementation ---

export class SearchQueryBuilderImpl<
  S extends FhirSchema,
  RT extends string,
  SP,
  Inc extends string = never,
  Prof extends string | undefined = undefined,
  Sel extends string = never,
> implements SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>
{
  readonly #state: QueryState;
  readonly #executor: Executor;
  readonly #urlExecutor: UrlExecutor | undefined;

  constructor(
    resourceType: string,
    executor: Executor,
    state?: QueryState,
    profile?: string,
    urlExecutor?: UrlExecutor,
  ) {
    this.#executor = executor;
    this.#urlExecutor = urlExecutor;
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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [
          ...this.#state.params,
          {
            name: param,
            prefix: op === "eq" ? undefined : (op as string),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
    );
  }

  whereComposite<K extends string & CompositeKeys<SP>>(
    param: K,
    values: CompositeValues<SP[K]>,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    const compositeValue = Object.values(values as Record<string, string | number>).join("$");
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [
          ...this.#state.params,
          {
            name: param,
            value: compositeValue,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
    );
  }

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
  ): SearchQueryBuilder<
    S,
    RT,
    SP,
    Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never),
    Prof,
    Sel
  > {
    return new SearchQueryBuilderImpl(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        includes: [...this.#state.includes, param],
      },
      undefined,
      this.#urlExecutor,
    );
  }

  revinclude<SrcRT extends string & keyof RevIncludeFor<S, RT>, Param extends string & RevIncludeFor<S, RT>[SrcRT]>(
    sourceResource: SrcRT,
    param: Param,
  ): SearchQueryBuilder<S, RT, SP, Inc | SrcRT, Prof, Sel> {
    return new SearchQueryBuilderImpl(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        revIncludes: [...this.#state.revIncludes, `${sourceResource}:${param}`],
      },
      undefined,
      this.#urlExecutor,
    );
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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    const name = `${refParam}:${targetResource}.${targetParam}`;
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [
          ...this.#state.params,
          {
            name,
            prefix: op === "eq" ? undefined : (op as string),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
    );
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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    const name = `_has:${sourceResource}:${refParam}:${searchParam}`;
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [
          ...this.#state.params,
          {
            name,
            prefix: op === "eq" ? undefined : (op as string),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
    );
  }

  sort(param: string & keyof SP, direction: SortDirection = "asc"): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        sorts: [...this.#state.sorts, { param, direction }],
      },
      undefined,
      this.#urlExecutor,
    );
  }

  count(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        count: n,
      },
      undefined,
      this.#urlExecutor,
    );
  }

  offset(n: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        offset: n,
      },
      undefined,
      this.#urlExecutor,
    );
  }

  select<K extends string & keyof ResolveProfile<S, RT, Prof>>(
    fields: readonly K[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, K> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, K>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        fieldSelection: fields,
      },
      undefined,
      this.#urlExecutor,
    );
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

    if (this.#state.fieldSelection && this.#state.fieldSelection.length > 0) {
      params.push({ name: "_elements", value: this.#state.fieldSelection.join(",") });
    }

    return {
      method: "GET",
      path: this.#state.resourceType,
      params,
    };
  }

  async execute(): Promise<
    SearchResult<
      ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >
  > {
    const query = this.compile();
    const bundle = (await this.#executor(query)) as Bundle;

    const entries = bundle.entry ?? [];

    type PrimaryType = ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource;
    const data: PrimaryType[] = [];
    const included: Resource[] = [];

    for (const entry of entries) {
      if (!entry.resource) continue;
      if (entry.search?.mode === "include") {
        included.push(entry.resource);
      } else {
        data.push(entry.resource as PrimaryType);
      }
    }

    const links: BundleLink[] | undefined = bundle.link;

    type ResultType = SearchResult<PrimaryType, [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource>;

    return {
      data,
      included,
      total: bundle.total,
      link: links,
      raw: bundle,
    } as ResultType;
  }

  async *stream(options?: StreamOptions): AsyncIterable<ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource> {
    type R = ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource;

    const query = this.compile();
    let bundle = (await this.#executor(query)) as Bundle;

    while (bundle) {
      options?.signal?.throwIfAborted();

      const entries = bundle.entry ?? [];
      for (const entry of entries) {
        if (!entry.resource) continue;
        if (entry.search?.mode === "include") continue;
        yield entry.resource as R;
      }

      const nextLink = bundle.link?.find((l) => l.relation === "next");
      if (nextLink?.url && this.#urlExecutor) {
        bundle = (await this.#urlExecutor(nextLink.url)) as Bundle;
      } else {
        break;
      }
    }
  }
}
