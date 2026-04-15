import type { CompiledQuery } from "@fhir-dsl/core";
import type { FhirClientConfig } from "./config.js";
import { FhirError } from "./errors.js";

export class FhirExecutor {
  readonly #config: FhirClientConfig;
  readonly #fetch: typeof globalThis.fetch;

  constructor(config: FhirClientConfig) {
    this.#config = config;
    this.#fetch = config.fetch ?? globalThis.fetch;
  }

  async execute<T = unknown>(query: CompiledQuery): Promise<T> {
    const url = new URL(
      query.path,
      this.#config.baseUrl.endsWith("/") ? this.#config.baseUrl : `${this.#config.baseUrl}/`,
    );

    for (const param of query.params) {
      const value = param.prefix ? `${param.prefix}${param.value}` : String(param.value);
      url.searchParams.append(param.name, value);
    }

    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
      ...this.#config.headers,
      ...query.headers,
    };

    if (this.#config.auth) {
      const { type, credentials } = this.#config.auth;
      headers.Authorization = type === "bearer" ? `Bearer ${credentials}` : `Basic ${credentials}`;
    }

    const response = await this.#fetch(url.toString(), {
      method: query.method,
      headers,
      ...(query.body ? { body: JSON.stringify(query.body) } : {}),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return response.json() as Promise<T>;
  }

  async executeUrl<T = unknown>(url: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      ...this.#config.headers,
    };

    if (this.#config.auth) {
      const { type, credentials } = this.#config.auth;
      headers.Authorization = type === "bearer" ? `Bearer ${credentials}` : `Basic ${credentials}`;
    }

    const response = await this.#fetch(url, { method: "GET", headers });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return response.json() as Promise<T>;
  }
}
