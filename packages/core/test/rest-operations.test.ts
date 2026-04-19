/**
 * FHIR R5 REST — core client operations test suite.
 *
 * Complements packages/runtime/test/rest-spec-compliance.test.ts by covering
 * the FhirClient-surface operations (read / transaction / batch / search)
 * and enumerating what is MISSING from the interaction matrix.
 *
 * Mocks `fetch` only.
 *
 * Sources:
 *   audit/spec/r5-rest-rules.md       — REST-* / OP-* rules
 *   audit/impl/runtime-impl-map.md    — file:line citations
 *   audit/impl/core-impl-map.md       — interaction matrix §23
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFhirClient, type FhirRequestError } from "../src/fhir-client.js";

const BASE = "https://example.org/fhir";

function queuedFetch(
  scripted: Array<{ status?: number; statusText?: string; body?: unknown; headers?: Record<string, string> }>,
): typeof globalThis.fetch {
  let i = 0;
  const fn = vi.fn(async (_url: string, _init?: RequestInit) => {
    const spec = scripted[i++] ?? { status: 200, body: {} };
    return {
      status: spec.status ?? 200,
      statusText: spec.statusText ?? "OK",
      ok: (spec.status ?? 200) >= 200 && (spec.status ?? 200) < 300,
      headers: new Headers(spec.headers ?? {}),
      json: async () => spec.body ?? {},
      text: async () => (spec.body !== undefined ? JSON.stringify(spec.body) : ""),
    } as unknown as Response;
  });
  return fn as unknown as typeof globalThis.fetch;
}

type TestSchema = {
  resources: {
    Patient: { resourceType: "Patient"; id?: string; active?: boolean };
    Observation: { resourceType: "Observation"; id?: string; status?: string };
  };
  searchParams: {
    Patient: { family: { type: "string"; value: string } };
    Observation: { status: { type: "token"; value: string } };
  };
  includes: Record<string, Record<string, string>>;
  revIncludes: Record<string, Record<string, string>>;
  profiles: Record<string, never>;
};

function makeClient(fetchFn: typeof globalThis.fetch) {
  return createFhirClient<TestSchema>({ baseUrl: BASE, fetch: fetchFn });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

/* -------------------------------------------------------------------------- */
/* REST-READ-001 — GET /<Type>/<id>                                           */
/* -------------------------------------------------------------------------- */

describe("read (REST-READ-*)", () => {
  it("REST-READ-001: GET /<Type>/<id> with Accept: application/fhir+json", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Patient", id: "123", active: true } }]);
    const client = makeClient(fetchFn);
    const result = await client.read("Patient", "123").execute();
    expect(result).toMatchObject({ resourceType: "Patient", id: "123" });
    const [url, init] = (fetchFn as any).mock.calls[0];
    expect(String(url)).toBe(`${BASE}/Patient/123`);
    expect((init.method ?? "GET").toUpperCase()).toBe("GET");
    expect(init.headers.Accept).toBe("application/fhir+json");
  });

  it("REST-READ-002: 404 surfaces as FhirRequestError with status=404", async () => {
    const fetchFn = queuedFetch([
      { status: 404, statusText: "Not Found", body: { resourceType: "OperationOutcome", issue: [] } },
    ]);
    const client = makeClient(fetchFn);
    await expect(client.read("Patient", "missing").execute()).rejects.toMatchObject({
      name: "FhirRequestError",
      status: 404,
    });
  });

  it("REST-READ-002: 410 Gone surfaces separately (via .status) — caller can distinguish", async () => {
    const fetchFn = queuedFetch([
      { status: 410, statusText: "Gone", body: { resourceType: "OperationOutcome", issue: [] } },
    ]);
    const client = makeClient(fetchFn);
    await expect(client.read("Patient", "deleted").execute()).rejects.toSatisfy(
      (err: FhirRequestError) => err.status === 410,
    );
  });

  it.todo("REST-READ-003: HEAD /<Type>/<id> — header-only probe (MISSING)");
  it.todo("REST-READ-004: _format override via typed API (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-VREAD-* — all MISSING                                                 */
/* -------------------------------------------------------------------------- */

describe("vread (REST-VREAD-*)", () => {
  it.todo("REST-VREAD-001: GET /<Type>/<id>/_history/<vid>");
  it.todo("REST-VREAD-002: 410 Gone for deleted versions");
});

/* -------------------------------------------------------------------------- */
/* REST-UPDATE-* — direct update MISSING on FhirClient                        */
/* -------------------------------------------------------------------------- */

describe("update (REST-UPDATE-*)", () => {
  it("REST-UPDATE-001 (transaction-only): transaction.update(resource) emits PUT entry", async () => {
    const fetchFn = queuedFetch([
      {
        status: 200,
        body: {
          resourceType: "Bundle",
          type: "transaction-response",
          entry: [{ response: { status: "200 OK" } }],
        },
      },
    ]);
    const client = makeClient(fetchFn);
    await client
      .transaction()
      .update({ resourceType: "Patient", id: "123", active: true } as any)
      .execute();
    const [, init] = (fetchFn as any).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.resourceType).toBe("Bundle");
    expect(body.type).toBe("transaction");
    expect(body.entry[0].request.method).toBe("PUT");
    expect(body.entry[0].request.url).toBe("Patient/123");
  });

  it.todo("REST-UPDATE-001: direct client.update(resource) outside transaction (MISSING)");
  it.todo("REST-UPDATE-006: If-Match request header — version-aware update (MISSING)");
  it.todo("REST-UPDATE-004: Location / ETag / Last-Modified response headers readable (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-CREATE-* — direct create MISSING                                      */
/* -------------------------------------------------------------------------- */

describe("create (REST-CREATE-*)", () => {
  it("REST-CREATE-001 (transaction-only): transaction.create(resource) emits POST entry", async () => {
    const fetchFn = queuedFetch([
      {
        status: 200,
        body: {
          resourceType: "Bundle",
          type: "transaction-response",
          entry: [{ response: { status: "201 Created", location: `${BASE}/Patient/new/_history/1` } }],
        },
      },
    ]);
    const client = makeClient(fetchFn);
    await client
      .transaction()
      .create({ resourceType: "Patient", active: true } as any)
      .execute();
    const [, init] = (fetchFn as any).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.entry[0].request.method).toBe("POST");
    expect(body.entry[0].request.url).toBe("Patient");
  });

  it.todo("REST-CREATE-001: direct client.create(resource) outside transaction (MISSING)");
  it.todo("REST-COND-CREATE-001: conditional create via If-None-Exist header (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-DELETE-* — direct delete MISSING                                      */
/* -------------------------------------------------------------------------- */

describe("delete (REST-DELETE-*)", () => {
  it("REST-DELETE-001 (transaction-only): transaction.delete emits DELETE entry", async () => {
    const fetchFn = queuedFetch([
      {
        status: 200,
        body: {
          resourceType: "Bundle",
          type: "transaction-response",
          entry: [{ response: { status: "204 No Content" } }],
        },
      },
    ]);
    const client = makeClient(fetchFn);
    await client.transaction().delete("Patient", "123").execute();
    const [, init] = (fetchFn as any).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.entry[0].request.method).toBe("DELETE");
    expect(body.entry[0].request.url).toBe("Patient/123");
  });

  it.todo("REST-DELETE-001: direct client.delete(rt, id) outside transaction (MISSING)");
  it.todo("REST-COND-DELETE-001: DELETE /<Type>?<search> conditional delete (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-PATCH-* — entirely MISSING                                            */
/* -------------------------------------------------------------------------- */

describe("patch (REST-PATCH-*)", () => {
  it.todo("REST-PATCH-001: PATCH with application/json-patch+json (MISSING)");
  it.todo("REST-PATCH-001: PATCH with application/xml-patch+xml (MISSING)");
  it.todo("REST-PATCH-001: PATCH with FHIRPath Patch as Parameters resource (MISSING)");
  it.todo("REST-PATCH-003: If-Match required on PATCH (MISSING)");
  it.todo("REST-COND-PATCH-001: conditional patch via search URL (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-BUND-* — transaction / batch shape                                    */
/* -------------------------------------------------------------------------- */

describe("transaction / batch (REST-BUND-*)", () => {
  it("REST-BUND-001: POST [base] with Bundle.type=transaction", async () => {
    const fetchFn = queuedFetch([
      { status: 200, body: { resourceType: "Bundle", type: "transaction-response", entry: [] } },
    ]);
    const client = makeClient(fetchFn);
    await client
      .transaction()
      .create({ resourceType: "Patient" } as any)
      .execute();
    const [url, init] = (fetchFn as any).mock.calls[0];
    // POST to base — the root URL (trailing slash handling varies, just assert host+fhir).
    expect(String(url)).toMatch(/example\.org\/fhir\/?$/);
    expect((init.method ?? "POST").toUpperCase()).toBe("POST");
    const body = JSON.parse(init.body as string);
    expect(body.type).toBe("transaction");
  });

  it("REST-BUND-001: batch() emits Bundle.type=batch", async () => {
    const fetchFn = queuedFetch([{ status: 200, body: { resourceType: "Bundle", type: "batch-response", entry: [] } }]);
    const client = makeClient(fetchFn);
    await client
      .batch()
      .create({ resourceType: "Patient" } as any)
      .execute();
    const [, init] = (fetchFn as any).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.type).toBe("batch");
  });

  it("REST-BUND-007: response Bundle is returned verbatim for caller inspection", async () => {
    const responseBundle = {
      resourceType: "Bundle",
      type: "transaction-response",
      entry: [
        {
          response: {
            status: "201 Created",
            location: `${BASE}/Patient/new/_history/1`,
            etag: 'W/"1"',
          },
        },
      ],
    };
    const fetchFn = queuedFetch([{ status: 200, body: responseBundle }]);
    const client = makeClient(fetchFn);
    const result = await client
      .transaction()
      .create({ resourceType: "Patient" } as any)
      .execute();
    expect(result).toEqual(responseBundle);
  });

  it("REST-BUND-004: transaction entry.fullUrl is populated as urn:uuid for cross-entry references", async () => {
    // Spec R5 §3.2.0.11.3: `urn:uuid:<id>` placeholders let later entries
    // reference a resource being created in the same transaction; the server
    // rewrites the placeholders during commit.
    const fetchFn = queuedFetch([
      { status: 200, body: { resourceType: "Bundle", type: "transaction-response", entry: [] } },
    ]);
    const client = makeClient(fetchFn);
    await client
      .transaction()
      .create({ resourceType: "Patient" } as any)
      .execute();
    const [, init] = (fetchFn as any).mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body.entry[0].fullUrl).toMatch(/^urn:uuid:[0-9a-f-]+$/i);
  });

  it.todo("REST-BUND-006: entry.request.ifNoneExist for conditional-create inside transaction (MISSING)");
});

/* -------------------------------------------------------------------------- */
/* REST-HIST-* / REST-CAP-* — MISSING                                         */
/* -------------------------------------------------------------------------- */

describe("history / capabilities (REST-HIST-* / REST-CAP-*)", () => {
  it.todo("REST-HIST-001: GET /<Type>/<id>/_history (instance history) — MISSING");
  it.todo("REST-HIST-001: GET /<Type>/_history (type history) — MISSING");
  it.todo("REST-HIST-001: GET /_history (system history) — MISSING");
  it.todo("REST-CAP-001: GET /metadata → CapabilityStatement — MISSING");
  it.todo("REST-CAP-004: OPTIONS [base] alternative — MISSING");
});

/* -------------------------------------------------------------------------- */
/* OP-* — operations framework entirely MISSING                               */
/* -------------------------------------------------------------------------- */

describe("operations framework (OP-*)", () => {
  it.todo("OP-INV-001: POST /$op / /<Type>/$op / /<Type>/<id>/$op (MISSING)");
  it.todo("OP-INV-003: GET allowed when all params primitive AND affectsState=false (MISSING)");
  it.todo("OP-PARM-001: Parameters resource request body (MISSING)");
  it.todo("OP-PARM-004: single `return` Resource unwrapping (MISSING)");
  it.todo("OP-VAL-001..005: $validate with mode/profile/usageContext");
  it.todo("OP-EV-001/002: Patient/<id>/$everything — Bundle response, paginated");
  it.todo("OP-EXP-001..004: ValueSet/$expand with url/valueSet/filter/count");
  it.todo("OP-LOOK-001/002: CodeSystem/$lookup");
  it.todo("OP-TRAN-001/002: ConceptMap/$translate");
  it.todo("OP-DOC-001/002: Composition/<id>/$document");
});

/* -------------------------------------------------------------------------- */
/* Auth: 401 onUnauthorized retry                                             */
/* -------------------------------------------------------------------------- */

describe("401 onUnauthorized retry (core/fhir-client)", () => {
  it("invokes onUnauthorized() once and retries on 401", async () => {
    const fetchFn = queuedFetch([
      { status: 401, body: {} },
      { status: 200, body: { resourceType: "Patient", id: "ok" } },
    ]);
    const onUnauthorized = vi.fn(async () => undefined);
    const client = createFhirClient<TestSchema>({
      baseUrl: BASE,
      fetch: fetchFn,
      auth: {
        getAuthorization: async () => "Bearer x",
        onUnauthorized,
      } as any,
    });
    const result = await client.read("Patient", "1").execute();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ id: "ok" });
    expect((fetchFn as any).mock.calls).toHaveLength(2);
  });
});
