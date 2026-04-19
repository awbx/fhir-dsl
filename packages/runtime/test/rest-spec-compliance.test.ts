/**
 * FHIR R5 REST — runtime compliance test suite for @fhir-dsl/runtime.
 *
 * Every test cites a REST-* or OP-* rule ID from audit/spec/r5-rest-rules.md,
 * and asserts either the request shape the DSL emits or the response shape
 * it surfaces to the caller. Mocks `fetch` only (spec-external boundary).
 *
 * Test shapes:
 *   - it(...)            — passes today; regression pin for IMPLEMENTED rules.
 *   - test.fails(...)    — rule is IMPLEMENTED but spec-incorrect; the
 *                          assertion describes SPEC-REQUIRED behavior and
 *                          will only pass once the DSL is fixed.
 *   - it.todo(...)       — rule is MISSING.
 *
 * Do NOT weaken assertions to silence a failure. If a test.fails() starts
 * passing, flip it to it(...) and delete the wrapper.
 *
 * Sources:
 *   audit/spec/r5-rest-rules.md      — REST-* / OP-* rule IDs + spec quotes
 *   audit/impl/runtime-impl-map.md   — file:line citations per rule
 */

import type { CompiledQuery } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type FhirError, FhirExecutor, paginate } from "../src/index.js";

/** Build a mock fetch that returns one scripted response per call. */
function queuedFetch(
  scripted: Array<{
    status?: number;
    statusText?: string;
    body?: unknown;
    bodyText?: string;
    headers?: Record<string, string>;
  }>,
): typeof globalThis.fetch {
  let i = 0;
  const fn = vi.fn(async (_url: string, _init?: RequestInit) => {
    const spec = scripted[i++] ?? { status: 200, body: {} };
    const headers = new Headers(spec.headers ?? {});
    return {
      status: spec.status ?? 200,
      statusText: spec.statusText ?? "OK",
      ok: (spec.status ?? 200) >= 200 && (spec.status ?? 200) < 300,
      headers,
      json: async () => {
        if (spec.body !== undefined) return spec.body;
        if (spec.bodyText !== undefined) return JSON.parse(spec.bodyText);
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => spec.bodyText ?? (spec.body !== undefined ? JSON.stringify(spec.body) : ""),
    } as unknown as Response;
  });
  (fn as any).calls = () => fn.mock.calls;
  return fn as unknown as typeof globalThis.fetch;
}

const BASE = "https://example.org/fhir";

function makeExecutor(fetchFn: typeof globalThis.fetch) {
  return new FhirExecutor({ baseUrl: BASE, fetch: fetchFn });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */
/* REST-MIME-001 / REST-READ-001 — default Accept + Content-Type             */
/* -------------------------------------------------------------------------- */

describe("Default MIME handling (REST-MIME-001)", () => {
  it("emits `Accept: application/fhir+json` on GET", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Patient", id: "1" } }]);
    await makeExecutor(fetchFn).execute({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery);
    const [, init] = (fetchFn as any).mock.calls[0];
    expect(init.headers.Accept).toBe("application/fhir+json");
  });

  it("emits `Content-Type: application/fhir+json` by default for body-carrying requests", async () => {
    const fetchFn = queuedFetch([{ status: 201, body: { resourceType: "Patient", id: "2" } }]);
    await makeExecutor(fetchFn).execute({
      method: "POST",
      path: "Patient",
      params: [],
      body: { resourceType: "Patient" },
    } as CompiledQuery);
    const [, init] = (fetchFn as any).mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/fhir+json");
  });

  it("per-query Content-Type override wins (e.g. form-urlencoded for POST _search)", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Bundle", type: "searchset", entry: [] } }]);
    await makeExecutor(fetchFn).execute({
      method: "POST",
      path: "Patient/_search",
      params: [],
      body: "family=Smith",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    } as CompiledQuery);
    const [, init] = (fetchFn as any).mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
  });
});

/* -------------------------------------------------------------------------- */
/* REST-ERR-001 / REST-ERR-002 — OperationOutcome surfacing                   */
/* -------------------------------------------------------------------------- */

describe("Error surfacing (REST-ERR-*)", () => {
  it("REST-ERR-001: 4xx with JSON OperationOutcome is attached to FhirError", async () => {
    const outcome = {
      resourceType: "OperationOutcome",
      issue: [{ severity: "error", code: "invalid", diagnostics: "bad id" }],
    };
    const fetchFn = queuedFetch([{ status: 400, statusText: "Bad Request", body: outcome }]);
    await expect(
      makeExecutor(fetchFn).execute({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery),
    ).rejects.toMatchObject({ status: 400, operationOutcome: outcome });
  });

  it("REST-ERR-002: FhirError.issues exposes the OperationOutcome.issue[] array", async () => {
    const outcome = {
      resourceType: "OperationOutcome",
      issue: [
        { severity: "warning", code: "informational" },
        { severity: "error", code: "invalid" },
      ],
    };
    const fetchFn = queuedFetch([{ status: 422, body: outcome }]);
    await makeExecutor(fetchFn)
      .execute({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery)
      .catch((err: FhirError) => {
        expect(err.issues).toHaveLength(2);
        expect(err.issues[0]?.severity).toBe("warning");
      });
  });

  it("REST-ERR-001: non-JSON error body (gateway HTML, auth-proxy text) is preserved on FhirError.responseText (BUG-022)", async () => {
    const fetchFn = vi.fn(
      async () =>
        ({
          status: 502,
          statusText: "Bad Gateway",
          ok: false,
          headers: new Headers({ "Content-Type": "text/html" }),
          json: async () => {
            throw new SyntaxError("Unexpected token < in JSON at position 0");
          },
          text: async () => "<html><body>502 Bad Gateway</body></html>",
        }) as unknown as Response,
    );
    await expect(
      new FhirExecutor({ baseUrl: BASE, fetch: fetchFn as unknown as typeof globalThis.fetch }).execute({
        method: "GET",
        path: "Patient/1",
        params: [],
      } as CompiledQuery),
    ).rejects.toSatisfy((err: FhirError) => err.responseText === "<html><body>502 Bad Gateway</body></html>");
  });
});

/* -------------------------------------------------------------------------- */
/* REST-DELETE-003 — 204 / 201 / non-JSON success responses                   */
/* -------------------------------------------------------------------------- */

describe("Success-path response handling (REST-DELETE-003 / REST-CREATE-002)", () => {
  it("REST-DELETE-003: 204 No Content resolves to undefined (no .json() call)", async () => {
    const fetchFn = vi.fn(
      async () =>
        ({
          status: 204,
          statusText: "No Content",
          ok: true,
          headers: new Headers(),
          json: async () => {
            throw new SyntaxError("Unexpected end of JSON input");
          },
          text: async () => "",
        }) as unknown as Response,
    );
    await expect(
      new FhirExecutor({ baseUrl: BASE, fetch: fetchFn as unknown as typeof globalThis.fetch }).execute({
        method: "DELETE",
        path: "Patient/1",
        params: [],
      } as CompiledQuery),
    ).resolves.toBeUndefined();
  });

  it("REST-CREATE-002: Location header surfaced via result.location / result.headers.Location (BUG-020)", async () => {
    const fetchFn = queuedFetch([
      {
        status: 201,
        statusText: "Created",
        body: {},
        headers: {
          Location: `${BASE}/Patient/new-id/_history/1`,
          ETag: 'W/"1"',
          "Last-Modified": "Tue, 15 Nov 2024 12:45:26 GMT",
        },
      },
    ]);
    const result = await makeExecutor(fetchFn).execute<any>({
      method: "POST",
      path: "Patient",
      params: [],
      body: { resourceType: "Patient" },
    } as CompiledQuery);
    expect(result?.location ?? result?.headers?.Location).toBe(`${BASE}/Patient/new-id/_history/1`);
  });
});

/* -------------------------------------------------------------------------- */
/* REST-HDR-* — Prefer, ETag, If-Match round-trip                             */
/* -------------------------------------------------------------------------- */

describe("Prefer / ETag / If-Match (REST-HDR-*)", () => {
  it.todo("REST-HDR-001: Prefer: return=minimal plumbed via typed API");
  it.todo("REST-HDR-002: Prefer: return=representation plumbed via typed API");
  it.todo("REST-HDR-003: Prefer: return=OperationOutcome plumbed via typed API");
  it.todo("REST-HDR-005: Prefer: handling=strict|lenient plumbed via typed API");
  it.todo("REST-HDR-006: Prefer: respond-async plumbed via typed API");

  /**
   * decisions.md REST.3 — ETag response header dropped. The spec (§2.1.0.6)
   * requires clients preserve ETag in order to build `If-Match` on the next
   * update. The executor currently unwraps `response.json()` and returns only
   * the body; headers never reach the caller. Promoted from `it.todo` to
   * `test.fails` per ratified decisions — this is a BUG, not a SPEC-GAP.
   */
  it("REST-HDR-007 / decisions.md REST.3: ETag response header surfaced via result.etag / result.headers.ETag (BUG-021)", async () => {
    const fetchFn = queuedFetch([
      {
        status: 200,
        body: { resourceType: "Patient", id: "1" },
        headers: { ETag: 'W/"7"', "Last-Modified": "Tue, 15 Nov 2024 12:45:26 GMT" },
      },
    ]);
    const result = await makeExecutor(fetchFn).execute<any>({
      method: "GET",
      path: "Patient/1",
      params: [],
    } as CompiledQuery);
    expect(result?.etag ?? result?.headers?.ETag).toBe('W/"7"');
  });

  it.todo("REST-HDR-008: Location response header readable from executor result");
  it.todo("REST-HDR-009: Last-Modified response header readable from executor result");
  it.todo("REST-UPDATE-006: If-Match request header plumbed via typed API");
});

/* -------------------------------------------------------------------------- */
/* REST-SEARCH-001 — POST _search Content-Type                                */
/* -------------------------------------------------------------------------- */

describe("POST _search (REST-SEARCH-001)", () => {
  it("Content-Type: application/x-www-form-urlencoded on POST body", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Bundle", type: "searchset", entry: [] } }]);
    await makeExecutor(fetchFn).execute({
      method: "POST",
      path: "Patient/_search",
      params: [],
      body: "family=Smith&given=John",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    } as CompiledQuery);
    const [, init] = (fetchFn as any).mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(init.body).toBe("family=Smith&given=John");
  });

  it("POST _search path has `/_search` suffix", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Bundle", type: "searchset", entry: [] } }]);
    await makeExecutor(fetchFn).execute({
      method: "POST",
      path: "Patient/_search",
      params: [],
      body: "family=Smith",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    } as CompiledQuery);
    const [url] = (fetchFn as any).mock.calls[0];
    expect(String(url).endsWith("Patient/_search")).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/* Paging semantics (REST-SEARCH + SRCH-PAGE-*)                               */
/* -------------------------------------------------------------------------- */

describe("Pagination (paginate / fetchAllPages)", () => {
  it("yields each page in order and terminates when next link is absent", async () => {
    const pageA = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "a1" } }],
      link: [{ relation: "next", url: `${BASE}/Patient?page=2` }],
    };
    const pageB = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "b1" } }],
    };
    const fetchFn = queuedFetch([{ status: 200, body: pageB }]);
    const executor = makeExecutor(fetchFn);

    const collected: string[] = [];
    for await (const page of paginate<any>(executor, pageA as any)) {
      collected.push(...page.map((r: any) => r.id));
    }
    expect(collected).toEqual(["a1", "b1"]);
  });

  it("handles non-Bundle response gracefully (empty entry array)", async () => {
    const first = { resourceType: "Bundle", type: "searchset", entry: [] };
    const fetchFn = queuedFetch([]);
    const executor = makeExecutor(fetchFn);
    const all: any[] = [];
    for await (const page of paginate<any>(executor, first as any)) {
      all.push(...page);
    }
    expect(all).toEqual([]);
  });

  /**
   * decisions.md REST.8 — Security BUG-HIGH. `paginate()` passes the
   * server-controlled `nextLink.url` verbatim to `executor.executeUrl`,
   * which in turn attaches the configured `Authorization` header
   * (see executor.ts `executeUrl` + performRequest auth insertion).
   * An attacker-controlled FHIR server can set a next link pointing
   * to a host it controls and receive the caller's bearer token.
   *
   * Spec: §3.1.1.1 and HTTP semantics permit cross-host next links,
   * but security best-practice (RFC 6750 §5.3) says bearer tokens
   * MUST NOT be sent to arbitrary third parties without user consent.
   * A spec-compliant DSL MUST either refuse cross-host next URLs or
   * strip credentials before following them.
   */
  it("runtime-impl-map / decisions.md REST.8 (SECURITY): Authorization header must NOT be forwarded to a cross-host next link", async () => {
    const firstPage = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "p1" } }],
      // Server-controlled next link — attacker-controlled host.
      link: [{ relation: "next", url: "https://attacker.example.com/steal?page=2" }],
    };
    const secondPage = { resourceType: "Bundle", type: "searchset", entry: [] };
    const fetchFn = queuedFetch([{ status: 200, body: secondPage }]);
    const executor = new FhirExecutor({
      baseUrl: BASE, // legitimate host
      fetch: fetchFn,
      auth: { getAuthorization: async () => "Bearer SECRET-TOKEN" } as any,
    });

    // Drain the generator to trigger the next-link fetch.
    for await (const _page of paginate<any>(executor, firstPage as any)) {
      /* consume */
    }

    // Find the request to the attacker host.
    const call = (fetchFn as any).mock.calls.find((c: any[]) =>
      String(c[0]).startsWith("https://attacker.example.com"),
    );
    expect(call).toBeDefined();
    const [, init] = call;
    // Spec-correct / security-correct: bearer token MUST NOT be attached
    // to the cross-host request. Today it IS attached — the assertion
    // here describes the fix and is expected to fail until it lands.
    expect(init.headers?.Authorization).toBeUndefined();
  });

  it("SRCH-PAGE-002 / runtime-impl-map #3: paginate() detects a cyclic next URL and stops (BUG-019)", async () => {
    const cyclePage = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: { resourceType: "Patient", id: "loop" } }],
      link: [{ relation: "next", url: `${BASE}/Patient?loop=1` }],
    };
    const fetchFn = queuedFetch(Array.from({ length: 5 }).map(() => ({ status: 200, body: cyclePage })));
    const executor = makeExecutor(fetchFn);

    let pagesYielded = 0;
    for await (const _page of paginate<any>(executor, cyclePage as any)) {
      pagesYielded++;
      if (pagesYielded > 2) break;
    }
    expect(pagesYielded).toBe(1);
  });
});

/* -------------------------------------------------------------------------- */
/* AbortSignal (runtime-impl-map #1)                                          */
/* -------------------------------------------------------------------------- */

describe("AbortSignal threading (runtime-impl-map #1)", () => {
  it("AbortSignal is threaded through FhirExecutor.execute() to fetch (BUG-028)", async () => {
    const ac = new AbortController();
    const fetchFn = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.signal?.aborted) throw new DOMException("aborted", "AbortError");
      return {
        status: 200,
        statusText: "OK",
        ok: true,
        headers: new Headers(),
        json: async () => ({ resourceType: "Patient", id: "1" }),
        text: async () => "",
      } as unknown as Response;
    });
    ac.abort();
    await expect(
      new FhirExecutor({ baseUrl: BASE, fetch: fetchFn as unknown as typeof globalThis.fetch }).execute(
        { method: "GET", path: "Patient/1", params: [] } as CompiledQuery,
        { signal: ac.signal },
      ),
    ).rejects.toThrow(/abort/i);
  });
});

/* -------------------------------------------------------------------------- */
/* Retry semantics (runtime-impl-map #2)                                      */
/* -------------------------------------------------------------------------- */

describe("Retry / backoff (runtime-impl-map #2)", () => {
  it("429 Too Many Requests retries honoring Retry-After (BUG-029, FEAT #27)", async () => {
    const fetchFn = queuedFetch([
      { status: 429, statusText: "Too Many Requests", body: {}, headers: { "Retry-After": "0" } },
      { status: 200, body: { resourceType: "Patient", id: "ok" } },
    ]);
    const result = await new FhirExecutor({
      baseUrl: BASE,
      fetch: fetchFn,
      retry: { baseBackoffMs: 0, sleep: async () => undefined },
    }).execute<any>({
      method: "GET",
      path: "Patient/1",
      params: [],
    } as CompiledQuery);
    expect(result?.id).toBe("ok");
    expect((fetchFn as any).mock.calls).toHaveLength(2);
  });

  it("503 Service Unavailable retries with exponential backoff (BUG-029, FEAT #27)", async () => {
    const fetchFn = queuedFetch([
      { status: 503, statusText: "Service Unavailable", body: {} },
      { status: 200, body: { resourceType: "Patient", id: "ok" } },
    ]);
    const sleep = vi.fn(async () => undefined);
    const result = await new FhirExecutor({
      baseUrl: BASE,
      fetch: fetchFn,
      retry: { sleep },
    }).execute<any>({
      method: "GET",
      path: "Patient/1",
      params: [],
    } as CompiledQuery);
    expect(result?.id).toBe("ok");
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it("gives up after maxAttempts and surfaces the final error (BUG-029)", async () => {
    const fetchFn = queuedFetch([
      { status: 503, body: {} },
      { status: 503, body: {} },
      { status: 503, body: {} },
    ]);
    await expect(
      new FhirExecutor({
        baseUrl: BASE,
        fetch: fetchFn,
        retry: { sleep: async () => undefined },
      }).execute({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery),
    ).rejects.toMatchObject({ status: 503 });
    expect((fetchFn as any).mock.calls).toHaveLength(3);
  });

  it("retry: false disables the retry loop entirely", async () => {
    const fetchFn = queuedFetch([
      { status: 503, body: {} },
      { status: 200, body: { resourceType: "Patient", id: "never" } },
    ]);
    await expect(
      new FhirExecutor({ baseUrl: BASE, fetch: fetchFn, retry: false }).execute({
        method: "GET",
        path: "Patient/1",
        params: [],
      } as CompiledQuery),
    ).rejects.toMatchObject({ status: 503 });
    expect((fetchFn as any).mock.calls).toHaveLength(1);
  });
});

/* -------------------------------------------------------------------------- */
/* 401 onUnauthorized contract (runtime-impl-map #9)                          */
/* -------------------------------------------------------------------------- */

describe("401 onUnauthorized single-retry (runtime-impl-map #9)", () => {
  it("invokes provider.onUnauthorized() once and retries the request", async () => {
    const fetchFn = queuedFetch([
      { status: 401, statusText: "Unauthorized", body: {} },
      { status: 200, body: { resourceType: "Patient", id: "retry-ok" } },
    ]);
    const onUnauthorized = vi.fn(async () => undefined);
    const result = await new FhirExecutor({
      baseUrl: BASE,
      fetch: fetchFn,
      auth: {
        getAuthorization: async () => "Bearer x",
        onUnauthorized,
      } as any,
    }).execute<any>({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(result?.id).toBe("retry-ok");
    expect((fetchFn as any).mock.calls).toHaveLength(2);
  });

  it("a second 401 after onUnauthorized surfaces as FhirError (single-retry contract)", async () => {
    const fetchFn = queuedFetch([
      { status: 401, body: {} },
      { status: 401, body: { resourceType: "OperationOutcome", issue: [] } },
    ]);
    const onUnauthorized = vi.fn(async () => undefined);
    await expect(
      new FhirExecutor({
        baseUrl: BASE,
        fetch: fetchFn,
        auth: { getAuthorization: async () => "Bearer x", onUnauthorized } as any,
      }).execute({ method: "GET", path: "Patient/1", params: [] } as CompiledQuery),
    ).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});

/* -------------------------------------------------------------------------- */
/* Interaction matrix — what's MISSING                                        */
/* -------------------------------------------------------------------------- */

describe("Interaction matrix — MISSING on FhirClient (runtime-impl-map §23)", () => {
  it.todo("REST-CAP-001: capabilities() — GET /metadata");
  it.todo("REST-VREAD-001: vread(rt, id, vid) — GET /<rt>/<id>/_history/<vid>");
  it.todo("REST-HIST-001: history(rt?, id?) — GET /<rt>/<id>/_history");
  it.todo("REST-PATCH-001: patch(rt, id, body) with JSON-Patch / XML-Patch / FHIRPath-Patch");
  it.todo("REST-COND-UPDATE-001: conditionalUpdate(rt, search, body)");
  it.todo("REST-COND-DELETE-001: conditionalDelete(rt, search)");
  it.todo("REST-COND-CREATE-001: create(rt, body, { ifNoneExist })");
  it.todo("REST-HEAD-001: head(rt, id) — HEAD /<rt>/<id>");
  it.todo("REST-ASYNC-001..006: async pattern with Prefer: respond-async");
  it.todo("REST-BUND-006: entry.request.ifNoneExist inside transaction");
  it.todo("OP-INV-001..005: operation() — POST /$op / /<rt>/$op / /<rt>/<id>/$op");
  it.todo("OP-VAL-001..005: $validate with mode + profile");
  it.todo("OP-EV-001/002: $everything on Patient/Encounter");
  it.todo("OP-EXP-001..004: ValueSet $expand");
});
