---
sidebar_position: 1
title: "@fhir-dsl/core"
description: "Type-safe FHIR query builder DSL — search, read, create/update/delete/patch, transactions, batches, and operations."
---

# @fhir-dsl/core

## Overview
`@fhir-dsl/core` exposes the fluent query-builder DSL, the `FhirClient` surface, and the primitives every other package consumes (compiled queries, HTTP, retry, validation, condition trees). All builders are immutable — every chainable method returns a fresh instance, so partial builders are safe to share across requests. Execution terminals (`execute()`, `stream()`, `compile()`) are the only non-chainable methods.

## Installation
```bash
npm install @fhir-dsl/core
```

## Exports
| Name | Kind | One-liner |
|---|---|---|
| `createFhirClient` | function | Factory for a typed `FhirClient<S>`. |
| `FhirClient` | class | Top-level entry for search, read, CRUD, transaction, batch, operation, history, capabilities. |
| `FhirClientConfig` | interface | `{ baseUrl, auth?, headers?, fetch?, schemas?, retry?, async? }`. |
| `AsyncPollingConfig` | interface | `Prefer: respond-async` polling interval + max attempts. |
| `AsyncPollingTimeoutError` | class | Raised when async polling exceeds `maxAttempts`. |
| `FhirRequestError` | class | Thrown for non-2xx responses. |
| `SearchQueryBuilder` | interface | Fluent search DSL with 25+ chainable methods + 6 generic parameters. |
| `ReadQueryBuilder` | interface | `read()` builder with `validate`, `ifNoneMatch`, `ifModifiedSince`. |
| `VreadBuilder` | interface | Version-specific read at `[type]/[id]/_history/[vid]`. |
| `HistoryBuilder` | interface | `since`, `at`, `count`, `list`, `sort`. |
| `HistoryParams` | interface | `{ _since?, _at?, _count?, _list?, _sort? }`. |
| `HistoryScope` | type | `system` \| `type` \| `instance`. |
| `CapabilitiesBuilder` | interface | `GET metadata`. |
| `CreateBuilder` / `UpdateBuilder` / `DeleteBuilder` / `PatchBuilder` | interface | Per-resource CRUD builders. |
| `PatchFormat` | type | `"json-patch"` \| `"xml-patch"` \| `"fhirpath-patch"`. |
| `JsonPatchOperation` / `JsonPatchBody` | type | RFC 6902 shapes. |
| `TransactionBuilder` / `BatchBuilder` | interface | Atomic transactions and non-atomic batches with `$if` / `$call`. |
| `OperationBuilder` | interface | `$operation` invoker; auto-GETs when all params are primitive. |
| `OperationOptions` | interface | `{ scope?, parameters?, method? }`. |
| `OperationScope` | type | Tagged union: `kind` is `"system"` \| `"type"` \| `"instance"` plus optional `resourceType`/`id`. |
| `AuthConfig` | type | `AuthProvider` \| `StaticAuth`. |
| `AuthProvider` | interface | `{ getAuthorization({ url, method }), onUnauthorized? }`. |
| `StaticAuth` | interface | Object with `type` (`"bearer"` \| `"basic"`) and `credentials` string. |
| `isStaticAuth` / `resolveAuthProvider` | function | Auth helpers. |
| `RetryPolicy` / `RetryConfig` | type | Retry knobs (429/503 full-jitter backoff). |
| `DEFAULT_MAX_ATTEMPTS` / `DEFAULT_BASE_BACKOFF_MS` / `DEFAULT_MAX_BACKOFF_MS` / `DEFAULT_RETRY_STATUSES` | const | `3`, `100`, `30000`, `[429, 503]`. |
| `resolveRetryPolicy` / `parseRetryAfter` / `computeBackoffMs` | function | Retry primitives. |
| `WhereBuilder` / `createWhereBuilder` | interface / function | Callback-form condition tree builder. |
| `Condition` / `ConditionTuple` / `ConditionGroup` / `isConditionGroup` | type / function | Condition tree primitives. |
| `CompiledQuery` / `CompiledSearchParam` | interface | Wire representation emitted by `.compile()`. |
| `HttpMethod` | type | `"GET"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"PATCH"`. |
| `HttpRequest` / `HttpResponse` / `HttpConfig` / `performRequest` | type / function | Low-level HTTP primitives (fetch + auth + retry). |
| `PreferOptions` / `ExecuteOptions` / `StreamOptions` | interface | `Prefer:` directives and execute options. |
| `compilePreferHeader` / `mergePreferIntoQuery` | function | Header helpers for `Prefer:`. |
| `SchemaRegistry` / `StandardSchemaLike` / `StandardValidateResult` | type | Standard Schema v1 validation surface. |
| `ValidationError` / `ValidationUnavailableError` | class | Validation failures. |
| `resolveSchema` / `validateOne` | function | Validation helpers. |
| `FhirSchema` | interface | `{ resources, searchParams, includes, revIncludes?, profiles }`. |
| `SearchParamFor` / `IncludeFor` / `RevIncludeFor` / `ProfileFor` / `ProfileNames` / `ResolveProfile` | type | Schema projections. |
| `DatePrefix` / `NumberPrefix` / `QuantityPrefix` | type | `eq` \| `ne` \| `gt` \| `ge` \| `lt` \| `le` \| `sa` \| `eb` \| `ap`. |
| `StringModifier` / `TokenModifier` / `ReferenceModifier` / `UriModifier` / `SearchPrefixFor` | type | Operator and modifier unions per search-param kind. |
| `CompositeKeys` / `CompositeComponents` / `CompositeValues` / `ParamValue` / `SortDirection` | type | Schema-derived utility types. |
| `SearchResult` / `BundleLink` / `ApplySelection` / `ResolveIncluded` | type | Typed result of `search().execute()`. |
| `SummaryMode` / `TotalMode` / `ContainedMode` / `ContainedTypeMode` | type | Result-shaping enums. |
| `T` / `TExtensions` / `TransformedQuery` / `TransformedResult` | interface | `.transform(fn)` projection surface. `TExtensions<Scope>` is the declaration-merging slot for user-land helpers. |
| `registerTHelper` / `unregisterTHelper` | function | Mount / unmount a helper onto every `t` closure. |
| `Path` / `PathValue` / `PathToCodingArray` / `PathToSystemValueArray` | type | Typed dotted paths used by `t(path, ...)`. Arrays require explicit numeric segments; depth capped at 6. |
| `Scope` / `IncludeExpressionsFor` | type | Include-activated virtual resource shape passed to `t`. |

## API

### `createFhirClient`
**Signature**
```ts
function createFhirClient<S extends FhirSchema>(config: FhirClientConfig): FhirClient<S>;
```
**Parameters**
- `config: FhirClientConfig` — `{ baseUrl, auth?, headers?, fetch?, schemas?, retry?, async? }`. `baseUrl` is required; `schemas` must be supplied if any builder calls `.validate()`; `async` enables `Prefer: respond-async` 202 polling.

**Returns** — A typed `FhirClient<S>` bound to the generated schema `S`.

**Example**
```ts
import { createFhirClient } from "@fhir-dsl/core";
import type { Schema } from "./src/fhir/r4/schema";

const fhir = createFhirClient<Schema>({
  baseUrl: "https://hapi.fhir.org/baseR4",
  auth: { type: "bearer", credentials: process.env.FHIR_TOKEN! },
  retry: { maxAttempts: 3 },
  async: { pollingInterval: 2000, maxAttempts: 60 },
});
```

---

### `FhirClient`
**Signature**
```ts
class FhirClient<S extends FhirSchema> {
  search<RT extends string & keyof S["resources"]>(resourceType: RT): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>>;
  search<RT, P extends ProfileNames<S, RT>>(resourceType: RT, profile: P): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>, never, P>;
  searchAll(): SearchQueryBuilder<S, string, Record<string, { value: string }>>;
  read<RT>(resourceType: RT, id: string): ReadQueryBuilder<S, RT>;
  vread<RT>(resourceType: RT, id: string, vid: string): VreadBuilder<S, RT>;
  history(): HistoryBuilder;
  history<RT>(resourceType: RT): HistoryBuilder;
  history<RT>(resourceType: RT, id: string): HistoryBuilder;
  capabilities(): CapabilitiesBuilder;
  transaction(): TransactionBuilder<S>;
  batch(): BatchBuilder<S>;
  operation(name: string, options?: OperationOptions): OperationBuilder;
  create<RT>(resource: S["resources"][RT] & Resource): CreateBuilder<S, RT>;
  update<RT>(resource: S["resources"][RT] & Resource & { id: string }): UpdateBuilder<S, RT>;
  delete<RT>(resourceType: RT, id: string): DeleteBuilder;
  patch<RT>(resourceType: RT, id: string, body: JsonPatchBody | string | Record<string, unknown>, format?: PatchFormat): PatchBuilder<S, RT>;
}
```
**Returns** — Each method returns a fresh builder. No request is issued until you call `.execute()`.

**Example**
```ts
const patients = await fhir.search("Patient").where("name", "eq", "Smith").execute();
const one = await fhir.read("Patient", "123").execute();
```

**Notes** — `operation(name, options?)` is positional — `name` comes first. Names are normalised to include a leading `$`.

---

### `SearchQueryBuilder`
**Signature**
```ts
interface SearchQueryBuilder<
  S extends FhirSchema,
  RT extends string,
  SP = Record<string, SearchParam>,
  Inc extends Record<string, string> = {},
  Prof extends string | undefined = undefined,
  Sel extends string = never,
> {
  // Filtering
  where<K>(param: K, op: SearchPrefixFor<SP[K]>, value: ParamValue<SP[K]>): this;
  where<K>(param: K, op: "eq", values: readonly ParamValue<SP[K]>[]): this;            // comma-OR
  where(callback: (eb: WhereBuilder<SP>) => Condition<SP>): this;                       // condition tree
  whereIn<K>(param: K, values: readonly ParamValue<SP[K]>[]): this;
  whereMissing<K>(param: K, missing: boolean): this;
  whereId(...ids: string[]): this;
  whereLastUpdated(op: DatePrefix, value: string): this;

  // Composite / chained / reverse-chain
  whereComposite<K>(param: K, values: CompositeValues<SP[K]>): this;
  whereChained<Ref, Target, K>(ref: Ref, target: Target, targetParam: K, op, value): this;
  whereChain(hops: readonly (readonly [string, string])[], terminalParam, op, value): this; // typed up to 3 hops
  has<Src, Ref, K>(source: Src, refParam: Ref, searchParam: K, op, value): this;            // _has reverse chain

  // Meta / result-shaping
  withTag(value: string): this;                     // _tag
  withSecurity(value: string): this;                // _security
  fromSource(uri: string): this;                    // _source
  summary(mode: SummaryMode): this;                 // _summary
  total(mode: TotalMode): this;                     // _total
  contained(mode: ContainedMode): this;             // _contained
  containedType(mode: ContainedTypeMode): this;     // _containedType

  // Includes and selection
  include<K>(param: K, options?: { iterate?: boolean }): SearchQueryBuilder<..., Inc | target, Prof, Sel>;
  revinclude<Src, Param>(src: Src, param: Param, options?: { iterate?: boolean }): SearchQueryBuilder<..., Inc | Src, Prof, Sel>;
  select<K extends keyof ResolveProfile<S, RT, Prof>>(fields: readonly K[]): SearchQueryBuilder<..., Sel = K>;  // → _elements

  // Paging
  sort(param, direction?: SortDirection): this;
  count(n: number): this;
  offset(n: number): this;

  // Full-text / named queries
  filter(expression: string | { compile(): string }): this; // _filter — accepts FhirPathExpr
  text(query: string): this;                        // _text
  content(query: string): this;                     // _content
  inList(listId: string): this;                     // _list
  namedQuery(name: string, params?: Record<string, string | number>): this; // _query

  // Validation + transport
  validate(): this;
  usePost(): this;
  getUrlByteLimit(bytes: number): this;             // default 1900 bytes

  // Escape hatches
  $if(condition: boolean, cb: (qb: this) => this): this;
  $call<R>(cb: (qb: this) => R): R;

  // Terminals
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<SearchResult<ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource, ResolveIncluded<S, Inc> & Resource>>;
  stream(options?: StreamOptions): AsyncIterable<ApplySelection<ResolveProfile<S, RT, Prof>, Sel> & Resource>;

  // Typed row projection — auto-dereferences .include()d references
  transform<Out>(fn: (t: T<Scope<S, RT, Inc>>) => Out): TransformedQuery<Out>;
}
```
**Parameters** — Six type parameters thread schema (`S`), resource type (`RT`), search-param map (`SP`), accumulated include types (`Inc`), active profile (`Prof`), and selected fields (`Sel`) through every chain step.

**Returns** — `.execute()` yields `{ data, included, total?, link?, raw }`; `.stream()` yields resources one page at a time; `.compile()` returns a `CompiledQuery` for offline inspection.

**Example**
```ts
const result = await fhir
  .search("Patient")
  .where("name", "eq", "Smith")
  .where("birthdate", "ge", "1990-01-01")
  .whereIn("gender", ["male", "female"])     // emits gender=male,female
  .sort("birthdate", "desc")
  .count(10)
  .include("general-practitioner")
  .select(["id", "name", "birthDate"])       // emits _elements=id,name,birthDate
  .execute();
// result.data[0] is typed as Pick<Patient, "resourceType" | "id" | "name" | "birthDate">
```

**Notes**
- `.select(fields)` takes an **array** and emits the FHIR `_elements` search parameter on the wire; `resourceType` is always kept. Calling `.select()` again replaces the previous selection.
- `.usePost()` forces POST `[type]/_search`; the builder also auto-upgrades GET to POST when the URL exceeds `1900` bytes (override via `.getUrlByteLimit(n)`).
- `.where(callback)` routes condition trees three ways: all-AND → one query param per tuple (implicit FHIR AND); all-OR of `eq` tuples sharing a param name → single comma-joined param; anything else → `_filter=<FHIRPath>`.
- `.has("Observation", "subject", "code", "eq", "1234")` emits `_has:Observation:subject:code=1234`.

---

### `.transform(fn)` — typed row projection
**Signature**
```ts
transform<Out>(fn: (t: T<Scope<S, RT, Inc>>) => Out): TransformedQuery<Out>;

interface T<Scope> extends TExtensions<Scope> {
  <P extends string, D, R = PathValue<Scope, P>>(
    path: P & ValidatePath<Scope, P>, fallback: D, map?: (value: NonNullable<PathValue<Scope, P>>) => R,
  ): R | D;
  ref<P extends string>(path: P & ValidatePath<Scope, P>): string | null;
  coding<P extends PathToCodingArray<Scope>>(path: P, system: string): string | null;
  valueOf<P extends PathToSystemValueArray<Scope>>(path: P, system: string): string | null;
  enum<P extends string, R>(path: P & ValidatePath<Scope, P>, table: ReadonlyMap<string, R> | Readonly<Record<string, R>>, fallback: NoInfer<R>): R;
  raw<R = unknown, D = null>(path: string, fallback: D, map?: (value: unknown) => R): R | D;
}

interface TransformedQuery<Out> {
  execute(options?: StreamOptions): Promise<TransformedResult<Out>>; // { data, total?, link?, raw }
  stream(options?: StreamOptions): AsyncIterable<Out>;
}
```
**Parameters**
- `fn: (t) => Out` — callback that builds one row from a single matched resource. The `t` closure reads typed dotted paths against `Scope<S, RT, Inc>` (the primary resource with each `.include()`d reference unioned in).

**Returns** — A `TransformedQuery<Out>`. Deferred execution: nothing is dispatched until `.execute()` or `.stream()` is called.

**Example**
```ts
const rows = await fhir
  .search("Encounter")
  .include("patient")
  .include("practitioner")
  .transform((t) => ({
    id: t("id", null),
    patientFamily: t("subject.name.0.family", null),              // auto-dereferences via .include("patient")
    patientId: t.ref("subject.reference"),                         // reads the Reference side
    practitioner: t("participant.0.actor.name.0.family", null),   // auto-dereferences through participant[].actor
    loincCode: t.coding("code.coding", "http://loinc.org"),
    gender: t.enum("subject.gender", { male: "M", female: "F" }, "U"),
  }))
  .execute();
```

**Notes**
- **Include activation rule.** A `.include(param)` widens the scope so paths into the referenced resource typecheck. Without the include, `subject.name` doesn't compile — `subject` stays a `Reference`. With `.include("patient")`, `subject` becomes `Reference | Patient` and both sides are reachable.
- **Explicit numeric indexing.** Arrays require numeric segments: `name.0.given.0`, not `name.given`. The runtime walks exactly the path the type describes.
- **Null-safe.** Any missing segment (server dropped the include, reference points outside the bundle, field unpopulated) returns the fallback without calling `map`. The walker never throws.
- **Structural Reference fields.** `subject.reference`, `subject.type`, `subject.identifier`, `subject.display` are read directly — they're not auto-dereferenced even when the include is active.
- **Custom helpers.** Augment `TExtensions<Scope>` via `declare module "@fhir-dsl/core"` and register the impl with `registerTHelper(name, impl)`. The impl receives a walker context (`ctx.walk(path)`) that reuses the same dereferencing machinery.
- **Schema wiring.** Auto-dereferencing is driven by the generator-emitted `includeExpressions` map. Hand-authored schemas that omit it still get `.transform()`, just without the auto-dereference step (references remain plain `Reference` values).

See the [`.transform()` guide](../guides/transform.md) for the full walkthrough and the [Flat Rows for Export](../recipes/flat-rows-export.md) recipe for an end-to-end example.

---

### `ReadQueryBuilder` / `VreadBuilder`
**Signature**
```ts
interface ReadQueryBuilder<S, RT> {
  validate(): ReadQueryBuilder<S, RT>;
  ifNoneMatch(etag: string): ReadQueryBuilder<S, RT>;              // conditional read (If-None-Match)
  ifModifiedSince(value: Date | string): ReadQueryBuilder<S, RT>;  // conditional read (If-Modified-Since)
  $if(condition: boolean, cb): this;
  $call<R>(cb): R;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
interface VreadBuilder<S, RT> {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
```
**Example**
```ts
const patient = await fhir.read("Patient", "123").ifNoneMatch('W/"2"').execute();
const oldPatient = await fhir.vread("Patient", "123", "1").execute();
```

---

### `CreateBuilder` / `UpdateBuilder` / `DeleteBuilder` / `PatchBuilder`
**Signature**
```ts
interface CreateBuilder<S, RT> {
  ifNoneExist(search: string | Record<string, string | number | readonly (string | number)[]>): CreateBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
interface UpdateBuilder<S, RT> {
  ifMatch(etag: string): UpdateBuilder<S, RT>;
  ifNoneMatch(etag: string): UpdateBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
interface DeleteBuilder {
  ifMatch(etag: string): DeleteBuilder;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<void>;
}
interface PatchBuilder<S, RT> {
  ifMatch(etag: string): PatchBuilder<S, RT>;
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<S["resources"][RT] & Resource>;
}
type PatchFormat = "json-patch" | "xml-patch" | "fhirpath-patch";
```
**Example**
```ts
// Conditional create
const created = await fhir
  .create({ resourceType: "Patient", name: [{ family: "Doe" }] })
  .ifNoneExist({ identifier: "http://hospital.example|MRN-42" })
  .execute();

// FHIRPath patch
await fhir
  .patch(
    "Patient",
    "123",
    { resourceType: "Parameters", parameter: [/* fhirpath ops */] },
    "fhirpath-patch",
  )
  .ifMatch('W/"3"')
  .execute();
```

---

### `TransactionBuilder` / `BatchBuilder`
**Signature**
```ts
interface TransactionBuilder<S> {
  create<RT>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;
  update<RT>(resource: S["resources"][RT] & Resource): TransactionBuilder<S>;
  delete<RT>(resourceType: RT, id: string): TransactionBuilder<S>;
  $if(cond: boolean, cb): this;
  $call<R>(cb): R;
  compile(): Bundle;
  execute(options?: ExecuteOptions): Promise<Bundle>;
}
// BatchBuilder has the identical shape (bundle.type === "batch").
```
**Example**
```ts
const result = await fhir
  .transaction()
  .create({ resourceType: "Patient", name: [{ family: "Doe", given: ["Jane"] }] })
  .update({ resourceType: "Observation", id: "obs-123", status: "final", code: {/*...*/} })
  .delete("Appointment", "appt-456")
  .$if(process.env.ENABLE_AUDIT === "1", (tx) =>
    tx.create({ resourceType: "AuditEvent", /*...*/ }),
  )
  .execute();
```

---

### `OperationBuilder`
**Signature**
```ts
interface OperationBuilder {
  compile(): CompiledQuery;
  execute(options?: ExecuteOptions): Promise<Resource | Parameters>;
}
interface OperationOptions {
  scope?: OperationScope;                                     // system | type | instance
  parameters?: Parameters | Record<string, unknown>;          // bare records are auto-wrapped into Parameters
  method?: "GET" | "POST";                                    // default POST
}
// client.operation(name, options) — name is the FIRST positional argument.
```
**Example**
```ts
// Instance-level $validate-code on a ValueSet
const outcome = await fhir
  .operation("validate-code", {
    scope: { kind: "instance", resourceType: "ValueSet", id: "observation-category" },
    parameters: { code: "vital-signs", system: "http://terminology.hl7.org/CodeSystem/observation-category" },
    method: "GET",
  })
  .execute();
```

---

### `WhereBuilder`, `createWhereBuilder`, `Condition`
**Signature**
```ts
type ConditionTuple<SP> = { [K in keyof SP]: readonly [K, SearchPrefixFor<SP[K]>, ParamValue<SP[K]>] }[keyof SP];
interface ConditionGroup<SP> { readonly type: "and" | "or"; readonly conditions: readonly Condition<SP>[]; }
type Condition<SP> = ConditionTuple<SP> | ConditionGroup<SP>;

interface WhereBuilder<SP> {
  and(conditions: readonly Condition<SP>[]): ConditionGroup<SP>;
  or(conditions: readonly Condition<SP>[]): ConditionGroup<SP>;
}
function createWhereBuilder<SP>(): WhereBuilder<SP>;
function isConditionGroup<SP>(node: Condition<SP>): node is ConditionGroup<SP>;
```
**Example**
```ts
await fhir
  .search("Observation")
  .where((eb) =>
    eb.or([
      ["code", "eq", "8480-6"],   // systolic
      ["code", "eq", "8462-4"],   // diastolic
    ]),
  )
  // -> code=8480-6,8462-4
  .execute();
```

---

### `AuthConfig`, `AuthProvider`, `isStaticAuth`, `resolveAuthProvider`
**Signature**
```ts
interface AuthProvider {
  getAuthorization(req: { url: string; method: string }): Promise<string | undefined> | string | undefined;
  onUnauthorized?(): Promise<void> | void;
}
interface StaticAuth { type: "bearer" | "basic"; credentials: string; }
type AuthConfig = AuthProvider | StaticAuth;
function isStaticAuth(auth: AuthConfig): auth is StaticAuth;
function resolveAuthProvider(auth: AuthConfig | undefined): AuthProvider | undefined;
```
**Example**
```ts
const bearer: AuthConfig = { type: "bearer", credentials: "xyz" };
const custom: AuthProvider = {
  async getAuthorization({ url }) { return `Bearer ${await mintToken(url)}`; },
  async onUnauthorized() { await cache.invalidate(); },
};
```

**Notes** — `AuthProvider.getAuthorization` returns the full header value (e.g. `Bearer <token>`), not just the token. The name is `getAuthorization` (not `getAuthHeader`).

---

### Retry primitives
**Signature**
```ts
interface RetryPolicy {
  maxAttempts?: number;       // default 3
  retryOn?: readonly number[]; // default [429, 503]
  baseBackoffMs?: number;      // default 100
  maxBackoffMs?: number;       // default 30_000
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
  random?: () => number;
}
type RetryConfig = RetryPolicy | boolean | undefined;

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_BACKOFF_MS = 100;
const DEFAULT_MAX_BACKOFF_MS = 30_000;
const DEFAULT_RETRY_STATUSES: readonly number[] = [429, 503];

function resolveRetryPolicy(config: RetryConfig): Required<RetryPolicy> | undefined;
function parseRetryAfter(value: string | null | undefined, now?: number): number | undefined; // RFC 7231 §7.1.3
function computeBackoffMs(policy: Required<RetryPolicy>, attempt: number): number;              // full-jitter
```
**Example**
```ts
const client = createFhirClient<Schema>({
  baseUrl: "https://fhir.example/r4",
  retry: { maxAttempts: 5, baseBackoffMs: 200 },
});
```

---

### Validation
**Signature**
```ts
interface StandardSchemaLike { readonly "~standard": { readonly validate: (v: unknown) => StandardValidateResult | Promise<StandardValidateResult>; }; }
type StandardValidateResult =
  | { readonly value: unknown; readonly issues?: undefined }
  | { readonly issues: readonly { readonly message: string; readonly path?: readonly PropertyKey[] }[] };

interface SchemaRegistry {
  readonly resources: Readonly<Record<string, StandardSchemaLike>>;
  readonly profiles?: Readonly<Record<string, Readonly<Record<string, StandardSchemaLike>>>>;
}

class ValidationError extends FhirDslError<"core.validation", ValidationErrorContext> {
  readonly kind: "core.validation";
  readonly resourceType: string;
  readonly issues: ReadonlyArray<{ message: string; path?: readonly PropertyKey[] }>;
  readonly index?: number;
}
interface ValidationErrorContext {
  readonly resourceType: string;
  readonly issues: ReadonlyArray<{ message: string; path?: readonly PropertyKey[] }>;
  readonly index?: number;
}

class ValidationUnavailableError extends FhirDslError<"core.validation_unavailable", undefined> {
  readonly kind: "core.validation_unavailable";
}

function resolveSchema(registry: SchemaRegistry, resourceType: string, profile?: string): StandardSchemaLike;
function validateOne(schema: StandardSchemaLike, resourceType: string, value: unknown, index?: number): Promise<void>;
```
**Example**
```ts
import { createClient } from "./src/fhir/r4/client"; // generated by `fhir-gen generate --validator native`
import { isFhirDslError } from "@fhir-dsl/utils";

const fhir = createClient({ baseUrl: "https://fhir.example/r4" });
try {
  await fhir.search("Patient").validate().execute();
} catch (err) {
  if (isFhirDslError(err) && err.kind === "core.validation") {
    console.error(err.context.issues); // typed array of { message, path? }
  }
}
```

**Notes** — `.validate()` on a builder requires a `SchemaRegistry`. Without it, `ValidationUnavailableError` (kind `core.validation_unavailable`) is thrown at execute time. Standard Schema v1 means zod, valibot, arktype, or the generator's native emitter are interchangeable. Both classes extend [`FhirDslError`](./utils.md#fhirdslerror) — pattern-match on `kind` and read structured `context` instead of parsing `.message`.

---

### `FhirClientConfig`, `AsyncPollingConfig`, `FhirRequestError`, `AsyncPollingTimeoutError`
**Signature**
```ts
interface FhirClientConfig {
  baseUrl: string;
  auth?: AuthConfig;
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
  schemas?: SchemaRegistry;
  retry?: RetryConfig;
  async?: AsyncPollingConfig;
}
interface AsyncPollingConfig {
  pollingInterval?: number; // default 2000 ms
  maxAttempts?: number;     // default 60
}
class FhirRequestError extends FhirDslError<"core.request", FhirRequestErrorContext> {
  readonly kind: "core.request";
  readonly status: number;
  readonly statusText: string;
  readonly operationOutcome: unknown;
}
interface FhirRequestErrorContext {
  readonly status: number;
  readonly statusText: string;
  readonly operationOutcome: unknown;
}

class AsyncPollingTimeoutError extends FhirDslError<"core.async_polling_timeout", AsyncPollingTimeoutErrorContext> {
  readonly kind: "core.async_polling_timeout";
  readonly statusUrl: string;
  readonly attempts: number;
}
interface AsyncPollingTimeoutErrorContext {
  readonly statusUrl: string;
  readonly attempts: number;
}
```
**Notes** — When `async` is set and the server responds `202 Accepted` with `Content-Location`, the client polls the status URL until it returns a terminal status. `Retry-After` is honoured (delta-seconds or HTTP-date). Both classes extend [`FhirDslError`](./utils.md#fhirdslerror); the structured `context` survives `toJSON()` for transport.

---

### `CompiledQuery`, `HttpRequest`, `performRequest`
**Signature**
```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
interface CompiledSearchParam { name: string; prefix?: string; modifier?: string; value: string | number; }
interface CompiledQuery { method: HttpMethod; path: string; params: CompiledSearchParam[]; headers?: Record<string, string>; body?: unknown; }

interface HttpRequest { url: string; method: string; headers?: Record<string, string>; body?: BodyInit | null; signal?: AbortSignal; }
interface HttpResponse { status: number; statusText: string; ok: boolean; json(): Promise<unknown>; text(): Promise<string>; headers: Headers; }
interface HttpConfig { baseUrl: string; auth?: AuthConfig; headers?: Record<string, string>; fetch?: typeof globalThis.fetch; retry?: RetryConfig; }

function performRequest(config: HttpConfig, req: HttpRequest): Promise<HttpResponse>;
function compilePreferHeader(options: PreferOptions | undefined): string | undefined;
function mergePreferIntoQuery<Q>(query: Q, prefer: PreferOptions | undefined): Q;
```

**Example**
```ts
const compiled = fhir.search("Patient").where("name", "eq", "Smith").compile();
// → { method: "GET", path: "Patient", params: [{ name: "name", value: "Smith" }] }
```
