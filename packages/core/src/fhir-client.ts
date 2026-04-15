import type { FhirResourceMap, ProfileRegistry } from "@fhir-dsl/types";
import type { CompiledQuery } from "./compiled-query.js";
import type { ReadQueryBuilder, SearchQueryBuilder } from "./query-builder.js";
import { ReadQueryBuilderImpl } from "./read-query-builder.js";
import { type Executor, SearchQueryBuilderImpl } from "./search-query-builder.js";
import { type TransactionBuilder, TransactionBuilderImpl } from "./transaction-builder.js";
import type { ProfileNames, SearchParamFor } from "./types.js";

// --- Client Configuration ---

export interface FhirClientConfig {
  baseUrl: string;
  auth?: {
    type: "bearer" | "basic";
    credentials: string;
  };
  headers?: Record<string, string>;
  fetch?: typeof globalThis.fetch;
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
      body: query.body ? JSON.stringify(query.body) : undefined,
    });

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

export class FhirClient<RM extends Record<string, any> = FhirResourceMap> {
  readonly #executor: Executor;

  constructor(config: FhirClientConfig) {
    this.#executor = createFetchExecutor(config);
  }

  search<RT extends string & keyof RM>(resourceType: RT): SearchQueryBuilder<RM, RT, SearchParamFor<RT>>;
  search<RT extends string & keyof RM, P extends ProfileNames<RT>>(
    resourceType: RT,
    profile: P,
  ): SearchQueryBuilder<RM, RT, SearchParamFor<RT>, never, P>;
  search<RT extends string & keyof RM>(
    resourceType: RT,
    profile?: string,
  ): SearchQueryBuilder<RM, RT, SearchParamFor<RT>> {
    if (profile) {
      return new SearchQueryBuilderImpl<RM, RT, SearchParamFor<RT>>(resourceType, this.#executor, undefined, profile);
    }
    return new SearchQueryBuilderImpl<RM, RT, SearchParamFor<RT>>(resourceType, this.#executor);
  }

  read<RT extends string & keyof RM>(resourceType: RT, id: string): ReadQueryBuilder<RM, RT> {
    return new ReadQueryBuilderImpl<RM, RT>(resourceType, id, this.#executor);
  }

  transaction(): TransactionBuilder<RM> {
    return new TransactionBuilderImpl<RM>(this.#executor);
  }
}

// --- Factory function ---

export function createFhirClient<RM extends Record<string, any> = FhirResourceMap>(
  config: FhirClientConfig,
): FhirClient<RM> {
  return new FhirClient<RM>(config);
}
