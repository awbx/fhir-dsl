import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { beforeAll, describe, expect, it } from "vitest";
import { generate } from "../../../src/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, "fixtures");
const tmpOutputDir = join(__dirname, ".tmp-pipeline-output");

async function readGenerated(...segments: string[]) {
  return readFile(join(tmpOutputDir, "r4", ...segments), "utf8");
}

describe("codex terminology pipeline", () => {
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

  it("generates the expected terminology bundle and type aliases", async () => {
    const valuesets = await readGenerated("terminology", "valuesets.ts");
    const codesystems = await readGenerated("terminology", "codesystems.ts");

    expect(valuesets).toContain('export type AdministrativeGender = "male" | "female" | "other" | "unknown";');
    expect(valuesets).toContain(
      'export type ConditionClinicalStatusCodes = "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved";',
    );
    expect(valuesets).toContain(
      'export type ObservationCategoryCodes = "social-history" | "vital-signs" | "imaging" | "laboratory" | "procedure" | "survey" | "exam" | "therapy" | "activity";',
    );
    expect(valuesets).toContain(
      'export type ObservationStatus = "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown";',
    );

    expect(codesystems).toContain("export const AdministrativeGender = {");
    expect(codesystems).toContain('Male: "male" as const,');
    expect(codesystems).toContain('Unknown: "unknown" as const,');
    expect(codesystems).toContain("export const ObservationStatus = {");
    expect(codesystems).toContain('EnteredInError: "entered-in-error" as const,');
  });

  it("parameterizes resource fields correctly for each binding row", async () => {
    const patient = await readGenerated("resources", "patient.ts");
    const observation = await readGenerated("resources", "observation.ts");
    const condition = await readGenerated("resources", "condition.ts");
    const encounter = await readGenerated("resources", "encounter.ts");
    const specimen = await readGenerated("resources", "specimen.ts");
    const medicationRequest = await readGenerated("resources", "medication-request.ts");

    expect(patient).toContain('import type { AdministrativeGender } from "../terminology/valuesets.js";');
    expect(patient).toContain("gender?: FhirCode<AdministrativeGender>;");
    expect(patient).toContain("name?: HumanName[];");

    expect(observation).toContain(
      'import type { ObservationCategoryCodes, ObservationStatus } from "../terminology/valuesets.js";',
    );
    expect(observation).toContain("status: FhirCode<ObservationStatus>;");
    expect(observation).toContain("category?: CodeableConcept<ObservationCategoryCodes>[];");
    expect(observation).toContain("code: CodeableConcept;");

    expect(condition).toContain('import type { ConditionClinicalStatusCodes } from "../terminology/valuesets.js";');
    expect(condition).toContain("clinicalStatus?: CodeableConcept<ConditionClinicalStatusCodes | (string & {})>;");

    expect(encounter).not.toContain("../terminology/valuesets.js");
    expect(encounter).toContain("priority?: CodeableConcept;");

    expect(specimen).not.toContain("../terminology/valuesets.js");
    expect(specimen).toContain("type?: CodeableConcept;");

    expect(medicationRequest).not.toContain("../terminology/valuesets.js");
    expect(medicationRequest).toContain("medicationCodeableConcept?: CodeableConcept;");
  });

  it("parameterizes only required token search params", async () => {
    const searchParams = await readGenerated("search-params.ts");

    expect(searchParams).toContain(
      'import type { AdministrativeGender, ObservationStatus } from "./terminology/valuesets.js";',
    );
    expect(searchParams).toContain('"gender": TokenParam<AdministrativeGender>;');
    expect(searchParams).toContain('"status": TokenParam<ObservationStatus>;');
    expect(searchParams).toContain('"name": StringParam;');
    expect(searchParams).toContain('"subject": ReferenceParam;');
    expect(searchParams).not.toContain("ConditionClinicalStatusCodes");
  });

  it("compiles a consumer that exercises every binding row end to end", async () => {
    const consumerFile = join(tmpOutputDir, "consumer.ts");
    const tscPath = join(__dirname, "../../../../../node_modules/.bin/tsc");
    const tsconfigFile = join(tmpOutputDir, "tsconfig.json");

    await writeFile(
      consumerFile,
      `import { createClient, type GeneratedSchema } from "./r4/client.js";
import type {
  Condition,
  Encounter,
  MedicationRequest,
  Observation,
  Patient,
  Specimen,
} from "./r4/index.js";
import type { SearchParamFor } from "@fhir-dsl/core";

const client = createClient({ baseUrl: "http://example.test/fhir" });

const patient: Patient = { resourceType: "Patient", gender: "male" };
const observation: Observation = {
  resourceType: "Observation",
  status: "final",
  code: { text: "Body weight" },
  category: [{ coding: [{ code: "vital-signs" }] }],
};
const conditionKnown: Condition = {
  resourceType: "Condition",
  subject: { reference: "Patient/123" },
  clinicalStatus: { coding: [{ code: "active" }] },
};
const conditionCustom: Condition = {
  resourceType: "Condition",
  subject: { reference: "Patient/123" },
  clinicalStatus: { coding: [{ code: "custom-clinical-status" }] },
};
const encounter: Encounter = {
  resourceType: "Encounter",
  priority: { coding: [{ code: "routine-but-local" }] },
};
const specimen: Specimen = {
  resourceType: "Specimen",
  type: { coding: [{ code: "freeform-specimen-code" }] },
};
const medicationRequest: MedicationRequest = {
  resourceType: "MedicationRequest",
  subject: { reference: "Patient/123" },
  medicationCodeableConcept: { coding: [{ code: "123456789" }] },
};

type PatientGenderParam = SearchParamFor<GeneratedSchema, "Patient">["gender"]["value"];
const genderValue: PatientGenderParam = "female";

client.search("Patient").where("gender", "eq", patient.gender ?? genderValue);
client.search("Observation").where("status", "eq", observation.status);

void [
  patient,
  observation,
  conditionKnown,
  conditionCustom,
  encounter,
  specimen,
  medicationRequest,
];
`,
      "utf8",
    );

    await writeFile(
      tsconfigFile,
      JSON.stringify(
        {
          compilerOptions: {
            noEmit: true,
            strict: true,
            target: "ES2022",
            module: "NodeNext",
            moduleResolution: "NodeNext",
            esModuleInterop: true,
            skipLibCheck: true,
            types: ["node"],
          },
          include: ["./consumer.ts", "./r4/**/*.ts"],
        },
        null,
        2,
      ),
      "utf8",
    );

    await expect(access(join(tmpOutputDir, "r4", "index.ts"))).resolves.toBeUndefined();

    const result = spawnSync(tscPath, ["-p", tsconfigFile], {
      cwd: tmpOutputDir,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      throw new Error([`tsc failed`, result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n\n"));
    }

    expect(result.status).toBe(0);
  });
});
