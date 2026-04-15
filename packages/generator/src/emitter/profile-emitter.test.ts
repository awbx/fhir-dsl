import { describe, expect, it } from "vitest";
import type { ProfileModel } from "../model/profile-model.js";
import { emitProfile, emitProfileIndex, emitProfileRegistry } from "./profile-emitter.js";

function makeProfile(overrides: Partial<ProfileModel> = {}): ProfileModel {
  return {
    name: "USCorePatient",
    url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
    baseResourceType: "Patient",
    slug: "us-core-patient",
    igName: "hl7.fhir.us.core",
    constrainedProperties: [],
    description: "US Core Patient Profile",
    ...overrides,
  };
}

describe("emitProfile", () => {
  it("generates interface extending base resource", () => {
    const output = emitProfile(makeProfile());
    expect(output).toContain("export interface USCorePatient extends Patient");
  });

  it("imports base resource type", () => {
    const output = emitProfile(makeProfile());
    expect(output).toContain('import type { Patient } from "../resources/patient.js"');
  });

  it("adds JSDoc with description and URL", () => {
    const output = emitProfile(makeProfile());
    expect(output).toContain("/**");
    expect(output).toContain("* US Core Patient Profile");
    expect(output).toContain("* http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient");
    expect(output).toContain("*/");
  });

  it("omits JSDoc when description is missing", () => {
    const output = emitProfile(makeProfile({ description: undefined }));
    expect(output).not.toContain("/**");
  });

  it("emits required properties without question mark", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "status",
            types: [{ code: "code" }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("status: FhirCode;");
    expect(output).not.toContain("status?:");
  });

  it("emits optional properties with question mark", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "note",
            types: [{ code: "Annotation" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("note?: Annotation;");
  });

  it("emits array properties", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "category",
            types: [{ code: "CodeableConcept" }],
            isRequired: true,
            isArray: true,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("category: CodeableConcept[];");
  });

  it("emits Reference with target profiles", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "subject",
            types: [{ code: "Reference", targetProfiles: ["Patient", "Group"] }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain('subject: Reference<"Patient" | "Group">');
  });

  it("emits union types", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "value",
            types: [{ code: "Quantity" }, { code: "string" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("value?: Quantity | FhirString;");
  });

  it("imports primitives and datatypes separately", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          { name: "status", types: [{ code: "code" }], isRequired: true, isArray: false, isChoiceType: false },
          {
            name: "category",
            types: [{ code: "CodeableConcept" }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain('from "../primitives.js"');
    expect(output).toContain('from "../datatypes.js"');
  });

  it("imports Reference from datatypes when used", () => {
    const output = emitProfile(
      makeProfile({
        constrainedProperties: [
          {
            name: "subject",
            types: [{ code: "Reference", targetProfiles: ["Patient"] }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("Reference");
    expect(output).toContain('from "../datatypes.js"');
  });
});

describe("emitProfileIndex", () => {
  it("exports all profiles sorted alphabetically", () => {
    const profiles = [makeProfile({ name: "USCorePatient" }), makeProfile({ name: "BloodPressure" })];

    const output = emitProfileIndex(profiles);

    const bpIdx = output.indexOf("blood-pressure");
    const patIdx = output.indexOf("uscore-patient");
    expect(bpIdx).toBeLessThan(patIdx);
  });

  it("exports profile registry", () => {
    const output = emitProfileIndex([]);
    expect(output).toContain('export * from "./profile-registry.js"');
  });

  it("uses kebab-case file names", () => {
    const output = emitProfileIndex([makeProfile({ name: "BloodPressure" })]);
    expect(output).toContain('export * from "./blood-pressure.js"');
  });
});

describe("emitProfileRegistry", () => {
  it("generates ProfileRegistry interface", () => {
    const profiles = [makeProfile({ baseResourceType: "Patient", name: "USCorePatient", slug: "us-core-patient" })];

    const output = emitProfileRegistry(profiles);

    expect(output).toContain("export interface ProfileRegistry");
    expect(output).toContain("Patient: {");
    expect(output).toContain('"us-core-patient": USCorePatient');
  });

  it("groups profiles by base resource type", () => {
    const profiles = [
      makeProfile({ baseResourceType: "Observation", name: "VitalSigns", slug: "vital-signs" }),
      makeProfile({ baseResourceType: "Patient", name: "USCorePatient", slug: "us-core-patient" }),
      makeProfile({ baseResourceType: "Observation", name: "BloodPressure", slug: "bp" }),
    ];

    const output = emitProfileRegistry(profiles);

    expect(output).toContain("Observation: {");
    expect(output).toContain("Patient: {");
    expect(output).toContain('"vital-signs": VitalSigns');
    expect(output).toContain('"bp": BloodPressure');
  });

  it("imports profile types from kebab-case paths", () => {
    const profiles = [makeProfile({ name: "BloodPressure" })];
    const output = emitProfileRegistry(profiles);
    expect(output).toContain('import type { BloodPressure } from "./blood-pressure.js"');
  });

  it("sorts resource types alphabetically", () => {
    const profiles = [
      makeProfile({ baseResourceType: "Observation", name: "VitalSigns", slug: "vs" }),
      makeProfile({ baseResourceType: "Account", name: "TestAccount", slug: "ta" }),
    ];

    const output = emitProfileRegistry(profiles);

    const accountIdx = output.indexOf("Account: {");
    const obsIdx = output.indexOf("Observation: {");
    expect(accountIdx).toBeLessThan(obsIdx);
  });
});
