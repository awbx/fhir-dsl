import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../src/generator.js";

const FIXTURES_DIR = join(__dirname, "..", "fixtures", "terminology");

describe("generate --mcp <out> scaffold", () => {
  let outDir: string;
  let mcpDir: string;

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "fhir-dsl-mcp-out-"));
    mcpDir = mkdtempSync(join(tmpdir(), "fhir-dsl-mcp-scaffold-"));
    await generate({
      version: "r4",
      outDir,
      localSpecDir: FIXTURES_DIR,
      mcpOutDir: mcpDir,
    });
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
    if (mcpDir) rmSync(mcpDir, { recursive: true, force: true });
  });

  it("emits mcp.config.json, server.ts, and README.md", () => {
    expect(existsSync(join(mcpDir, "mcp.config.json"))).toBe(true);
    expect(existsSync(join(mcpDir, "server.ts"))).toBe(true);
    expect(existsSync(join(mcpDir, "README.md"))).toBe(true);
  });

  it("seeds mcp.config.json with the generated resourceTypes and safe defaults", () => {
    const cfg = JSON.parse(readFileSync(join(mcpDir, "mcp.config.json"), "utf-8"));
    expect(cfg.version).toBe("r4");
    expect(Array.isArray(cfg.resourceTypes)).toBe(true);
    expect(cfg.resourceTypes.length).toBeGreaterThan(0);
    expect(cfg.resourceTypes).toEqual([...cfg.resourceTypes].sort());
    expect(cfg.writes).toEqual([]);
    expect(cfg.confirmWrites).toBe(true);
    expect(cfg.dryRun).toBe(false);
    expect(cfg.defaultSearchCount).toBe(20);
    expect(cfg.maxResponseBytes).toBe(65536);
  });

  it("writes a server.ts shim that calls @fhir-dsl/mcp's createServer", () => {
    const src = readFileSync(join(mcpDir, "server.ts"), "utf-8");
    expect(src).toContain('import { createServer, JsonLogAuditSink, stdioTransport } from "@fhir-dsl/mcp"');
    expect(src).toContain("process.env.FHIR_BASE_URL");
    expect(src).toContain("mcp.config.json");
    expect(src).toContain("await server.listen(stdioTransport())");
  });

  it("README references the FHIR_BASE_URL env var", () => {
    const readme = readFileSync(join(mcpDir, "README.md"), "utf-8");
    expect(readme).toContain("FHIR_BASE_URL");
    expect(readme).toContain("fhir-gen generate --mcp");
  });
});
