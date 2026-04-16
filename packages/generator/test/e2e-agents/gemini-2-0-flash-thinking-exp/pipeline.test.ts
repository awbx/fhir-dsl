import { spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const tmpOutputDir = join(__dirname, ".tmp-output");

describe("gemini-2-0-flash-thinking-exp Pipeline E2E", () => {
  beforeAll(async () => {
    await rm(tmpOutputDir, { recursive: true, force: true });
    await mkdir(tmpOutputDir, { recursive: true });

    await generate({
      version: "r4",
      outDir: tmpOutputDir,
      localSpecDir: fixturesDir,
      expandValueSets: true,
      resolveCodeSystems: true,
    });
  });

  it("should generate terminology directory with expected types", async () => {
    const vsFile = join(tmpOutputDir, "r4", "terminology", "valuesets.ts");
    const content = await readFile(vsFile, "utf-8");

    // Required - AdministrativeGender
    expect(content).toContain('export type AdministrativeGender = "male" | "female" | "other" | "unknown";');

    // Required on Observation status
    expect(content).toContain('export type ObservationStatus = "registered" | "preliminary" | "final" | "amended";');

    // Required on Observation category
    expect(content).toContain('export type ObservationCategoryCodes = "vital-signs" | "imaging" | "laboratory";');

    // Extensible - ClinicalCodes
    expect(content).toContain(
      'export type ClinicalCodes = "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved";',
    );

    // Preferred - EncounterPriority (should be generated but maybe not used)
    expect(content).toContain('export type EncounterPriority = "stat" | "emergency" | "urgent" | "routine";');
  });

  it("should parameterize resource fields correctly based on binding strength", async () => {
    // Required (FhirCode)
    const patientFile = join(tmpOutputDir, "r4", "resources", "patient.ts");
    const patientContent = await readFile(patientFile, "utf-8");
    expect(patientContent).toContain("gender?: FhirCode<AdministrativeGender>;");

    // Required (CodeableConcept)
    const observationFile = join(tmpOutputDir, "r4", "resources", "observation.ts");
    const observationContent = await readFile(observationFile, "utf-8");
    expect(observationContent).toContain("status: FhirCode<ObservationStatus>;");
    expect(observationContent).toContain("category?: CodeableConcept<ObservationCategoryCodes>[];");

    // Extensible
    const conditionFile = join(tmpOutputDir, "r4", "resources", "condition.ts");
    const conditionContent = await readFile(conditionFile, "utf-8");
    expect(conditionContent).toContain("clinicalStatus?: CodeableConcept<ClinicalCodes | (string & {})>;");

    // Preferred (unconstrained)
    const encounterFile = join(tmpOutputDir, "r4", "resources", "encounter.ts");
    const encounterContent = await readFile(encounterFile, "utf-8");
    expect(encounterContent).toContain("priority?: CodeableConcept;");

    // Example (unconstrained)
    const specimenFile = join(tmpOutputDir, "r4", "resources", "specimen.ts");
    const specimenContent = await readFile(specimenFile, "utf-8");
    expect(specimenContent).toContain("type?: CodeableConcept;");

    // Unresolvable (unconstrained)
    const medicationFile = join(tmpOutputDir, "r4", "resources", "medication-request.ts");
    const medicationContent = await readFile(medicationFile, "utf-8");
    expect(medicationContent).toContain("medicationCodeableConcept?: CodeableConcept;");
  });

  it("should parameterize search parameters correctly", async () => {
    const spFile = join(tmpOutputDir, "r4", "search-params.ts");
    const spContent = await readFile(spFile, "utf-8");
    expect(spContent).toContain('"gender": TokenParam<AdministrativeGender>;');
    expect(spContent).toContain('"status": TokenParam<ObservationStatus>;');
  });

  it("should compile a consumer file successfully", async () => {
    const consumerFile = join(tmpOutputDir, "r4", "consumer.ts");
    const consumerContent = `
import { createFhirClient } from "@fhir-dsl/core";
import { GeneratedSchema } from "./client.js";
import { Patient } from "./resources/patient.js";
import { Observation } from "./resources/observation.js";
import { Condition } from "./resources/condition.js";
import { Encounter } from "./resources/encounter.js";

const client = createFhirClient<GeneratedSchema>({ baseUrl: "http://localhost" });

// Valid codes
const patient: Patient = {
  resourceType: "Patient",
  gender: "male"
};

const obs: Observation = {
  resourceType: "Observation",
  status: "final",
  category: [{
    coding: [{ system: "http://hl7.org/fhir/observation-category", code: "vital-signs" }]
  }]
};

// Extensible - valid code
const cond: Condition = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{ code: "active" }]
  }
};

// Extensible - arbitrary code
const cond2: Condition = {
  resourceType: "Condition",
  clinicalStatus: {
    coding: [{ code: "something-else" }]
  }
};

// Preferred - arbitrary code
const enc: Encounter = {
  resourceType: "Encounter",
  priority: {
    coding: [{ code: "custom-priority" }]
  }
};

// Search with valid codes
client.search("Patient").where("gender", "eq", "male");
client.search("Observation").where("status", "eq", "preliminary");

console.log("Consumer compiled!");
`;
    await writeFile(consumerFile, consumerContent, "utf-8");

    // We need to run tsc. We'll use the one from node_modules.
    // Fixed path to tsc based on project root
    const tscPath = join(__dirname, "../../../../../node_modules/.bin/tsc");
    const result = spawnSync(
      tscPath,
      [
        "--noEmit",
        "--strict",
        consumerFile,
        "--module",
        "NodeNext",
        "--moduleResolution",
        "NodeNext",
        "--target",
        "ES2022",
        "--esModuleInterop",
        "--skipLibCheck",
      ],
      {
        encoding: "utf-8",
      },
    );

    if (result.status !== 0) {
      console.error("STDOUT:", result.stdout);
      console.error("STDERR:", result.stderr);
    }
    expect(result.status).toBe(0);
  });
});
