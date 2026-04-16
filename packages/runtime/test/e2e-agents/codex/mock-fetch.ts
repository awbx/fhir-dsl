export interface RecordedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  bodyText?: string | undefined;
}

type ResponseFactory = (request: RecordedRequest) => Response | Promise<Response>;

function normalizeHeaders(init?: HeadersInit): Record<string, string> {
  const headers = new Headers(init);
  return Object.fromEntries([...headers.entries()].map(([key, value]) => [key.toLowerCase(), value]));
}

export class MockFetch {
  readonly requests: RecordedRequest[] = [];
  readonly #queue: ResponseFactory[] = [];

  enqueue(factory: ResponseFactory): void {
    this.#queue.push(factory);
  }

  enqueueJson(body: unknown, init?: ResponseInit): void {
    this.enqueue(() => {
      const responseInit: ResponseInit = {
        status: init?.status ?? 200,
        headers: {
          "content-type": "application/fhir+json",
          ...(init?.headers ? normalizeHeaders(init.headers) : {}),
        },
      };
      if (init?.statusText !== undefined) {
        responseInit.statusText = init.statusText;
      }
      return new Response(JSON.stringify(body), responseInit);
    });
  }

  enqueueText(body: string, init?: ResponseInit): void {
    this.enqueue(() => {
      const responseInit: ResponseInit = { status: init?.status ?? 200 };
      if (init?.statusText !== undefined) {
        responseInit.statusText = init.statusText;
      }
      if (init?.headers !== undefined) {
        responseInit.headers = init.headers;
      }
      return new Response(body, responseInit);
    });
  }

  get fetch(): typeof globalThis.fetch {
    return (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      const headers = normalizeHeaders(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      let bodyText: string | undefined;
      if (typeof init?.body === "string") {
        bodyText = init.body;
      } else if (init?.body instanceof URLSearchParams) {
        bodyText = init.body.toString();
      }

      const request: RecordedRequest = { url, method, headers, bodyText };
      this.requests.push(request);

      const next = this.#queue.shift();
      if (!next) {
        throw new Error(`Unexpected fetch request: ${method} ${url}`);
      }
      return next(request);
    }) as typeof globalThis.fetch;
  }
}
