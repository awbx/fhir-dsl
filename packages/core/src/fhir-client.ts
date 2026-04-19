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
import {
  type BatchBuilder,
  BatchBuilderImpl,
  type TransactionBuilder,
  TransactionBuilderImpl,
} from "./transaction-builder.js";
import type { FhirSchema, ProfileNames, SearchParamFor } from "./types.js";
import type { SchemaRegistry } from "./validation.js";

// --- Client Configuration ---

export interface FhirClientConfig {
  baseUrl: string;
  auth?: AuthConfig | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
  schemas?: SchemaRegistry | undefined;
  retry?: RetryConfig;
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

// --- FhirClient ---

export class FhirClient<S extends FhirSchema> {
  readonly #executor: Executor;
  readonly #urlExecutor: UrlExecutor;
  readonly #schemas: SchemaRegistry | undefined;

  constructor(config: FhirClientConfig) {
    this.#executor = createFetchExecutor(config);
    this.#urlExecutor = createUrlExecutor(config);
    this.#schemas = config.schemas;
  }

  search<RT extends string & keyof S["resources"]>(resourceType: RT): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>>;
  search<RT extends string & keyof S["resources"], P extends ProfileNames<S, RT>>(
    resourceType: RT,
    profile: P,
  ): SearchQueryBuilder<S, RT, SearchParamFor<S, RT>, never, P>;
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
      );
    }
    return new SearchQueryBuilderImpl<S, RT, SearchParamFor<S, RT>>(
      resourceType,
      this.#executor,
      undefined,
      undefined,
      this.#urlExecutor,
      this.#schemas,
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
