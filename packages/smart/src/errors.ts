import { FhirDslError } from "@fhir-dsl/utils";

export interface OAuth2ErrorBody {
  error: string;
  error_description?: string;
  error_uri?: string;
  [k: string]: unknown;
}

export interface SmartAuthErrorContext {
  readonly error: string;
  readonly errorDescription?: string;
  readonly status?: number;
  readonly body?: unknown;
}

/**
 * RFC 6749 §5.2 OAuth 2.0 token-endpoint error response.
 */
export class SmartAuthError extends FhirDslError<"smart.auth", SmartAuthErrorContext> {
  readonly kind = "smart.auth" as const;
  readonly error: string;
  readonly errorDescription?: string;
  readonly status?: number;
  readonly body?: unknown;

  constructor(error: string, errorDescription?: string, status?: number, body?: unknown) {
    super(errorDescription ? `${error}: ${errorDescription}` : error, {
      error,
      ...(errorDescription !== undefined ? { errorDescription } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(body !== undefined ? { body } : {}),
    });
    this.error = error;
    if (errorDescription !== undefined) this.errorDescription = errorDescription;
    if (status !== undefined) this.status = status;
    if (body !== undefined) this.body = body;
  }
}

export interface DiscoveryErrorContext {
  readonly url: string;
  readonly status?: number;
}

export class DiscoveryError extends FhirDslError<"smart.discovery", DiscoveryErrorContext> {
  readonly kind = "smart.discovery" as const;
  readonly url: string;
  readonly status?: number;

  constructor(message: string, url: string, status?: number) {
    super(message, { url, ...(status !== undefined ? { status } : {}) });
    this.url = url;
    if (status !== undefined) this.status = status;
  }
}
