import type { Resource } from "@fhir-dsl/types";
import type { AuthConfig } from "./auth.js";
import type { CompiledQuery } from "./compiled-query.js";
import {
  type CreateBuilder,
  CreateBuilderImpl,
  type DeleteBuilder,
  DeleteBuilderImpl,
  type JsonPatchBody,
  type PatchBuilder,
  PatchBuilderImpl,
  type PatchFormat,
  type UpdateBuilder,
  UpdateBuilderImpl,
} from "./direct-crud-builder.js";
import { type HttpResponse, performRequest } from "./http.js";
import { type OperationBuilder, OperationBuilderImpl, type OperationOptions } from "./operation-builder.js";
import type { ReadQueryBuilder, SearchQueryBuilder } from "./query-builder.js";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";
import {
  type CapabilitiesBuilder,
  CapabilitiesBuilderImpl,
  type HistoryBuilder,
  HistoryBuilderImpl,
  type HistoryScope,
  type VreadBuilder,
  VreadBuilderImpl,
} from "./rest-builders.js";
import type { RetryConfig } from "./retry.js";
import { type Executor, SearchQueryBuilderImpl, type UrlExecutor } from "./search-query-builder.js";
import { TerminologyClient } from "./terminology-operations.js";
import {
  type BatchBuilder,
  BatchBuilderImpl,
  type TransactionBuilder,
  TransactionBuilderImpl,
} from "./transaction-builder.js";
import type { FhirSchema, ProfileNames, SearchParamFor } from "./types.js";
import type { SchemaRegistry } from "./validation.js";

// --- Client Configuration ---

/**
 * REST-16 / FHIR R5 §3.2.6 async pattern config.
 *
 * When the server responds with 202 Accepted + `Content-Location: <status>`
 * (typically in reply to `Prefer: respond-async`), the executor polls the
 * status URL until it returns a non-202 status, then returns that body.
 */
export interface AsyncPollingConfig {
  /** Polling interval when the server does not send `Retry-After`. Default: 2000ms. */
  pollingInterval?: number;
  /** Maximum number of poll attempts before giving up. Default: 60. */
  maxAttempts?: number;
}

export interface FhirClientConfig {
  baseUrl: string;
  auth?: AuthConfig | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
  schemas?: SchemaRegistry | undefined;
  retry?: RetryConfig;
  /**
   * Enable async-pattern polling. When set, a 202 response carrying a
   * `Content-Location` header causes the executor to poll that URL until
   * the operation completes. Omit to disable — 202 responses are then
   * returned as-is (their body, if any, is handed to the caller).
   */
  async?: AsyncPollingConfig;
  /**
   * Runtime counterpart of the schema's `includeExpressions` type. Maps
   * `ResourceType → searchParam → dotted FHIRPath` so `.transform(...)` can
   * dereference `.include()`d references through the bundle. Emitted by the
   * CLI alongside the schema types; absent on hand-authored schemas (in which
   * case auto-dereferencing is skipped and `.transform` still reads through
   * the `Reference` shape).
   */
  includeExpressions?: Record<string, Record<string, string | readonly string[]>>;
}

// --- Default executor using fetch ---

function createFetchExecutor(config: FhirClientConfig): Executor {
  return async (query: CompiledQuery, signal?: AbortSignal): Promise<unknown> => {
    const url = new URL(query.path, config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`);

    for (const param of query.params) {
      const name = param.modifier ? `${param.name}:${param.modifier}` : param.name;
      const value = param.prefix ? `${param.prefix}${param.value}` : String(param.value);
      url.searchParams.append(name, value);
    }

    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
      ...config.headers,
      ...query.headers,
    };

    const body =
      query.body == null ? undefined : typeof query.body === "string" ? query.body : JSON.stringify(query.body);

    const response = await performRequest(config, {
      url: url.toString(),
      method: query.method,
      headers,
      ...(body !== undefined ? { body } : {}),
      ...(signal !== undefined ? { signal } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirRequestError(response.status, response.statusText, errorBody);
    }

    const polled = await maybePollAsync(config, response, signal);
    if (polled !== undefined) return polled;
    return readJsonBody(response);
  };
}

// --- URL executor for following pagination links ---

function createUrlExecutor(config: FhirClientConfig): UrlExecutor {
  return async (url: string, signal?: AbortSignal): Promise<unknown> => {
    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      ...config.headers,
    };

    const response = await performRequest(config, {
      url,
      method: "GET",
      headers,
      ...(signal !== undefined ? { signal } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirRequestError(response.status, response.statusText, errorBody);
    }

    const polled = await maybePollAsync(config, response, signal);
    if (polled !== undefined) return polled;
    return readJsonBody(response);
  };
}

// 204 No Content has no body; calling `.json()` throws. Treat any empty-body
// success response (204 or Content-Length: 0) as `undefined`.
async function readJsonBody(response: HttpResponse): Promise<unknown> {
  if (response.status === 204 || response.headers?.get("content-length") === "0") {
    return undefined;
  }
  return response.json();
}

// --- Async pattern (§3.2.6) ---

const DEFAULT_ASYNC_POLL_INTERVAL_MS = 2000;
const DEFAULT_ASYNC_MAX_ATTEMPTS = 60;

/**
 * If the response is a 202 with a `Content-Location` header AND async
 * polling is enabled on the client, poll the status URL until it returns
 * a terminal (non-202) status. Returns the final body, or `undefined` if
 * polling is not applicable (caller falls back to reading the original
 * response body).
 */
async function maybePollAsync(
  config: FhirClientConfig,
  response: HttpResponse,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  if (!config.async) return undefined;
  if (response.status !== 202) return undefined;
  const statusUrl = response.headers?.get("content-location");
  if (!statusUrl) return undefined;

  const pollInterval = config.async.pollingInterval ?? DEFAULT_ASYNC_POLL_INTERVAL_MS;
  const maxAttempts = config.async.maxAttempts ?? DEFAULT_ASYNC_MAX_ATTEMPTS;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Respect Retry-After from the just-seen 202 response if provided;
    // otherwise wait the configured pollInterval.
    const retryAfterMs = parseRetryAfterToMs(response.headers?.get("retry-after"));
    await sleepWithAbort(retryAfterMs ?? pollInterval, signal);

    const polled = await performRequest(config, {
      url: statusUrl,
      method: "GET",
      headers: {
        Accept: "application/fhir+json",
        ...config.headers,
      },
      ...(signal !== undefined ? { signal } : {}),
    });

    if (polled.status === 202) {
      response = polled;
      continue;
    }
    if (!polled.ok) {
      const errorBody = await polled.json().catch(() => null);
      throw new FhirRequestError(polled.status, polled.statusText, errorBody);
    }
    return readJsonBody(polled);
  }
  throw new AsyncPollingTimeoutError(statusUrl, maxAttempts);
}

function parseRetryAfterToMs(header: string | null | undefined): number | undefined {
  if (!header) return undefined;
  const asNum = Number(header);
  if (Number.isFinite(asNum) && asNum >= 0) return asNum * 1000;
  const asDate = Date.parse(header);
  if (Number.isFinite(asDate)) return Math.max(0, asDate - Date.now());
  return undefined;
}

function sleepWithAbort(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

// --- Error class ---

export class FhirRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly operationOutcome: unknown,
  ) {
    super(`FHIR request failed: ${status} ${statusText}`);
    this.name = "FhirRequestError";
  }
}

export class AsyncPollingTimeoutError extends Error {
  constructor(
    public readonly statusUrl: string,
    public readonly attempts: number,
  ) {
    super(`Async operation did not complete after ${attempts} polls of ${statusUrl}`);
    this.name = "AsyncPollingTimeoutError";
  }
}

// --- FhirClient ---

export class FhirClient<S extends FhirSchema> {
  readonly #executor: Executor;
  readonly #urlExecutor: UrlExecutor;
  readonly #schemas: SchemaRegistry | undefined;
  readonly #includeExpressions: Record<string, Record<string, string | readonly string[]>> | undefined;

  constructor(config: FhirClientConfig) {
    this.#executor = createFetchExecutor(config);
    this.#urlExecutor = createUrlExecutor(config);
    this.#schemas = config.schemas;
    this.#includeExpressions = config.includeExpressions;
  }

  search<RT extends string & keyof S["resources"]>(resourceType: RT): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>>;
  search<RT extends string & keyof S["resources"], P extends ProfileNames<S, RT>>(
    resourceType: RT,
    profile: P,
    // biome-ignore lint/complexity/noBannedTypes: empty-map default for the Inc generic
  ): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>, {}, P>;
  search<RT extends string & keyof S["resources"]>(
    resourceType: RT,
    profile?: string,
  ): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>> {
    if (profile) {
      return new SearchQueryBuilderImpl<S, RT, SearchParamFor<S, RT>>(
        resourceType,
        this.#executor,
        undefined,
        profile,
        this.#urlExecutor,
        this.#schemas,
        this.#includeExpressions,
      );
    }
    return new SearchQueryBuilderImpl<S, RT, SearchParamFor<S, RT>>(
      resourceType,
      this.#executor,
      undefined,
      undefined,
      this.#urlExecutor,
      this.#schemas,
      this.#includeExpressions,
    );
  }

  read<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): ReadQueryBuilder<S, RT> {
    return new ReadQueryBuilderImpl<S, RT>(resourceType, id, this.#executor, this.#schemas);
  }

  /**
   * System-level search: `GET [base]?params` (or `POST [base]/_search`).
   * The return type carries an unbound search-param record because system
   * searches run across every resource type on the server (spec §3.1.0).
   */
  searchAll(): SearchQueryBuilder<S, string, Record<string, { value: string }>> {
    return new SearchQueryBuilderImpl<S, string, Record<string, { value: string }>>(
      "",
      this.#executor,
      undefined,
      undefined,
      this.#urlExecutor,
      this.#schemas,
      this.#includeExpressions,
    );
  }

  vread<RT extends string & keyof S["resources"]>(resourceType: RT, id: string, vid: string): VreadBuilder<S, RT> {
    return new VreadBuilderImpl<S, RT>(this.#executor, resourceType, id, vid);
  }

  history(): HistoryBuilder;
  history<RT extends string & keyof S["resources"]>(resourceType: RT): HistoryBuilder;
  history<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): HistoryBuilder;
  history(resourceType?: string, id?: string): HistoryBuilder {
    const scope: HistoryScope =
      resourceType == null
        ? { kind: "system" }
        : id == null
          ? { kind: "type", resourceType }
          : { kind: "instance", resourceType, id };
    return new HistoryBuilderImpl(this.#executor, scope);
  }

  capabilities(): CapabilitiesBuilder {
    return new CapabilitiesBuilderImpl(this.#executor);
  }

  transaction(): TransactionBuilder<S> {
    return new TransactionBuilderImpl<S>(this.#executor);
  }

  batch(): BatchBuilder<S> {
    return new BatchBuilderImpl<S>(this.#executor);
  }

  operation(name: string, options?: OperationOptions): OperationBuilder {
    return new OperationBuilderImpl(this.#executor, name, options);
  }

  /**
   * Phase 3.1 — typed terminology-service operations
   * (`$expand`, `$validate-code`, `$lookup`, `$translate`, `$subsumes`).
   * Each method returns an `OperationBuilder` you can `compile()` or
   * `execute()` like any other operation.
   */
  get terminology(): TerminologyClient {
    if (!this.#terminology) {
      this.#terminology = new TerminologyClient(this.#executor);
    }
    return this.#terminology;
  }
  #terminology: TerminologyClient | undefined;

  create<RT extends string & keyof S["resources"]>(resource: S["resources"][RT] & Resource): CreateBuilder<S, RT> {
    return new CreateBuilderImpl<S, RT>(this.#executor, resource);
  }

  update<RT extends string & keyof S["resources"]>(
    resource: S["resources"][RT] & Resource & { id: string },
  ): UpdateBuilder<S, RT> {
    if (!resource.id) {
      throw new Error("Resource must have an id for update operations");
    }
    return new UpdateBuilderImpl<S, RT>(this.#executor, resource as Resource & { id: string });
  }

  delete<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): DeleteBuilder {
    return new DeleteBuilderImpl(this.#executor, resourceType, id);
  }

  patch<RT extends string & keyof S["resources"]>(
    resourceType: RT,
    id: string,
    body: JsonPatchBody | string | Record<string, unknown>,
    format: PatchFormat = "json-patch",
  ): PatchBuilder<S, RT> {
    return new PatchBuilderImpl<S, RT>(this.#executor, resourceType, id, body, format);
  }
}

// --- Factory function ---

export function createFhirClient<S extends FhirSchema>(config: FhirClientConfig): FhirClient<S> {
  return new FhirClient<S>(config);
}
