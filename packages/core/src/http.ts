import { type AuthProvider, resolveAuthProvider } from "./auth.js";
import { computeBackoffMs, parseRetryAfter, type RetryConfig, resolveRetryPolicy } from "./retry.js";

export interface HttpConfig {
  baseUrl: string;
  auth?: import("./auth.js").AuthConfig | undefined;
  headers?: Record<string, string> | undefined;
  fetch?: typeof globalThis.fetch | undefined;
  /**
   * Retry transient failures (429, 503) per REST-6 spec guidance. `true` or
   * `undefined` applies the default policy; `false` disables retries; a
   * `RetryPolicy` object customizes thresholds.
   */
  retry?: RetryConfig;
}

export interface HttpRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  /** Propagated to the underlying fetch() so in-flight requests can be aborted. */
  signal?: AbortSignal;
}

export interface HttpResponse {
  status: number;
  statusText: string;
  ok: boolean;
  json(): Promise<unknown>;
  text(): Promise<string>;
  headers: Headers;
}

export async function performRequest(config: HttpConfig, req: HttpRequest): Promise<HttpResponse> {
  const fetchFn = config.fetch ?? globalThis.fetch;
  const provider = resolveAuthProvider(config.auth);
  const retry = resolveRetryPolicy(config.retry);

  const send = async (provider: AuthProvider | undefined): Promise<Response> => {
    const headers: Record<string, string> = { ...req.headers };
    if (provider) {
      const authHeader = await provider.getAuthorization({ url: req.url, method: req.method });
      if (authHeader) headers.Authorization = authHeader;
    }
    return fetchFn(req.url, {
      method: req.method,
      headers,
      ...(req.body != null ? { body: req.body } : {}),
      ...(req.signal !== undefined ? { signal: req.signal } : {}),
    });
  };

  let response = await send(provider);

  if (response.status === 401 && provider?.onUnauthorized) {
    await provider.onUnauthorized();
    response = await send(provider);
  }

  if (retry) {
    // Attempt 1 already happened above; retry up to maxAttempts - 1 more times.
    for (let attempt = 1; attempt < retry.maxAttempts; attempt++) {
      if (!retry.retryOn.includes(response.status)) break;
      const headerDelay = parseRetryAfter(response.headers?.get("retry-after"));
      const delay = headerDelay ?? computeBackoffMs(retry, attempt - 1);
      await retry.sleep(delay, req.signal);
      response = await send(provider);
    }
  }

  return response;
}
