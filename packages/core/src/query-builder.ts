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
import type { Condition, WhereBuilder } from "./where-builder.js";

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

// --- Execute / Stream Options ---

/**
 * FHIR R5 §3.2.0.1.6 / §3.2.0.1.9 — typed `Prefer:` directives. The strings
 * this compiles to follow RFC 7240 syntax (semicolon-separated tokens).
 */
export interface PreferOptions {
  /**
   * `return=minimal` (no body), `return=representation` (full resource), or
   * `return=OperationOutcome` (issues-only).
   */
  return?: "minimal" | "representation" | "OperationOutcome";
  /**
   * `handling=strict` — reject unknown search params with 400.
   * `handling=lenient` — best-effort processing.
   */
  handling?: "strict" | "lenient";
  /** `respond-async` — request async execution per §3.2.6. */
  respondAsync?: boolean;
}

export interface ExecuteOptions {
  /**
   * AbortSignal that cancels the in-flight request. If the signal is already
   * aborted when `.execute()` is called, the promise rejects immediately with
   * an `AbortError`; otherwise the in-flight `fetch()` is aborted.
   */
  signal?: AbortSignal;
  /** Typed `Prefer:` directives merged into request headers before dispatch. */
  prefer?: PreferOptions;
}

export interface StreamOptions {
  signal?: AbortSignal;
  prefer?: PreferOptions;
}

export function compilePreferHeader(options: PreferOptions | undefined): string | undefined {
  if (!options) return undefined;
  const parts: string[] = [];
  if (options.return) parts.push(`return=${options.return}`);
  if (options.handling) parts.push(`handling=${options.handling}`);
  if (options.respondAsync) parts.push("respond-async");
  return parts.length > 0 ? parts.join(", ") : undefined;
}

export function mergePreferIntoQuery<Q extends { headers?: Record<string, string> | undefined }>(
  query: Q,
  prefer: PreferOptions | undefined,
): Q {
  const header = compilePreferHeader(prefer);
  if (header === undefined) return query;
  return {
    ...query,
    headers: { ...query.headers, Prefer: header },
  };
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
   * Composable conditions via callback. Returns a `Condition<SP>` tree built with
   * `eb.and([...])` / `eb.or([...])`. The compiler picks the most natural FHIR shape:
   *
   * - AND of plain tuples → one query param per tuple (FHIR's implicit AND).
   * - OR of `eq` tuples sharing one param-name → a single comma-joined param.
   * - Anything else → a single `_filter=<FHIRPath>` param.
   *
   * Operators that can't be expressed in `_filter` (`exact`, `above`, `below`,
   * `of-type`, `text`, `identifier`, `code-text`, `missing`) cannot appear inside
   * an OR or nested group — use the positional `where` form for those.
   */
  where(callback: (eb: WhereBuilder<SP>) => Condition<SP>): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

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
    options?: { iterate?: boolean },
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
    options?: { iterate?: boolean },
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

  /**
   * Multi-hop typed chain. Each hop is `[refParam, targetResourceType]`. The terminal
   * param is searched on the last resource in the chain.
   *
   * Example:
   * ```ts
   * client.search("Observation").whereChain(
   *   [["subject", "Patient"], ["organization", "Organization"]],
   *   "name", "eq", "Acme",
   * )
   * // emits: subject:Patient.organization:Organization.name=Acme
   * ```
   *
   * Typing narrows each hop. Up to 3 hops are typed end-to-end; for deeper chains
   * pass `[string, string][]` and rely on the runtime to validate.
   */
  whereChain<
    R1 extends string & keyof IncludeFor<S, RT>,
    T1 extends string & (IncludeFor<S, RT>[R1] extends string ? IncludeFor<S, RT>[R1] : never),
    K extends string & keyof SearchParamFor<S, T1>,
  >(
    hops: readonly [readonly [R1, T1]],
    terminalParam: K,
    op: SearchPrefixFor<SearchParamFor<S, T1>[K]>,
    value: SearchParamFor<S, T1>[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  whereChain<
    R1 extends string & keyof IncludeFor<S, RT>,
    T1 extends string & (IncludeFor<S, RT>[R1] extends string ? IncludeFor<S, RT>[R1] : never),
    R2 extends string & keyof IncludeFor<S, T1>,
    T2 extends string & (IncludeFor<S, T1>[R2] extends string ? IncludeFor<S, T1>[R2] : never),
    K extends string & keyof SearchParamFor<S, T2>,
  >(
    hops: readonly [readonly [R1, T1], readonly [R2, T2]],
    terminalParam: K,
    op: SearchPrefixFor<SearchParamFor<S, T2>[K]>,
    value: SearchParamFor<S, T2>[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  whereChain<
    R1 extends string & keyof IncludeFor<S, RT>,
    T1 extends string & (IncludeFor<S, RT>[R1] extends string ? IncludeFor<S, RT>[R1] : never),
    R2 extends string & keyof IncludeFor<S, T1>,
    T2 extends string & (IncludeFor<S, T1>[R2] extends string ? IncludeFor<S, T1>[R2] : never),
    R3 extends string & keyof IncludeFor<S, T2>,
    T3 extends string & (IncludeFor<S, T2>[R3] extends string ? IncludeFor<S, T2>[R3] : never),
    K extends string & keyof SearchParamFor<S, T3>,
  >(
    hops: readonly [readonly [R1, T1], readonly [R2, T2], readonly [R3, T3]],
    terminalParam: K,
    op: SearchPrefixFor<SearchParamFor<S, T3>[K]>,
    value: SearchParamFor<S, T3>[K] extends { value: infer V } ? V : string,
  ): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;
  whereChain(
    hops: readonly (readonly [string, string])[],
    terminalParam: string,
    op: string,
    value: string | number,
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

  /**
   * Configure the byte ceiling that triggers an automatic upgrade from GET to
   * POST `[type]/_search`. The decision is measured against the GET URL's own
   * wire bytes — resourceType + "?" + query string — not against a separate
   * form-body encoding (spec §3.1.1.1, BUG-017). Defaults to 1900 bytes.
   */
  getUrlByteLimit(bytes: number): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * FHIR `_filter` — server-side advanced filter expression.
   *
   * Accepts either a raw FHIRPath string or any object with a `compile(): string`
   * method (including `FhirPathExpr` from `@fhir-dsl/fhirpath`), so the typed
   * expression builder can be passed directly without calling `.compile()`.
   */
  filter(expression: string | { compile(): string }): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_query` — invoke a named search (e.g. `_query=patient-by-meds`) with optional extra params. */
  namedQuery(name: string, params?: Record<string, string | number>): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_text` — full-text narrative search. */
  text(query: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_content` — full-text content search across the resource. */
  content(query: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /** FHIR `_list` — restrict results to members of a List resource by id. */
  inList(listId: string): SearchQueryBuilder<S, RT, SP, Inc, Prof, Sel>;

  /**
   * Conditionally apply a callback. When `condition` is true, returns
   * `callback(this)`; otherwise returns the builder unchanged. The callback's
   * return type is constrained to the same builder so chaining stays inferred.
   */
  $if(condition: boolean, callback: (qb: this) => this): this;

  /**
   * Apply a transformer to the builder. Lets callers extract reusable query
   * fragments (e.g. `qb.$call(onlyFinal)`). Returns whatever the callback
   * returns.
   */
  $call<R>(callback: (qb: this) => R): R;

  compile(): CompiledQuery;

  execute(
    options?: ExecuteOptions,
  ): Promise<
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

  /**
   * FHIR R5 §3.1.0.2: `If-None-Match` — conditional read; server returns 304 when the
   * supplied ETag matches the current version.
   */
  ifNoneMatch(etag: string): ReadQueryBuilder<S, RT>;

  /**
   * FHIR R5 §3.1.0.2: `If-Modified-Since` — conditional read; server returns 304 when
   * the resource has not changed since the supplied HTTP-date.
   */
  ifModifiedSince(value: Date | string): ReadQueryBuilder<S, RT>;

  /** See {@link SearchQueryBuilder.$if}. */
  $if(condition: boolean, callback: (qb: this) => this): this;

  /** See {@link SearchQueryBuilder.$call}. */
  $call<R>(callback: (qb: this) => R): R;

  compile(): CompiledQuery;

  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
