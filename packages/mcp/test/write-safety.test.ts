import { describe, expect, it, vi } from "vitest";
import { MemoryAuditSink } from "../src/audit.js";
import { createServer } from "../src/server.js";
import type { McpRequest } from "../src/types.js";

const fetchOk = (body: unknown) =>
  vi.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "content-type": "application/fhir+json" },
      }),
  );

const req = (params?: Record<string, unknown>): McpRequest => ({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  ...(params ? { params } : {}),
});

describe("dryRun mode", () => {
  it("short-circuits writes without hitting upstream and returns an informational outcome", async () => {
    const fetchFn = fetchOk({});
    const audit = new MemoryAuditSink();
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      writes: ["create"],
      dryRun: true,
      audit,
      fetch: fetchFn,
    });

    const res = await server.dispatcher.handleRequest(
      req({
        name: "fhir.create",
        arguments: { resourceType: "Patient", params: { resourceType: "Patient", name: [{ given: ["A"] }] } },
      }),
    );

    expect(fetchFn).not.toHaveBeenCalled();
    const result = res.result as { content: Array<{ text: string }>; isError: boolean };
    expect(result.isError).toBe(false);
    const body = JSON.parse(result.content[0]!.text);
    expect(body.resourceType).toBe("OperationOutcome");
    expect(body.issue[0].severity).toBe("information");
    expect(body.issue[0].diagnostics).toContain("dry-run");

    expect(audit.events[0]?.actor).toBe("dry-run");
    expect(audit.events[0]?.result.ok).toBe(true);
  });

  it("does not affect read verbs", async () => {
    const fetchFn = fetchOk({ resourceType: "Patient", id: "abc" });
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      dryRun: true,
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });
    await server.dispatcher.handleRequest(
      req({ name: "fhir.read", arguments: { resourceType: "Patient", id: "abc" } }),
    );
    expect(fetchFn).toHaveBeenCalledOnce();
  });
});

describe("writeResourceTypes allowlist", () => {
  it("rejects writes to resource types outside the allowlist", async () => {
    const fetchFn = fetchOk({});
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient", "Observation"],
      writes: ["create"],
      writeResourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    const res = await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Observation", params: {} } }),
    );

    expect(fetchFn).not.toHaveBeenCalled();
    const body = JSON.parse((res.result as { content: Array<{ text: string }> }).content[0]!.text);
    expect(body.issue[0].code).toBe("forbidden");
    expect(body.issue[0].diagnostics).toContain("Observation");
  });

  it("allows writes to resource types inside the allowlist", async () => {
    const fetchFn = fetchOk({ resourceType: "Patient", id: "new" });
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient", "Observation"],
      writes: ["create"],
      writeResourceTypes: ["Patient"],
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Patient", params: {} } }),
    );
    expect(fetchFn).toHaveBeenCalledOnce();
  });
});

describe("confirmWrites", () => {
  it("rejects writes without confirm: true", async () => {
    const fetchFn = fetchOk({});
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      writes: ["create"],
      confirmWrites: true,
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    const res = await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Patient", params: {} } }),
    );

    expect(fetchFn).not.toHaveBeenCalled();
    const body = JSON.parse((res.result as { content: Array<{ text: string }> }).content[0]!.text);
    expect(body.issue[0].code).toBe("required");
    expect(body.issue[0].diagnostics).toContain("confirm: true");
  });

  it("accepts writes when confirm: true is present", async () => {
    const fetchFn = fetchOk({ resourceType: "Patient", id: "new" });
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      writes: ["create"],
      confirmWrites: true,
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Patient", params: {}, confirm: true } }),
    );
    expect(fetchFn).toHaveBeenCalledOnce();
  });

  it("does not affect read verbs", async () => {
    const fetchFn = fetchOk({});
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient"],
      confirmWrites: true,
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    await server.dispatcher.handleRequest(
      req({ name: "fhir.read", arguments: { resourceType: "Patient", id: "abc" } }),
    );
    expect(fetchFn).toHaveBeenCalledOnce();
  });
});

describe("write gates compose", () => {
  it("dryRun + writeResourceTypes + confirmWrites all fire in order", async () => {
    const fetchFn = fetchOk({});
    const server = createServer({
      baseUrl: "https://example.test/baseR4",
      resourceTypes: ["Patient", "Observation"],
      writes: ["create"],
      writeResourceTypes: ["Patient"],
      dryRun: true,
      confirmWrites: true,
      audit: new MemoryAuditSink(),
      fetch: fetchFn,
    });

    // Wrong type — fails the allowlist before dryRun even kicks in.
    const wrongType = await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Observation", params: {}, confirm: true } }),
    );
    expect(JSON.parse((wrongType.result as { content: Array<{ text: string }> }).content[0]!.text).issue[0].code).toBe(
      "forbidden",
    );

    // Right type, missing confirm — fails the confirmation gate.
    const noConfirm = await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Patient", params: {} } }),
    );
    expect(JSON.parse((noConfirm.result as { content: Array<{ text: string }> }).content[0]!.text).issue[0].code).toBe(
      "required",
    );

    // Right type + confirmed — falls through to dryRun.
    const dry = await server.dispatcher.handleRequest(
      req({ name: "fhir.create", arguments: { resourceType: "Patient", params: {}, confirm: true } }),
    );
    expect(
      JSON.parse((dry.result as { content: Array<{ text: string }> }).content[0]!.text).issue[0].diagnostics,
    ).toContain("dry-run");
    expect(fetchFn).not.toHaveBeenCalled();
  });
});
