export interface RecordedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
}

interface ResponseInit2 {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

type Handler = (req: RecordedRequest) => Response | Promise<Response>;

interface Route {
  method: string;
  match: (url: string) => boolean;
  handler: Handler;
}

/**
 * Router-mode `fetch` mock used by SMART e2e tests. Unlike the queue-based
 * runtime MockFetch, e2e SMART flows make requests against multiple distinct
 * endpoints (discovery, token, FHIR) in orders that depend on caching/refresh
 * behaviour, so routing by URL pattern is the natural model.
 */
export class MockFetch {
  readonly requests: RecordedRequest[] = [];
  private readonly routes: Route[] = [];
  readonly fetch: typeof globalThis.fetch;

  constructor() {
    this.fetch = this.handle.bind(this) as typeof globalThis.fetch;
  }

  on(method: string, pattern: string | RegExp, handler: Handler): this {
    this.routes.push({
      method: method.toUpperCase(),
      match: toMatcher(pattern),
      handler,
    });
    return this;
  }

  onGet(pattern: string | RegExp, handler: Handler): this {
    return this.on("GET", pattern, handler);
  }

  onPost(pattern: string | RegExp, handler: Handler): this {
    return this.on("POST", pattern, handler);
  }

  /** Count of requests that hit a given method+url pattern. */
  countRequests(method: string, pattern: string | RegExp): number {
    const m = toMatcher(pattern);
    const wanted = method.toUpperCase();
    return this.requests.filter((r) => r.method === wanted && m(r.url)).length;
  }

  static json(body: unknown, init: ResponseInit2 = {}): Response {
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      statusText: init.statusText ?? "OK",
      headers: { "content-type": "application/json", ...(init.headers ?? {}) },
    });
  }

  static fhirJson(body: unknown, init: ResponseInit2 = {}): Response {
    return new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      statusText: init.statusText ?? "OK",
      headers: { "content-type": "application/fhir+json", ...(init.headers ?? {}) },
    });
  }

  private async handle(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const method = (
      init?.method ?? (typeof input === "object" && "method" in input ? (input as Request).method : "GET")
    ).toUpperCase();
    const rawHeaders =
      init?.headers ?? (typeof input === "object" && "headers" in input ? (input as Request).headers : undefined);
    const headers = normalizeHeaders(rawHeaders);

    let bodyText: string | null = null;
    if (init?.body != null) {
      bodyText = typeof init.body === "string" ? init.body : String(init.body);
    }

    const recorded: RecordedRequest = { method, url, headers, body: bodyText };
    this.requests.push(recorded);

    for (const r of this.routes) {
      if (r.method === method && r.match(url)) {
        return await r.handler(recorded);
      }
    }
    throw new Error(`MockFetch: no route for ${method} ${url}`);
  }
}

function toMatcher(pattern: string | RegExp): (url: string) => boolean {
  if (pattern instanceof RegExp) return (u) => pattern.test(u);
  return (u) => u === pattern || u.startsWith(pattern) || u.split("?")[0] === pattern;
}

function normalizeHeaders(input: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;
  if (input instanceof Headers) {
    input.forEach((value, key) => {
      out[key.toLowerCase()] = value;
    });
    return out;
  }
  if (Array.isArray(input)) {
    for (const [k, v] of input) {
      if (k !== undefined && v !== undefined) out[k.toLowerCase()] = v;
    }
    return out;
  }
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) out[k.toLowerCase()] = String(v);
  }
  return out;
}
