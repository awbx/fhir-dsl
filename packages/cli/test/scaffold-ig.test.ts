import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scaffoldFiles, scaffoldIgCommand, writeScaffold } from "../src/commands/scaffold-ig.js";

describe("scaffoldFiles", () => {
  it("writes a starter project rooted at the requested IG and version", () => {
    const files = scaffoldFiles({
      pkg: "hl7.fhir.us.core@6.1.0",
      outDir: "/tmp/my-app",
      version: "r4",
    });
    const byPath = new Map(files.map((f) => [f.path, f.contents]));

    const pkg = JSON.parse(byPath.get("package.json") ?? "{}");
    expect(pkg.name).toBe("my-app");
    expect(pkg.scripts.generate).toContain("--ig hl7.fhir.us.core@6.1.0");
    expect(pkg.scripts.generate).toContain("--version r4");
    expect(pkg.scripts.generate).toContain("--out src/generated");
    expect(pkg.dependencies["@fhir-dsl/core"]).toBeDefined();
    expect(pkg.devDependencies["@fhir-dsl/cli"]).toBeDefined();

    const tsconfig = JSON.parse(byPath.get("tsconfig.json") ?? "{}");
    expect(tsconfig.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    expect(tsconfig.compilerOptions.strict).toBe(true);

    const cfg = JSON.parse(byPath.get("fhir-dsl.config.json") ?? "{}");
    expect(cfg).toMatchObject({ version: "r4", ig: ["hl7.fhir.us.core@6.1.0"], out: "src/generated" });

    const client = byPath.get("src/client.ts") ?? "";
    expect(client).toContain('import { createClient } from "./generated/index.js";');
    expect(client).toContain("https://hapi.fhir.org/baseR4");

    expect(byPath.get(".gitignore")).toContain("src/generated");
    expect(byPath.get("README.md")).toContain("hl7.fhir.us.core@6.1.0");
  });

  it("derives a sensible package name from a messy outDir", () => {
    const files = scaffoldFiles({ pkg: "hl7.fhir.us.core@6.1.0", outDir: "/Users/me/My App!", version: "r5" });
    const pkg = JSON.parse(files.find((f) => f.path === "package.json")?.contents ?? "{}");
    expect(pkg.name).toBe("my-app");
  });

  it("falls back to fhir-app when the outDir is empty after sanitising", () => {
    const files = scaffoldFiles({ pkg: "hl7.fhir.us.core@6.1.0", outDir: "/", version: "r4" });
    const pkg = JSON.parse(files.find((f) => f.path === "package.json")?.contents ?? "{}");
    expect(pkg.name).toBe("fhir-app");
  });

  it("uses the version-appropriate HAPI base URL", () => {
    const r5 = scaffoldFiles({ pkg: "hl7.fhir.r5.core@5.0.0", outDir: "/tmp/x", version: "r5" });
    const client = r5.find((f) => f.path === "src/client.ts")?.contents ?? "";
    expect(client).toContain("https://hapi.fhir.org/baseR5");
  });

  it("respects an explicit --name override", () => {
    const files = scaffoldFiles({
      pkg: "hl7.fhir.us.core@6.1.0",
      outDir: "/tmp/whatever",
      version: "r4",
      projectName: "my-explicit-name",
    });
    const pkg = JSON.parse(files.find((f) => f.path === "package.json")?.contents ?? "{}");
    expect(pkg.name).toBe("my-explicit-name");
  });
});

describe("writeScaffold", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "fhir-scaffold-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("writes every file, creating nested directories as needed", () => {
    const files = scaffoldFiles({ pkg: "hl7.fhir.us.core@6.1.0", outDir: dir, version: "r4" });
    const result = writeScaffold(files, dir, false);
    expect(result.written).toEqual(files.map((f) => f.path));
    expect(existsSync(join(dir, "src/client.ts"))).toBe(true);
    expect(existsSync(join(dir, "package.json"))).toBe(true);
  });

  it("skips existing files unless force is true", () => {
    writeFileSync(join(dir, "package.json"), '{"name":"existing"}', "utf-8");
    const files = scaffoldFiles({ pkg: "hl7.fhir.us.core@6.1.0", outDir: dir, version: "r4" });

    const skipped = writeScaffold(files, dir, false);
    expect(skipped.skipped).toContain("package.json");
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")).name).toBe("existing");

    const overwritten = writeScaffold(files, dir, true);
    expect(overwritten.written).toContain("package.json");
    expect(JSON.parse(readFileSync(join(dir, "package.json"), "utf-8")).name).not.toBe("existing");
  });
});

describe("fhir-gen scaffold-ig (CLI)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "fhir-scaffold-cli-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("scaffolds into an empty directory and prints next steps", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});

    await scaffoldIgCommand.parseAsync(["node", "fhir-gen", "hl7.fhir.us.core@6.1.0", "--out", dir]);

    expect(existsSync(join(dir, "package.json"))).toBe(true);
    expect(existsSync(join(dir, "src/client.ts"))).toBe(true);
    const out = log.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(out).toContain("Scaffolded");
    expect(out).toContain("Next steps");

    log.mockRestore();
  });

  it("rejects an unknown --version", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    await expect(
      scaffoldIgCommand.parseAsync(["node", "fhir-gen", "hl7.fhir.us.core@6.1.0", "--out", dir, "--version", "r99"]),
    ).rejects.toThrow("exit");
    expect(err).toHaveBeenCalled();

    err.mockRestore();
    exit.mockRestore();
  });

  it("refuses to clobber files in a non-empty directory without --force", async () => {
    writeFileSync(join(dir, "package.json"), '{"name":"existing"}', "utf-8");

    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("exit");
    }) as never);

    await expect(
      scaffoldIgCommand.parseAsync(["node", "fhir-gen", "hl7.fhir.us.core@6.1.0", "--out", dir]),
    ).rejects.toThrow("exit");
    expect(err.mock.calls.some((c) => String(c[0]).includes("Refusing to overwrite"))).toBe(true);

    err.mockRestore();
    exit.mockRestore();
  });
});
