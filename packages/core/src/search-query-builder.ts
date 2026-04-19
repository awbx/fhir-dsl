import type { Bundle, Resource } from "@fhir-dsl/types";
import { escapeSearchValue } from "./_internal/escape-search-value.js";
import { classifyOp } from "./_internal/op-classifier.js";
import type { CompiledQuery, CompiledSearchParam } from "./compiled-query.js";
import { compileConditionTree } from "./condition-tree.js";
import {
  type ApplySelection,
  type BundleLink,
  type ContainedMode,
  type ContainedTypeMode,
  type ExecuteOptions,
  mergePreferIntoQuery,
  type ResolveIncluded,
  type SearchQueryBuilder,
  type SearchResult,
  type StreamOptions,
  type SummaryMode,
  type TotalMode,
} from "./query-builder.js";
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
import { resolveSchema, type SchemaRegistry, ValidationUnavailableError, validateOne } from "./validation.js";
import { type Condition, createWhereBuilder, type WhereBuilder } from "./where-builder.js";

// --- Internal query state ---

interface QueryState {
  resourceType: string;
  params: CompiledSearchParam[];
  includes: Array<{ value: string; iterate?: boolean }>;
  revIncludes: Array<{ value: string; iterate?: boolean }>;
  sorts: Array<{ param: string; direction: SortDirection }>;
  count?: number | undefined;
  offset?: number | undefined;
  profile?: string | undefined;
  fieldSelection?: readonly string[] | undefined;
  validate?: boolean | undefined;
  ids?: string[] | undefined;
  lastUpdated?: Array<{ prefix?: string; value: string }> | undefined;
  tags?: string[] | undefined;
  securityLabels?: string[] | undefined;
  source?: string | undefined;
  summary?: SummaryMode | undefined;
  total?: TotalMode | undefined;
  contained?: ContainedMode | undefined;
  containedType?: ContainedTypeMode | undefined;
  usePost?: boolean | undefined;
  autoPostThreshold?: number | undefined;
}

const DEFAULT_AUTO_POST_THRESHOLD = 1900;

function encodeParam(param: CompiledSearchParam): { name: string; value: string } {
  const name = param.modifier ? `${param.name}:${param.modifier}` : param.name;
  const value = param.prefix ? `${param.prefix}${param.value}` : String(param.value);
  return { name, value };
}

function paramsToFormBody(params: CompiledSearchParam[]): string {
  const usp = new URLSearchParams();
  for (const param of params) {
    const { name, value } = encodeParam(param);
    usp.append(name, value);
  }
  return usp.toString();
}

export type Executor = (query: CompiledQuery, signal?: AbortSignal) => Promise<unknown>;
export type UrlExecutor = (url: string, signal?: AbortSignal) => Promise<unknown>;

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
  readonly #schemas: SchemaRegistry | undefined;

  constructor(
    resourceType: string,
    executor: Executor,
    state?: QueryState,
    profile?: string,
    urlExecutor?: UrlExecutor,
    schemas?: SchemaRegistry,
  ) {
    this.#executor = executor;
    this.#urlExecutor = urlExecutor;
    this.#schemas = schemas;
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
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  where<K extends string & keyof SP>(
    param: K,
    op: "eq",
    values: readonly (SP[K] extends { value: infer V } ? V : string)[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  where(callback: (eb: WhereBuilder<SP>) => Condition<SP>): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  where(paramOrCallback: unknown, op?: unknown, value?: unknown): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    if (typeof paramOrCallback === "function") {
      const tree = (paramOrCallback as (eb: WhereBuilder<SP>) => Condition<SP>)(createWhereBuilder<SP>());
      const newParams = compileConditionTree(tree);
      return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
        this.#state.resourceType,
        this.#executor,
        { ...this.#state, params: [...this.#state.params, ...newParams] },
        undefined,
        this.#urlExecutor,
        this.#schemas,
      );
    }
    const param = paramOrCallback as string;
    if (Array.isArray(value)) {
      if (op !== "eq") {
        throw new Error(
          `where(${JSON.stringify(param)}, ...): array values require the "eq" operator (got "${String(op)}"). FHIR forbids per-value prefixes inside an OR list.`,
        );
      }
      // §3.2.1.5.7: escape separator chars in each OR value before joining on `,`.
      const joined = (value as readonly (string | number)[]).map((v) => escapeSearchValue(v)).join(",");
      return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
        this.#state.resourceType,
        this.#executor,
        {
          ...this.#state,
          params: [...this.#state.params, { name: param, value: joined }],
        },
        undefined,
        this.#urlExecutor,
        this.#schemas,
      );
    }
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [
          ...this.#state.params,
          {
            name: param,
            ...classifyOp(op as string, param),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  whereIn<K extends string & keyof SP>(
    param: K,
    values: readonly (SP[K] extends { value: infer V } ? V : string)[],
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return this.where(param, "eq" as SearchPrefixFor<SP[K]>, values as never);
  }

  whereMissing<K extends string & keyof SP>(param: K, missing: boolean): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [...this.#state.params, { name: param, modifier: "missing", value: missing ? "true" : "false" }],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  whereId(...ids: string[]): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, ids: [...(this.#state.ids ?? []), ...ids] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  whereLastUpdated(op: DatePrefix, value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    const entry = op === "eq" ? { value } : { prefix: op, value };
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, lastUpdated: [...(this.#state.lastUpdated ?? []), entry] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  withTag(value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, tags: [...(this.#state.tags ?? []), value] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  withSecurity(value: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, securityLabels: [...(this.#state.securityLabels ?? []), value] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  fromSource(uri: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, source: uri },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  summary(mode: SummaryMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, summary: mode },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  total(mode: TotalMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, total: mode },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  contained(mode: ContainedMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, contained: mode },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  containedType(mode: ContainedTypeMode): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, containedType: mode },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  whereComposite<K extends string & CompositeKeys<SP>>(
    param: K,
    values: CompositeValues<SP[K]>,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    // §3.2.1.5.8: escape separator chars in each component before joining on `$`.
    const compositeValue = Object.values(values as Record<string, string | number>)
      .map((v) => escapeSearchValue(v))
      .join("$");
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
      this.#schemas,
    );
  }

  include<K extends string & keyof IncludeFor<S, RT>>(
    param: K,
    options?: { iterate?: boolean },
  ): SearchQueryBuilder<
    S,
    RT,
    SP,
    Inc | (IncludeFor<S, RT>[K] extends string ? IncludeFor<S, RT>[K] : never),
    Prof,
    Sel
  > {
    const entry: { value: string; iterate?: boolean } = options?.iterate
      ? { value: param, iterate: true }
      : { value: param };
    return new SearchQueryBuilderImpl(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        includes: [...this.#state.includes, entry],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  revinclude<SrcRT extends string & keyof RevIncludeFor<S, RT>, Param extends string & RevIncludeFor<S, RT>[SrcRT]>(
    sourceResource: SrcRT,
    param: Param,
    options?: { iterate?: boolean },
  ): SearchQueryBuilder<S, RT, SP, Inc | SrcRT, Prof, Sel> {
    const value = `${sourceResource}:${param}`;
    const entry: { value: string; iterate?: boolean } = options?.iterate ? { value, iterate: true } : { value };
    return new SearchQueryBuilderImpl(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        revIncludes: [...this.#state.revIncludes, entry],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
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
            ...classifyOp(op as string),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  whereChain(
    hops: readonly (readonly [string, string])[],
    terminalParam: string,
    op: string,
    value: unknown,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    if (hops.length === 0) {
      throw new Error("whereChain requires at least one hop");
    }
    // R5 §3.2.1.5: type-scope disambiguates a reference that could resolve to
    // more than one resource type. The terminal hop's type is already fixed
    // by `terminalParam` (the search-param lookup is resolved against it),
    // so the last hop doesn't need a `:Type` suffix. Intermediate hops keep
    // their type so servers can pick the right join target. Without this,
    // queries like `subject:Patient.general-practitioner:Practitioner.name`
    // were strictly noisier than necessary and could collide with servers
    // that reject type-scope on the terminal reference.
    const lastIdx = hops.length - 1;
    const parts = hops.map(([ref, type], i) => (i === lastIdx ? ref : `${ref}:${type}`));
    const name = `${parts.join(".")}.${terminalParam}`;
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        params: [...this.#state.params, { name, ...classifyOp(op), value: value as string | number }],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
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
            ...classifyOp(op as string),
            value: value as string | number,
          },
        ],
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
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
      this.#schemas,
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
      this.#schemas,
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
      this.#schemas,
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
      this.#schemas,
    );
  }

  validate(): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    if (!this.#schemas) throw new ValidationUnavailableError();
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      {
        ...this.#state,
        validate: true,
      },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  usePost(): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, usePost: true },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  getUrlByteLimit(bytes: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, autoPostThreshold: bytes },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  filter(expression: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return this.#withParam("_filter", expression);
  }

  namedQuery(name: string, extras?: Record<string, string | number>): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    const newParams: CompiledSearchParam[] = [{ name: "_query", value: name }];
    if (extras) {
      for (const [k, v] of Object.entries(extras)) {
        newParams.push({ name: k, value: v });
      }
    }
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, params: [...this.#state.params, ...newParams] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  text(query: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return this.#withParam("_text", query);
  }

  content(query: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return this.#withParam("_content", query);
  }

  inList(listId: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return this.#withParam("_list", listId);
  }

  #withParam(name: string, value: string | number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel> {
    return new SearchQueryBuilderImpl<S, RT, SP, Inc, Prof, Sel>(
      this.#state.resourceType,
      this.#executor,
      { ...this.#state, params: [...this.#state.params, { name, value }] },
      undefined,
      this.#urlExecutor,
      this.#schemas,
    );
  }

  $if(condition: boolean, callback: (qb: this) => this): this {
    return condition ? callback(this) : this;
  }

  $call<R>(callback: (qb: this) => R): R {
    return callback(this);
  }

  compile(): CompiledQuery {
    const params: CompiledSearchParam[] = [...this.#state.params];

    if (this.#state.ids && this.#state.ids.length > 0) {
      params.push({ name: "_id", value: this.#state.ids.join(",") });
    }

    if (this.#state.lastUpdated) {
      for (const entry of this.#state.lastUpdated) {
        params.push(
          entry.prefix
            ? { name: "_lastUpdated", prefix: entry.prefix, value: entry.value }
            : { name: "_lastUpdated", value: entry.value },
        );
      }
    }

    if (this.#state.tags) {
      for (const tag of this.#state.tags) {
        params.push({ name: "_tag", value: tag });
      }
    }

    if (this.#state.securityLabels) {
      for (const label of this.#state.securityLabels) {
        params.push({ name: "_security", value: label });
      }
    }

    if (this.#state.source !== undefined) {
      params.push({ name: "_source", value: this.#state.source });
    }

    if (this.#state.profile) {
      params.push({ name: "_profile", value: this.#state.profile });
    }

    for (const inc of this.#state.includes) {
      const value = `${this.#state.resourceType}:${inc.value}`;
      params.push(inc.iterate ? { name: "_include", modifier: "iterate", value } : { name: "_include", value });
    }

    for (const revInc of this.#state.revIncludes) {
      params.push(
        revInc.iterate
          ? { name: "_revinclude", modifier: "iterate", value: revInc.value }
          : { name: "_revinclude", value: revInc.value },
      );
    }

    if (this.#state.summary !== undefined) {
      params.push({ name: "_summary", value: this.#state.summary });
    }

    if (this.#state.total !== undefined) {
      params.push({ name: "_total", value: this.#state.total });
    }

    if (this.#state.contained !== undefined) {
      params.push({ name: "_contained", value: this.#state.contained });
    }

    if (this.#state.containedType !== undefined) {
      params.push({ name: "_containedType", value: this.#state.containedType });
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

    // §3.1.1.1: auto-POST upgrades trigger on the GET URL's own wire length.
    // Measuring the form-body (BUG-017) under-counts by the path + "?" bytes,
    // so borderline queries slip past the threshold and then get rejected by
    // servers with URL length caps. Include the path and the separator.
    const threshold = this.#state.autoPostThreshold ?? DEFAULT_AUTO_POST_THRESHOLD;
    const queryString = paramsToFormBody(params);
    const getUrlBytes = this.#state.resourceType.length + (queryString.length > 0 ? 1 : 0) + queryString.length;
    const wouldExceedThreshold = getUrlBytes > threshold;

    if (this.#state.usePost || wouldExceedThreshold) {
      return {
        method: "POST",
        path: `${this.#state.resourceType}/_search`,
        params: [],
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: paramsToFormBody(params),
      };
    }

    return {
      method: "GET",
      path: this.#state.resourceType,
      params,
    };
  }

  async execute(
    options?: ExecuteOptions,
  ): Promise<
    SearchResult<
      ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource,
      [Inc] extends [never] ? never : ResolveIncluded<S, Inc> & Resource
    >
  > {
    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    const bundle = (await this.#executor(query, options?.signal)) as Bundle;

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

    if (this.#state.validate) {
      if (!this.#schemas) throw new ValidationUnavailableError();
      const schema = resolveSchema(this.#schemas, this.#state.resourceType, this.#state.profile);
      for (let i = 0; i < data.length; i++) {
        await validateOne(schema, this.#state.resourceType, data[i], i);
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

    const query = mergePreferIntoQuery(this.compile(), options?.prefer);
    let bundle = (await this.#executor(query, options?.signal)) as Bundle;

    let schema: ReturnType<typeof resolveSchema> | undefined;
    if (this.#state.validate) {
      if (!this.#schemas) throw new ValidationUnavailableError();
      schema = resolveSchema(this.#schemas, this.#state.resourceType, this.#state.profile);
    }
    let index = 0;

    while (bundle) {
      options?.signal?.throwIfAborted();

      const entries = bundle.entry ?? [];
      for (const entry of entries) {
        if (!entry.resource) continue;
        if (entry.search?.mode === "include") continue;
        if (schema) {
          await validateOne(schema, this.#state.resourceType, entry.resource, index);
        }
        index++;
        yield entry.resource as R;
      }

      const nextLink = bundle.link?.find((l) => l.relation === "next");
      if (nextLink?.url && this.#urlExecutor) {
        bundle = (await this.#urlExecutor(nextLink.url, options?.signal)) as Bundle;
      } else {
        break;
      }
    }
  }
}
