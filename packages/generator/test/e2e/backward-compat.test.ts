/**
 * Backward-compat golden diff test.
 *
 * The terminology engine added the `--expand-valuesets` flag (default off, so
 * existing users get the same output as before). This test locks that in by
 * generating the fixture bundle WITHOUT `--expand-valuesets` and comparing the
 * result byte-for-byte against a committed "legacy golden" bundle.
 *
 * If a regression is intentional, regenerate both bundles via:
 *
 *   node packages/generator/test/fixtures/.regen-goldens.mjs
 *
 * or ad-hoc for just this suite:
 *
 *   UPDATE_GOLDEN=1 pnpm vitest run packages/generator/test/e2e/backward-compat.test.ts
 */
import { cpSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../src/generator.js";

const FIXTURES_DIR = join(__dirname, "..", "fixtures", "terminology");
const LEGACY_GOLDEN_DIR = join(__dirname, "..", "fixtures", "generated-legacy-golden");

function walk(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

function relativeSet(root: string): Set<string> {
  return new Set(walk(root).map((f) => relative(root, f)));
}

describe("backward-compat (without --expand-valuesets)", () => {
  let outDir: string;

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "fhir-dsl-e2e-legacy-"));
    await generate({
      version: "r4",
      outDir,
      localSpecDir: FIXTURES_DIR,
      expandValueSets: false,
    });

    // Escape hatch: intentional regeneration of the golden bundle.
    if (process.env.UPDATE_GOLDEN === "1") {
      rmSync(LEGACY_GOLDEN_DIR, { recursive: true, force: true });
      cpSync(outDir, LEGACY_GOLDEN_DIR, { recursive: true });
    }
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it("produces the same set of files as the legacy golden bundle", () => {
    const generated = relativeSet(outDir);
    const golden = relativeSet(LEGACY_GOLDEN_DIR);
    expect([...generated].sort()).toEqual([...golden].sort());
  });

  it("does NOT emit a terminology/ directory when the flag is off", () => {
    const files = [...relativeSet(outDir)];
    expect(files.some((f) => f.includes("terminology/"))).toBe(false);
  });

  it("every file matches its golden counterpart byte-for-byte", () => {
    const generated = [...relativeSet(outDir)].sort();
    const mismatched: string[] = [];
    for (const rel of generated) {
      const actual = readFileSync(join(outDir, rel), "utf-8");
      const expected = readFileSync(join(LEGACY_GOLDEN_DIR, rel), "utf-8");
      if (actual !== expected) mismatched.push(rel);
    }
    expect(mismatched).toEqual([]);
  });

  it("Patient.gender stays as unparameterized FhirCode (legacy shape)", () => {
    const src = readFileSync(join(LEGACY_GOLDEN_DIR, "r4", "resources", "patient.ts"), "utf-8");
    // Required binding should NOT be narrowed when the flag is off — that's the
    // whole point of the flag gating terminology.
    expect(src).toMatch(/gender\?:\s*FhirCode(\s|;|,|\))/);
    expect(src).not.toContain("FhirCode<");
  });

  it("search-params.ts uses plain TokenParam without terminology imports", () => {
    const src = readFileSync(join(LEGACY_GOLDEN_DIR, "r4", "search-params.ts"), "utf-8");
    expect(src).toContain("TokenParam");
    expect(src).not.toContain("TokenParam<");
    expect(src).not.toContain('from "./terminology/');
  });
});
