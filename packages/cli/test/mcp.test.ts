import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// We import lazily so we can stub `@fhir-dsl/mcp` first — the command
// otherwise tries to spin up a stdio server and never returns.

vi.mock("@fhir-dsl/mcp", () => {
  const listen = vi.fn(async () => {});
  const createServer = vi.fn((config: unknown) => ({
    config,
    dispatcher: {},
    listen,
  }));
  const stdioTransport = vi.fn(() => ({ start: async () => {} }));
  class JsonLogAuditSink {}
  return { createServer, stdioTransport, JsonLogAuditSink, __listen: listen };
});

describe("fhir-gen mcp", () => {
  let dir: string;
  let cwdBefore: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "fhir-mcp-cli-"));
    cwdBefore = process.cwd();
    process.chdir(dir);
  });

  afterEach(() => {
    process.chdir(cwdBefore);
    rmSync(dir, { recursive: true, force: true });
    vi.resetAllMocks();
  });

  it("uses the explicit --resources list when provided", async () => {
    const mcp = await import("@fhir-dsl/mcp");
    const { mcpCommand } = await import("../src/commands/mcp.js");
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await mcpCommand.parseAsync([
      "node",
      "fhir-gen",
      "https://example.test/baseR4",
      "--resources",
      "Patient,Observation",
    ]);

    const cfg = (mcp.createServer as unknown as { mock: { calls: Array<[unknown]> } }).mock.calls[0]?.[0] as {
      baseUrl: string;
      resourceTypes: string[];
    };
    expect(cfg.baseUrl).toBe("https://example.test/baseR4");
    expect(cfg.resourceTypes).toEqual(["Patient", "Observation"]);

    errSpy.mockRestore();
  });

  it("falls back to fhir-dsl.config.json when --resources is omitted", async () => {
    writeFileSync(join(dir, "fhir-dsl.config.json"), JSON.stringify({ resourceTypes: ["Encounter"] }), "utf-8");
    const mcp = await import("@fhir-dsl/mcp");
    const { mcpCommand } = await import("../src/commands/mcp.js");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await mcpCommand.parseAsync(["node", "fhir-gen", "https://example.test/baseR4"]);
    const cfg = (mcp.createServer as unknown as { mock: { calls: Array<[unknown]> } }).mock.calls[0]?.[0] as {
      resourceTypes: string[];
    };
    expect(cfg.resourceTypes).toEqual(["Encounter"]);
  });

  it("threads safety + token-economy flags into createServer", async () => {
    const mcp = await import("@fhir-dsl/mcp");
    const { mcpCommand } = await import("../src/commands/mcp.js");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await mcpCommand.parseAsync([
      "node",
      "fhir-gen",
      "https://example.test/baseR4",
      "--resources",
      "Patient",
      "--writes",
      "create,update",
      "--write-resource-types",
      "Patient",
      "--dry-run",
      "--confirm-writes",
      "--default-count",
      "10",
      "--max-bytes",
      "2048",
      "--default-summary",
      "text",
    ]);
    const cfg = (mcp.createServer as unknown as { mock: { calls: Array<[unknown]> } }).mock.calls[0]?.[0] as Record<
      string,
      unknown
    >;

    expect(cfg.writes).toEqual(["create", "update"]);
    expect(cfg.writeResourceTypes).toEqual(["Patient"]);
    expect(cfg.dryRun).toBe(true);
    expect(cfg.confirmWrites).toBe(true);
    expect(cfg.defaultSearchCount).toBe(10);
    expect(cfg.maxResponseBytes).toBe(2048);
    expect(cfg.defaultReadSummary).toBe("text");
  });

  it("rejects unknown write verbs", async () => {
    const { mcpCommand } = await import("../src/commands/mcp.js");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    await expect(
      mcpCommand.parseAsync([
        "node",
        "fhir-gen",
        "https://example.test/baseR4",
        "--resources",
        "Patient",
        "--writes",
        "create,nonsense",
      ]),
    ).rejects.toThrow("exit");
    expect(err.mock.calls.some((c) => String(c[0]).includes("nonsense"))).toBe(true);

    err.mockRestore();
    exit.mockRestore();
  });

  it("reads bearer tokens from --auth-bearer-env", async () => {
    process.env.TEST_FHIR_TOKEN = "tok-abc";
    const mcp = await import("@fhir-dsl/mcp");
    const { mcpCommand } = await import("../src/commands/mcp.js");
    vi.spyOn(console, "error").mockImplementation(() => {});

    await mcpCommand.parseAsync([
      "node",
      "fhir-gen",
      "https://example.test/baseR4",
      "--resources",
      "Patient",
      "--auth-bearer-env",
      "TEST_FHIR_TOKEN",
    ]);

    const cfg = (mcp.createServer as unknown as { mock: { calls: Array<[unknown]> } }).mock.calls[0]?.[0] as {
      auth: { kind: string; token: string };
    };
    expect(cfg.auth).toEqual({ kind: "bearer", token: "tok-abc" });

    delete process.env.TEST_FHIR_TOKEN;
  });

  it("fails when --auth-bearer-env points at an unset variable", async () => {
    delete process.env.TEST_FHIR_TOKEN;
    const { mcpCommand } = await import("../src/commands/mcp.js");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    await expect(
      mcpCommand.parseAsync([
        "node",
        "fhir-gen",
        "https://example.test/baseR4",
        "--resources",
        "Patient",
        "--auth-bearer-env",
        "TEST_FHIR_TOKEN",
      ]),
    ).rejects.toThrow("exit");
    expect(err.mock.calls.some((c) => String(c[0]).includes("TEST_FHIR_TOKEN"))).toBe(true);

    err.mockRestore();
    exit.mockRestore();
  });
});
