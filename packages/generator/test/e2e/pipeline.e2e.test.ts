import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../src/generator.js";

const FIXTURES_DIR = join(__dirname, "..", "fixtures", "terminology");

/**
 * For the tsc capstone test we need the generated output to be able to resolve
 * `@fhir-dsl/types` via pnpm workspace links. That only works when the output
 * lives inside the monorepo — os.tmpdir() is a different filesystem tree.
 */
const INREPO_TMP_ROOT = join(__dirname, "..", ".tmp-output");

/**
 * End-to-end pipeline test: runs the real generator against local fixtures,
 * then asserts that every binding strength produces the correct TypeScript output.
 *
 * Consumed by pipeline-tsc.e2e.test.ts (not here) for the `tsc --noEmit` capstone.
 */
describe("pipeline e2e (with --expand-valuesets)", () => {
  let outDir: string;

  function read(relPath: string): string {
    return readFileSync(join(outDir, "r4", relPath), "utf-8");
  }

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "fhir-dsl-e2e-pipeline-"));
    await generate({
      version: "r4",
      outDir,
      localSpecDir: FIXTURES_DIR,
      expandValueSets: true,
      resolveCodeSystems: true,
    });
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  describe("terminology output", () => {
    it("generates valuesets.ts with resolved literal unions", () => {
      const src = read("terminology/valuesets.ts");
      expect(src).toContain('export type AdministrativeGender = "male" | "female" | "other" | "unknown";');
      expect(src).toContain("export type ObservationStatus =");
      expect(src).toContain('"registered"');
      expect(src).toContain('"final"');
    });

    it("generates codesystems.ts with const namespace objects", () => {
      const src = read("terminology/codesystems.ts");
      expect(src).toContain("export const AdministrativeGender = {");
      expect(src).toContain('"male" as const');
      expect(src).toContain("} as const;");
    });

    it("resolves ValueSet via compose.include.concept (explicit list)", () => {
      const src = read("terminology/valuesets.ts");
      // ConditionClinicalStatusCodes came from explicit concept list
      expect(src).toContain("export type ConditionClinicalStatusCodes =");
      expect(src).toContain('"active"');
      expect(src).toContain('"resolved"');
    });

    it("resolves ValueSet via system-only include + complete CodeSystem", () => {
      const src = read("terminology/valuesets.ts");
      // ObservationStatus came from include.system only; resolved via local CodeSystem
      expect(src).toContain('"amended"');
      expect(src).toContain('"entered-in-error"');
    });

    it("does NOT emit a type for unresolvable ValueSets (SNOMED filter)", () => {
      const src = read("terminology/valuesets.ts");
      // MedicationCodesSnomed has a filter on an external system → not resolvable
      expect(src).not.toContain("MedicationCodesSnomed");
    });
  });

  describe("resource interfaces — required bindings", () => {
    it("parameterizes FhirCode<AdministrativeGender> on Patient.gender", () => {
      const src = read("resources/patient.ts");
      expect(src).toContain("gender?: FhirCode<AdministrativeGender>;");
    });

    it("parameterizes FhirCode<ObservationStatus> on Observation.status", () => {
      const src = read("resources/observation.ts");
      expect(src).toContain("status: FhirCode<ObservationStatus>;");
    });

    it("parameterizes CodeableConcept<ObservationCategoryCodes> on Observation.category", () => {
      const src = read("resources/observation.ts");
      expect(src).toContain("category?: CodeableConcept<ObservationCategoryCodes>[];");
    });
  });

  describe("resource interfaces — extensible bindings", () => {
    it("emits CodeableConcept<T | (string & {})> on Condition.clinicalStatus", () => {
      const src = read("resources/condition.ts");
      expect(src).toContain("clinicalStatus?: CodeableConcept<ConditionClinicalStatusCodes | (string & {})>;");
    });
  });

  describe("resource interfaces — preferred/example bindings", () => {
    it("leaves Encounter.priority as plain CodeableConcept (preferred)", () => {
      const src = read("resources/encounter.ts");
      expect(src).toContain("priority?: CodeableConcept;");
      expect(src).not.toContain("priority?: CodeableConcept<");
    });

    it("leaves Specimen.type as plain CodeableConcept (example)", () => {
      const src = read("resources/specimen.ts");
      expect(src).toContain("type?: CodeableConcept;");
      expect(src).not.toContain("type?: CodeableConcept<");
    });
  });

  describe("resource interfaces — unresolvable binding fallback", () => {
    it("falls back to plain CodeableConcept when ValueSet cannot be resolved", () => {
      const src = read("resources/medication-request.ts");
      expect(src).toContain("medicationCodeableConcept?: CodeableConcept;");
      expect(src).not.toContain("medicationCodeableConcept?: CodeableConcept<");
    });
  });

  describe("terminology imports", () => {
    it("imports terminology types in resource files that use them", () => {
      expect(read("resources/patient.ts")).toContain(
        'import type { AdministrativeGender } from "../terminology/valuesets.js";',
      );
      expect(read("resources/condition.ts")).toContain(
        'import type { ConditionClinicalStatusCodes } from "../terminology/valuesets.js";',
      );
    });

    it("does NOT import terminology types in resources without bindings", () => {
      const encounter = read("resources/encounter.ts");
      expect(encounter).not.toContain("terminology/valuesets");

      const specimen = read("resources/specimen.ts");
      expect(specimen).not.toContain("terminology/valuesets");
    });
  });

  describe("search params — terminology flow", () => {
    it("emits TokenParam<AdministrativeGender> for Patient.gender search param", () => {
      const src = read("search-params.ts");
      expect(src).toContain('"gender": TokenParam<AdministrativeGender>;');
    });

    it("emits TokenParam<ObservationStatus> for Observation.status search param", () => {
      const src = read("search-params.ts");
      expect(src).toContain('"status": TokenParam<ObservationStatus>;');
    });

    it("imports terminology types in search-params.ts", () => {
      const src = read("search-params.ts");
      expect(src).toContain('from "./terminology/valuesets.js"');
      expect(src).toMatch(/import type \{[^}]*AdministrativeGender[^}]*\}/);
      expect(src).toMatch(/import type \{[^}]*ObservationStatus[^}]*\}/);
    });

    it("leaves non-token search params unparameterized", () => {
      const src = read("search-params.ts");
      expect(src).toContain('"name": StringParam;');
      expect(src).toContain('"subject": ReferenceParam;');
    });
  });

  describe("file structure", () => {
    it("creates terminology/ directory with valuesets.ts and codesystems.ts", () => {
      expect(() => read("terminology/valuesets.ts")).not.toThrow();
      expect(() => read("terminology/codesystems.ts")).not.toThrow();
    });

    it("creates one resource file per StructureDefinition", () => {
      expect(() => read("resources/patient.ts")).not.toThrow();
      expect(() => read("resources/observation.ts")).not.toThrow();
      expect(() => read("resources/condition.ts")).not.toThrow();
      expect(() => read("resources/encounter.ts")).not.toThrow();
      expect(() => read("resources/specimen.ts")).not.toThrow();
      expect(() => read("resources/medication-request.ts")).not.toThrow();
    });

    it("creates registry.ts and client.ts", () => {
      expect(() => read("registry.ts")).not.toThrow();
      expect(() => read("client.ts")).not.toThrow();
    });
  });
});

/**
 * Pipeline with --expand-valuesets disabled — everything must be unparameterized.
 * This is the contract that keeps old generated code working without opt-in.
 */
describe("pipeline e2e (without --expand-valuesets)", () => {
  let outDir: string;

  function read(relPath: string): string {
    return readFileSync(join(outDir, "r4", relPath), "utf-8");
  }

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "fhir-dsl-e2e-legacy-"));
    await generate({
      version: "r4",
      outDir,
      localSpecDir: FIXTURES_DIR,
      expandValueSets: false,
    });
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it("does NOT create a terminology/ directory", () => {
    expect(() => read("terminology/valuesets.ts")).toThrow();
  });

  it("emits plain FhirCode on Patient.gender", () => {
    const src = read("resources/patient.ts");
    expect(src).toContain("gender?: FhirCode;");
    expect(src).not.toContain("FhirCode<");
  });

  it("emits plain CodeableConcept on Observation.category", () => {
    const src = read("resources/observation.ts");
    expect(src).toContain("category?: CodeableConcept[];");
    expect(src).not.toContain("CodeableConcept<");
  });

  it("emits plain CodeableConcept on Condition.clinicalStatus (no extensible generics)", () => {
    const src = read("resources/condition.ts");
    expect(src).toContain("clinicalStatus?: CodeableConcept;");
  });

  it("emits plain TokenParam in search-params.ts", () => {
    const src = read("search-params.ts");
    expect(src).toContain('"gender": TokenParam;');
    expect(src).toContain('"status": TokenParam;');
    expect(src).not.toContain("TokenParam<");
  });

  it("does NOT import from terminology/ anywhere", () => {
    const files = ["resources/patient.ts", "resources/observation.ts", "resources/condition.ts", "search-params.ts"];
    for (const file of files) {
      expect(read(file)).not.toContain("terminology/valuesets");
    }
  });
});

/**
 * Capstone test: the real compiler validates the generated output.
 *
 * Spawns `tsc --noEmit` on a consumer file that uses all the generated types.
 * Failure here means the generator produced code that doesn't compile — far
 * worse than any string-matching assertion above missing.
 */
describe("pipeline e2e — tsc --noEmit capstone", () => {
  let outDir: string;

  beforeAll(async () => {
    // Must be inside the repo so the generated datatypes.ts can resolve `@fhir-dsl/types`.
    mkdirSync(INREPO_TMP_ROOT, { recursive: true });
    outDir = mkdtempSync(join(INREPO_TMP_ROOT, "tsc-"));
    await generate({
      version: "r4",
      outDir,
      localSpecDir: FIXTURES_DIR,
      expandValueSets: true,
      resolveCodeSystems: true,
    });
  }, 30_000);

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it("generated output type-checks clean with a valid consumer", () => {
    const consumer = `
      import type { Patient } from "${outDir}/r4/resources/patient.js";
      import type { Observation } from "${outDir}/r4/resources/observation.js";
      import type { Condition } from "${outDir}/r4/resources/condition.js";

      const validPatient: Patient = {
        resourceType: "Patient",
        gender: "male",
      };

      const validObs: Observation = {
        resourceType: "Observation",
        status: "final",
        code: { coding: [{ code: "test" }] },
        category: [{ coding: [{ code: "vital-signs" }] }],
      };

      const validCond: Condition = {
        resourceType: "Condition",
        clinicalStatus: { coding: [{ code: "active" }] },
        subject: { reference: "Patient/123" },
      };

      // Extensible binding accepts arbitrary strings too
      const extensibleCond: Condition = {
        resourceType: "Condition",
        clinicalStatus: { coding: [{ code: "some-custom-code" }] },
        subject: { reference: "Patient/456" },
      };

      export { validPatient, validObs, validCond, extensibleCond };
    `;
    writeTempConsumer(outDir, "valid-consumer.ts", consumer);
    const result = runTsc(outDir);
    expect(result.status, result.output).toBe(0);
  }, 30_000);

  it("rejects invalid code assignments with compiler error", () => {
    const consumer = `
      import type { Patient } from "${outDir}/r4/resources/patient.js";
      const bad: Patient = {
        resourceType: "Patient",
        gender: "banana", // should error: not a valid AdministrativeGender
      };
      export { bad };
    `;
    writeTempConsumer(outDir, "invalid-consumer.ts", consumer);
    const result = runTsc(outDir, "invalid-consumer.ts");
    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(/banana/);
  }, 30_000);
});

// --- helpers ---

function writeTempConsumer(outDir: string, fileName: string, source: string): string {
  const path = join(outDir, fileName);
  writeFileSync(path, source, "utf-8");
  return path;
}

function runTsc(outDir: string, onlyFile?: string): { status: number | null; output: string } {
  // Use the workspace's typescript since tsc needs node_modules resolution for @fhir-dsl/types
  const repoRoot = join(__dirname, "..", "..", "..", "..");
  const tscBin = join(repoRoot, "node_modules", ".bin", "tsc");

  const target = onlyFile ? [join(outDir, onlyFile)] : [join(outDir, "valid-consumer.ts")];

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
      ...target,
    ],
    { cwd: repoRoot, encoding: "utf-8" },
  );

  return {
    status: result.status,
    output: `${result.stdout}\n${result.stderr}`,
  };
}
