import { describe, expect, it } from "vitest";
import { emitClient, emitResourceIndex, emitRootIndex } from "./index-emitter.js";

function makeResource(name: string) {
  return { name, properties: [], searchParams: [], description: "" } as any;
}

describe("emitResourceIndex", () => {
  it("exports standard modules", () => {
    const output = emitResourceIndex([]);

    expect(output).toContain('export * from "./primitives.js"');
    expect(output).toContain('export * from "./datatypes.js"');
    expect(output).toContain('export * from "./search-param-types.js"');
    expect(output).toContain('export * from "./search-params.js"');
    expect(output).toContain('export * from "./registry.js"');
    expect(output).toContain('export * from "./client.js"');
  });

  it("exports resources in alphabetical order", () => {
    const resources = [makeResource("Patient"), makeResource("Account"), makeResource("Observation")];
    const output = emitResourceIndex(resources);

    const accountIdx = output.indexOf("account");
    const observationIdx = output.indexOf("observation");
    const patientIdx = output.indexOf("patient");

    expect(accountIdx).toBeLessThan(observationIdx);
    expect(observationIdx).toBeLessThan(patientIdx);
  });

  it("converts resource names to kebab-case file paths", () => {
    const output = emitResourceIndex([makeResource("MedicationRequest")]);
    expect(output).toContain('export * from "./resources/medication-request.js"');
  });

  it("includes extra exports when provided", () => {
    const output = emitResourceIndex([], ["./profiles/index.js"]);
    expect(output).toContain('export * from "./profiles/index.js"');
  });

  it("omits extra exports line when not provided", () => {
    const output = emitResourceIndex([]);
    expect(output).not.toContain("profiles");
  });
});

describe("emitRootIndex", () => {
  it("exports version-specific index", () => {
    expect(emitRootIndex("R4")).toBe('export * from "./r4/index.js";\n');
  });

  it("lowercases version", () => {
    expect(emitRootIndex("R4B")).toContain("r4b");
  });
});

describe("emitClient", () => {
  it("imports core and registry", () => {
    const output = emitClient(false);
    expect(output).toContain("@fhir-dsl/core");
    expect(output).toContain("FhirResourceMap");
    expect(output).toContain("SearchParamRegistry");
  });

  it("includes ProfileRegistry import when hasProfiles is true", () => {
    const output = emitClient(true);
    expect(output).toContain("ProfileRegistry");
    expect(output).toContain("profiles/profile-registry.js");
  });

  it("uses empty record for profiles when hasProfiles is false", () => {
    const output = emitClient(false);
    expect(output).toContain("Record<string, never>");
    expect(output).not.toContain("profile-registry.js");
  });

  it("exports createClient factory", () => {
    const output = emitClient(false);
    expect(output).toContain("export function createClient");
    expect(output).toContain("createFhirClient<GeneratedSchema>");
  });

  it("exports GeneratedSchema type", () => {
    const output = emitClient(false);
    expect(output).toContain("export type GeneratedSchema");
    expect(output).toContain("resources: FhirResourceMap");
    expect(output).toContain("searchParams: SearchParamRegistry");
    expect(output).toContain("includes: IncludeRegistry");
    expect(output).toContain("revIncludes: RevIncludeRegistry");
  });

  it("imports RevIncludeRegistry from registry", () => {
    const output = emitClient(false);
    expect(output).toContain("RevIncludeRegistry");
  });

  it("does not import SchemaRegistry when hasValidator is false", () => {
    const output = emitClient(false, false);
    expect(output).not.toContain("schema-registry.js");
    expect(output).not.toContain("SchemaRegistry");
    expect(output).toContain("return createFhirClient<GeneratedSchema>({ includeExpressions, ...config });");
  });

  it("imports SchemaRegistry and wires it into config when hasValidator is true", () => {
    const output = emitClient(false, true);
    expect(output).toContain('import { SchemaRegistry } from "./schemas/schema-registry.js";');
    expect(output).toContain(
      "return createFhirClient<GeneratedSchema>({ schemas: SchemaRegistry, includeExpressions, ...config });",
    );
  });

  it("imports IncludeExpressions type and runtime const from registry", () => {
    const output = emitClient(false);
    expect(output).toContain("IncludeExpressions");
    expect(output).toContain("includeExpressions");
    expect(output).toContain("includeExpressions: IncludeExpressions");
  });
});
