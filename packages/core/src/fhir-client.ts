import type { CompiledQuery } from "./compiled-query.js";
import type { ReadQueryBuilder, SearchQueryBuilder } from "./query-builder.js";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";
import { type Executor, SearchQueryBuilderImpl, type UrlExecutor } from "./search-query-builder.js";
import { type TransactionBuilder, TransactionBuilderImpl } from "./transaction-builder.js";
import type { FhirSchema, ProfileNames, SearchParamFor } from "./types.js";

// --- Client Configuration ---

export interface FhirClientConfig {
  baseUrl: string;
  auth?: { type: "bearer" | "basic"; credentials: string } | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
}

// --- Default executor using fetch ---

function createFetchExecutor(config: FhirClientConfig): Executor {
  const fetchFn = config.fetch ?? globalThis.fetch;

  return async (query: CompiledQuery): Promise<unknown> => {
    const url = new URL(query.path, config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`);

    for (const param of query.params) {
      const value = param.prefix ? `${param.prefix}${param.value}` : String(param.value);
      url.searchParams.append(param.name, value);
    }

    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
      ...config.headers,
    };

    if (config.auth) {
      if (config.auth.type === "bearer") {
        headers.Authorization = `Bearer ${config.auth.credentials}`;
      } else if (config.auth.type === "basic") {
        headers.Authorization = `Basic ${config.auth.credentials}`;
      }
    }

    const response = await fetchFn(url.toString(), {
      method: query.method,
      headers,
      ...(query.body ? { body: JSON.stringify(query.body) } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirRequestError(response.status, response.statusText, errorBody);
    }

    return response.json();
  };
}

// --- URL executor for following pagination links ---

function createUrlExecutor(config: FhirClientConfig): UrlExecutor {
  const fetchFn = config.fetch ?? globalThis.fetch;

  return async (url: string): Promise<unknown> => {
    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      ...config.headers,
    };

    if (config.auth) {
      if (config.auth.type === "bearer") {
        headers.Authorization = `Bearer ${config.auth.credentials}`;
      } else if (config.auth.type === "basic") {
        headers.Authorization = `Basic ${config.auth.credentials}`;
      }
    }

    const response = await fetchFn(url, { method: "GET", headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirRequestError(response.status, response.statusText, errorBody);
    }

    return response.json();
  };
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

  constructor(config: FhirClientConfig) {
    this.#executor = createFetchExecutor(config);
    this.#urlExecutor = createUrlExecutor(config);
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
      );
    }
    return new SearchQueryBuilderImpl<S, RT, SearchParamFor<S, RT>>(
      resourceType,
      this.#executor,
      undefined,
      undefined,
      this.#urlExecutor,
    );
  }

  read<RT extends string & keyof S["resources"]>(resourceType: RT, id: string): ReadQueryBuilder<S, RT> {
    return new ReadQueryBuilderImpl<S, RT>(resourceType, id, this.#executor);
  }

  transaction(): TransactionBuilder<S> {
    return new TransactionBuilderImpl<S>(this.#executor);
  }
}

// --- Factory function ---

export function createFhirClient<S extends FhirSchema>(config: FhirClientConfig): FhirClient<S> {
  return new FhirClient<S>(config);
}
