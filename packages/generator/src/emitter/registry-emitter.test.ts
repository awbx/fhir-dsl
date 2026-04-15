import { describe, expect, it } from "vitest";
import { emitRegistry } from "./registry-emitter.js";

function makeResource(name: string) {
  return { name, properties: [], description: "" } as any;
}

function makeSearchParams(resourceType: string, params: Array<{ code: string; type: string; targets?: string[] }>) {
  return [resourceType, { params }] as const;
}

describe("emitRegistry", () => {
  it("generates FhirResourceMap interface", () => {
    const resources = [makeResource("Patient"), makeResource("Observation")];
    const output = emitRegistry(resources, new Map());

    expect(output).toContain("export interface FhirResourceMap");
    expect(output).toContain("Patient: Patient");
    expect(output).toContain("Observation: Observation");
  });

  it("sorts resources alphabetically", () => {
    const resources = [makeResource("Observation"), makeResource("Account")];
    const output = emitRegistry(resources, new Map());

    const accountIdx = output.indexOf("Account: Account");
    const obsIdx = output.indexOf("Observation: Observation");
    expect(accountIdx).toBeLessThan(obsIdx);
  });

  it("imports resources from kebab-case paths", () => {
    const resources = [makeResource("MedicationRequest")];
    const output = emitRegistry(resources, new Map());
    expect(output).toContain('./resources/medication-request.js');
  });

  it("generates SearchParamRegistry with search param types", () => {
    const resources = [makeResource("Patient")];
    const searchParams = new Map([makeSearchParams("Patient", [{ code: "name", type: "string" }])]);
    const output = emitRegistry(resources, searchParams);

    expect(output).toContain("export interface SearchParamRegistry");
    expect(output).toContain("Patient: PatientSearchParams");
    expect(output).toContain("PatientSearchParams");
  });

  it("imports search param types when they exist", () => {
    const resources = [makeResource("Patient")];
    const searchParams = new Map([makeSearchParams("Patient", [{ code: "name", type: "string" }])]);
    const output = emitRegistry(resources, searchParams);

    expect(output).toContain('from "./search-params.js"');
  });

  it("generates IncludeRegistry from reference params", () => {
    const resources = [makeResource("Observation")];
    const searchParams = new Map([
      makeSearchParams("Observation", [
        { code: "subject", type: "reference", targets: ["Patient", "Group"] },
        { code: "performer", type: "reference", targets: ["Practitioner"] },
      ]),
    ]);

    const output = emitRegistry(resources, searchParams);

    expect(output).toContain("export interface IncludeRegistry");
    expect(output).toContain("Observation: {");
    expect(output).toContain('"subject"');
    expect(output).toContain('"Patient" | "Group"');
    expect(output).toContain('"performer": "Practitioner"');
  });

  it("skips non-reference params from IncludeRegistry", () => {
    const resources = [makeResource("Patient")];
    const searchParams = new Map([
      makeSearchParams("Patient", [{ code: "name", type: "string" }]),
    ]);

    const output = emitRegistry(resources, searchParams);

    // IncludeRegistry should exist but not contain Patient entry
    expect(output).toContain("export interface IncludeRegistry");
    expect(output).not.toMatch(/IncludeRegistry[\s\S]*Patient:/);
  });

  it("generates empty ProfileRegistry by default", () => {
    const output = emitRegistry([], new Map());
    expect(output).toContain("export interface ProfileRegistry {}");
  });

  it("skips ProfileRegistry when skipProfileRegistry is true", () => {
    const output = emitRegistry([], new Map(), { skipProfileRegistry: true });
    expect(output).not.toContain("ProfileRegistry");
  });

  it("exports ResourceType alias", () => {
    const output = emitRegistry([makeResource("Patient")], new Map());
    expect(output).toContain("export type ResourceType = keyof FhirResourceMap");
  });
});
