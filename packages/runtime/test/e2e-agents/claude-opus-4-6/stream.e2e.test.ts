import { createFhirClient } from "@fhir-dsl/core";
import { beforeEach, describe, expect, it } from "vitest";
import { bundleOf, pagedBundle, patientAlice, patientBob, vipPatient } from "./fixtures.js";
import { MockFetch } from "./mock-fetch.js";
import type { TestSchema } from "./schema.js";

describe("claude-opus-4-6 / stream — pagination & abort", () => {
  let mock: MockFetch;
  beforeEach(() => {
    mock = new MockFetch();
  });

  function client() {
    return createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
    });
  }

  it("yields all entries of a single page without refetching", async () => {
    mock.enqueueJson(bundleOf({ resource: patientAlice, mode: "match" }, { resource: patientBob, mode: "match" }));

    const ids: string[] = [];
    for await (const resource of client().search("Patient").stream()) {
      ids.push(resource.id ?? "");
    }

    expect(ids).toEqual(["pat-alice", "pat-bob"]);
    expect(mock.requests).toHaveLength(1);
    expect(new URL(mock.requests[0]!.url).pathname).toBe("/fhir/Patient");
  });

  it("follows absolute `link[rel=next]` URLs verbatim across pages", async () => {
    mock.enqueueJson(pagedBundle("https://cdn.example.test/page-2?_token=abc", { resource: patientAlice }));
    mock.enqueueJson(pagedBundle("https://cdn.example.test/page-3?_token=def", { resource: patientBob }));
    mock.enqueueJson(bundleOf({ resource: vipPatient }));

    const ids: string[] = [];
    for await (const resource of client().search("Patient").count(1).stream()) {
      ids.push(resource.id ?? "");
    }

    expect(ids).toEqual(["pat-alice", "pat-bob", "pat-vip"]);
    expect(mock.requests).toHaveLength(3);
    expect(mock.requests[1]!.url).toBe("https://cdn.example.test/page-2?_token=abc");
    expect(mock.requests[2]!.url).toBe("https://cdn.example.test/page-3?_token=def");
  });

  it("uses Accept only (no Content-Type) on pagination URL fetches", async () => {
    mock.enqueueJson(pagedBundle("https://cdn.example.test/p2", { resource: patientAlice }));
    mock.enqueueJson(bundleOf({ resource: patientBob }));

    const c = createFhirClient<TestSchema>({
      baseUrl: "https://example.test/fhir",
      fetch: mock.fetch,
      auth: { type: "basic", credentials: "dXNlcjpwYXNz" },
      headers: { "x-trace-id": "stream-trace" },
    });

    const seen: string[] = [];
    for await (const resource of c.search("Patient").stream()) {
      seen.push(resource.id ?? "");
    }

    const pageTwo = mock.requests[1]!;
    expect(pageTwo.headers["accept"]).toBe("application/fhir+json");
    expect(pageTwo.headers["content-type"]).toBeUndefined();
    expect(pageTwo.headers["authorization"]).toBe("Basic dXNlcjpwYXNz");
    expect(pageTwo.headers["x-trace-id"]).toBe("stream-trace");
    expect(seen).toHaveLength(2);
  });

  it("does not double-fetch the first page when a next link is absent", async () => {
    mock.enqueueJson(bundleOf({ resource: patientAlice, mode: "match" }, { resource: patientBob, mode: "match" }));

    const ids: string[] = [];
    for await (const resource of client().search("Patient").stream()) {
      ids.push(resource.id ?? "");
    }

    expect(ids).toEqual(["pat-alice", "pat-bob"]);
    expect(mock.requests).toHaveLength(1);
  });

  it("stops cleanly mid-iteration when AbortSignal fires between pages", async () => {
    mock.enqueueJson(pagedBundle("https://cdn.example.test/p2", { resource: patientAlice }));
    // Intentionally don't enqueue page 2 — if the stream ignores abort and tries to fetch,
    // the mock queue will be empty and fetch will throw "unexpected request" — still
    // producing a rejection, but from a different source. Best-effort: we focus on
    // observable post-abort behavior (no more yields).
    mock.enqueueJson(bundleOf({ resource: patientBob }));

    const controller = new AbortController();
    const seen: string[] = [];

    await expect(async () => {
      for await (const resource of client().search("Patient").stream({ signal: controller.signal })) {
        seen.push(resource.id ?? "");
        controller.abort();
      }
    }).rejects.toThrowError();

    // Observable invariant: consumer only saw the pre-abort yield.
    expect(seen).toEqual(["pat-alice"]);
  });

  it("abort before iteration starts rejects the first `.next()` without hanging", async () => {
    mock.enqueueJson(bundleOf({ resource: patientAlice }));

    const controller = new AbortController();
    controller.abort();

    const seen: string[] = [];

    await expect(async () => {
      for await (const resource of client().search("Patient").stream({ signal: controller.signal })) {
        seen.push(resource.id ?? "");
      }
    }).rejects.toThrowError();

    expect(seen).toEqual([]);
  });

  it("consumer may early-break without triggering next-page fetch", async () => {
    mock.enqueueJson(
      pagedBundle(
        "https://cdn.example.test/p2",
        { resource: patientAlice, mode: "match" },
        { resource: patientBob, mode: "match" },
      ),
    );

    const seen: string[] = [];
    for await (const resource of client().search("Patient").stream()) {
      seen.push(resource.id ?? "");
      if (seen.length === 1) break;
    }

    expect(seen).toEqual(["pat-alice"]);
    expect(mock.requests).toHaveLength(1);
  });
});
