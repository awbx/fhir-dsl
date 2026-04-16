export interface OAuth2ErrorBody {
  error: string;
  error_description?: string;
  error_uri?: string;
  [k: string]: unknown;
}

/**
 * RFC 6749 §5.2 OAuth 2.0 token-endpoint error response.
 */
export class SmartAuthError extends Error {
  constructor(
    public readonly error: string,
    public readonly errorDescription?: string,
    public readonly status?: number,
    public readonly body?: unknown,
  ) {
    super(errorDescription ? `${error}: ${errorDescription}` : error);
    this.name = "SmartAuthError";
  }
}

export class DiscoveryError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DiscoveryError";
  }
}
