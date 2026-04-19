import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../src/generator.js";

const FIXTURES_DIR_R5 = join(__dirname, "..", "fixtures", "terminology-r5");

const INREPO_TMP_ROOT = join(__dirname, "..", ".tmp-output-r5");

/**
 * R5 pipeline end-to-end test. Exercises the v0.19 spec-driven catalog against
 * an R5-flavored fixture — proves that `--version r5` actually changes what the
 * generator emits instead of silently falling back to R4 defaults.
 *
 * The fixture under test/fixtures/terminology-r5/ deliberately includes things
 * R4 doesn't: `integer64` as a primitive-type SD, `MoneyQuantity` as a
 * complex-type SD, a DomainResource-scoped `_text` search param, and abstract
 * Resource/DomainResource SDs so base-property derivation runs against real
 * spec data rather than the FALLBACK_* tables in build-catalog.ts.
 */
describe("r5 pipeline e2e", () => {
  let outDir: string;

  function read(relPath: string): string {
    return readFileSync(join(outDir, "r5", relPath), "utf-8");
  }

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "fhir-dsl-e2e-r5-"));
    await generate({
      version: "r5",
      outDir,
      localSpecDir: FIXTURES_DIR_R5,
      expandValueSets: false,
    });
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  describe("primitives.ts — derived from catalog, not fallback", () => {
    it("emits the R5-only integer64 primitive alias", () => {
      const src = read("primitives.ts");
      expect(src).toContain("export type integer64 = number;");
    });

    it("emits FhirString with the correct underlying type", () => {
      const src = read("primitives.ts");
      expect(src).toContain("export type FhirString = string;");
    });

    it("emits FhirBoolean with the correct underlying type", () => {
      const src = read("primitives.ts");
      expect(src).toContain("export type FhirBoolean = boolean;");
    });

    it("emits FhirPositiveInt as a number alias", () => {
      const src = read("primitives.ts");
      expect(src).toContain("export type FhirPositiveInt = number;");
    });

    it("parameterizes FhirCode<T> for narrowed bindings", () => {
      const src = read("primitives.ts");
      expect(src).toContain("export type FhirCode<T extends string = string> = T;");
    });
  });

  describe("datatypes.ts — MoneyQuantity (R5 complex-type) makes it through", () => {
    it("re-exports MoneyQuantity from @fhir-dsl/types", () => {
      const src = read("datatypes.ts");
      expect(src).toContain("MoneyQuantity");
      expect(src).toContain('from "@fhir-dsl/types"');
    });

    it("re-exports the base abstract types the resources extend", () => {
      const src = read("datatypes.ts");
      expect(src).toContain("Resource");
      expect(src).toContain("DomainResource");
    });
  });

  describe("search-params.ts — scope-split interfaces", () => {
    it("emits CommonSearchParams for Resource-scoped params", () => {
      const src = read("search-params.ts");
      expect(src).toContain("export interface CommonSearchParams {");
      expect(src).toMatch(/CommonSearchParams\s*\{[^}]*"_id":\s*TokenParam/);
      expect(src).toMatch(/CommonSearchParams\s*\{[^}]*"_lastUpdated":\s*DateParam/);
    });

    it("emits DomainResourceSearchParams extending CommonSearchParams for DomainResource-scoped params", () => {
      const src = read("search-params.ts");
      expect(src).toContain("export interface DomainResourceSearchParams extends CommonSearchParams {");
      expect(src).toMatch(/DomainResourceSearchParams[^{]*\{[^}]*"_text":\s*StringParam/);
    });

    it("keeps _text OUT of CommonSearchParams (scope discipline)", () => {
      const src = read("search-params.ts");
      const commonBlock = src.match(/export interface CommonSearchParams\s*\{([^}]*)\}/)?.[1] ?? "";
      expect(commonBlock).not.toContain("_text");
    });

    it("per-resource search params extend DomainResourceSearchParams for DomainResources", () => {
      const src = read("search-params.ts");
      expect(src).toContain("PatientSearchParams extends DomainResourceSearchParams");
    });
  });

  describe("resource interfaces — derived base-props drive the extends chain", () => {
    it("Patient extends DomainResource (from catalog.baseProperties, not fallback)", () => {
      const src = read("resources/patient.ts");
      expect(src).toContain("export interface Patient extends DomainResource");
    });

    it("Observation extends DomainResource", () => {
      const src = read("resources/observation.ts");
      expect(src).toContain("export interface Observation extends DomainResource");
    });

    it("does NOT redeclare inherited DomainResource fields on the resource itself", () => {
      const src = read("resources/patient.ts");
      // These come from DomainResource via the `extends` chain — the resource
      // emitter must skip them when walking Patient.snapshot.
      expect(src).not.toMatch(/^\s*meta[?:]/m);
      expect(src).not.toMatch(/^\s*implicitRules[?:]/m);
      expect(src).not.toMatch(/^\s*modifierExtension[?:]/m);
    });
  });

  describe("file structure", () => {
    it("writes output under the r5/ subdirectory", () => {
      expect(() => read("primitives.ts")).not.toThrow();
      expect(() => read("datatypes.ts")).not.toThrow();
      expect(() => read("search-params.ts")).not.toThrow();
      expect(() => read("resources/patient.ts")).not.toThrow();
      expect(() => read("resources/observation.ts")).not.toThrow();
    });
  });
});

/**
 * Capstone: the real compiler validates the R5-generated output. Must live in
 * INREPO_TMP_ROOT so `@fhir-dsl/types` resolves via the workspace link.
 */
describe("r5 pipeline — tsc --noEmit capstone", () => {
  let outDir: string;

  beforeAll(async () => {
    mkdirSync(INREPO_TMP_ROOT, { recursive: true });
    outDir = mkdtempSync(join(INREPO_TMP_ROOT, "tsc-"));
    await generate({
      version: "r5",
      outDir,
      localSpecDir: FIXTURES_DIR_R5,
      expandValueSets: false,
    });
  }, 30_000);

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it("R5 generated output type-checks clean with a valid consumer", () => {
    const consumer = `
      import type { Patient } from "${outDir}/r5/resources/patient.js";
      import type { Observation } from "${outDir}/r5/resources/observation.js";
      import type { integer64 } from "${outDir}/r5/primitives.js";

      const validPatient: Patient = {
        resourceType: "Patient",
        gender: "male",
      };

      const validObs: Observation = {
        resourceType: "Observation",
        status: "final",
        code: { coding: [{ code: "test" }] },
      };

      // Proves the R5-only primitive alias is usable from the generated output.
      const big: integer64 = 9_000_000_000;

      export { validPatient, validObs, big };
    `;
    writeFileSync(join(outDir, "r5-consumer.ts"), consumer, "utf-8");
    const result = runTsc(outDir, "r5-consumer.ts");
    expect(result.status, result.output).toBe(0);
  }, 30_000);
});

function runTsc(outDir: string, fileName: string): { status: number | null; output: string } {
  const repoRoot = join(__dirname, "..", "..", "..", "..");
  const tscBin = join(repoRoot, "node_modules", ".bin", "tsc");

  const result = spawnSync(
    tscBin,
    [
      "--noEmit",
      "--strict",
      "--target",
      "ES2022",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--esModuleInterop",
      "--skipLibCheck",
      join(outDir, fileName),
    ],
    { cwd: repoRoot, encoding: "utf-8" },
  );

  return {
    status: result.status,
    output: `${result.stdout}\n${result.stderr}`,
  };
}
