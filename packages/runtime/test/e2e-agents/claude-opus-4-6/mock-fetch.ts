export interface RecordedRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  signalAborted: boolean;
}

interface ResponseInit2 {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

type Handler = (req: RecordedRequest) => Response | Promise<Response>;

/**
 * Hand-rolled `fetch` mock. No external deps; works on any runtime that has
 * global `Response`/`Request` (Node 18+).
 *
 * Two usage modes:
 *  1. Scripted queue — `.enqueueJson()`, `.enqueueText()`, `.enqueueError()`.
 *     Each call to `fetch` dequeues one handler. Tests fail loudly if the
 *     queue is empty (unexpected network activity) or non-empty at teardown
 *     (missed assertion coverage).
 *  2. Router — `.onGet(pathPattern, handler)` etc., for tests that issue
 *     many requests in no strict order.
 */
export class MockFetch {
  readonly requests: RecordedRequest[] = [];
  private queue: Handler[] = [];
  readonly fetch: typeof globalThis.fetch;

  constructor() {
    this.fetch = this.handle.bind(this) as typeof globalThis.fetch;
  }

  enqueueJson(body: unknown, init: ResponseInit2 = {}): void {
    this.queue.push(
      () =>
        new Response(JSON.stringify(body), {
          status: init.status ?? 200,
          statusText: init.statusText ?? "OK",
          headers: { "content-type": "application/fhir+json", ...(init.headers ?? {}) },
        }),
    );
  }

  enqueueText(body: string, init: ResponseInit2 = {}): void {
    this.queue.push(
      () =>
        new Response(body, {
          status: init.status ?? 200,
          statusText: init.statusText ?? "OK",
          headers: { "content-type": "text/plain", ...(init.headers ?? {}) },
        }),
    );
  }

  enqueueError(err: Error): void {
    this.queue.push(() => {
      throw err;
    });
  }

  /** Pushes a handler that receives the recorded request for assertions. */
  enqueueHandler(handler: Handler): void {
    this.queue.push(handler);
  }

  get remaining(): number {
    return this.queue.length;
  }

  reset(): void {
    this.requests.length = 0;
    this.queue = [];
  }

  private async handle(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const method = init?.method ?? (typeof input === "object" && "method" in input ? (input as Request).method : "GET");
    const rawHeaders =
      init?.headers ?? (typeof input === "object" && "headers" in input ? (input as Request).headers : undefined);
    const headers = normalizeHeaders(rawHeaders);

    let bodyText: string | null = null;
    if (init?.body != null) {
      bodyText = typeof init.body === "string" ? init.body : String(init.body);
    }

    const signal =
      init?.signal ?? (typeof input === "object" && "signal" in input ? (input as Request).signal : undefined);

    if (signal?.aborted) {
      const err = new DOMException("The operation was aborted.", "AbortError");
      throw err;
    }

    const recorded: RecordedRequest = {
      method: method.toUpperCase(),
      url,
      headers,
      body: bodyText,
      signalAborted: false,
    };
    this.requests.push(recorded);

    const handler = this.queue.shift();
    if (!handler) {
      throw new Error(`MockFetch: unexpected ${recorded.method} ${recorded.url} — response queue is empty`);
    }

    if (signal) {
      return await new Promise<Response>((resolve, reject) => {
        const onAbort = () => {
          recorded.signalAborted = true;
          reject(new DOMException("The operation was aborted.", "AbortError"));
        };
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener("abort", onAbort, { once: true });
        Promise.resolve(handler(recorded))
          .then((res) => {
            signal.removeEventListener("abort", onAbort);
            resolve(res);
          })
          .catch((err) => {
            signal.removeEventListener("abort", onAbort);
            reject(err);
          });
      });
    }

    return await handler(recorded);
  }
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
