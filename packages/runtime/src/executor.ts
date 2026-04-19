import { type CompiledQuery, type HttpResponse, performRequest } from "@fhir-dsl/core";
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

    const body =
      query.body == null ? undefined : typeof query.body === "string" ? query.body : JSON.stringify(query.body);

    const response = await performRequest(this.#config, {
      url: url.toString(),
      method: query.method,
      headers,
      ...(body !== undefined ? { body } : {}),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as import("./errors.js").OperationOutcome | null;
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return readJsonBody<T>(response);
  }

  async executeUrl<T = unknown>(url: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/fhir+json",
      ...this.#config.headers,
    };

    // RFC 6750 §5.3: bearer tokens MUST NOT be sent to arbitrary third parties.
    // Server-controlled `next` links may point off-origin (attacker-controlled
    // host); strip both the credential provider and any pre-baked Authorization
    // header before following.
    const config = isSameOrigin(url, this.#config.baseUrl) ? this.#config : { ...this.#config, auth: undefined };
    if (!isSameOrigin(url, this.#config.baseUrl)) delete headers.Authorization;

    const response = await performRequest(config, { url, method: "GET", headers });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as import("./errors.js").OperationOutcome | null;
      throw new FhirError(response.status, response.statusText, errorBody);
    }

    return readJsonBody<T>(response);
  }
}

function isSameOrigin(targetUrl: string, baseUrl: string): boolean {
  try {
    return new URL(targetUrl).origin === new URL(baseUrl).origin;
  } catch {
    return false;
  }
}

// 204 No Content has no body; calling `.json()` throws. Treat any empty-body
// success response (204 or Content-Length: 0) as `undefined`.
async function readJsonBody<T>(response: HttpResponse): Promise<T> {
  if (response.status === 204 || response.headers?.get("content-length") === "0") {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}
