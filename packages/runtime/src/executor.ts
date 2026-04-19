import { type CompiledQuery, performRequest } from "@fhir-dsl/core";
import type { FhirClientConfig } from "./config.js";
import { FhirError } from "./errors.js";

export class FhirExecutor {
  readonly #config: FhirClientConfig;

  constructor(config: FhirClientConfig) {
    this.#config = config;
  }

  async execute<T = unknown>(query: CompiledQuery): Promise<T> {
    const url = new URL(
      query.path,
      this.#config.baseUrl.endsWith("/") ? this.#config.baseUrl : `${this.#config.baseUrl}/`,
    );

    for (const param of query.params) {
      const name = param.modifier ? `${param.name}:${param.modifier}` : param.name;
      const value = param.prefix ? `${param.prefix}${param.value}` : String(param.value);
      url.searchParams.append(name, value);
    }

    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
      ...this.#config.headers,
      ...query.headers,
    };

    const response = await performRequest(this.#config, {
      url: url.toString(),
      method: query.method,
      headers,
      ...(query.body ? { body: JSON.stringify(query.body) } : {}),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as import("./errors.js").OperationOutcome | null;
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return response.json() as Promise<T>;
  }

  async executeUrl<T = unknown>(url: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      ...this.#config.headers,
    };

    const response = await performRequest(this.#config, { url, method: "GET", headers });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as import("./errors.js").OperationOutcome | null;
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return response.json() as Promise<T>;
  }
}
