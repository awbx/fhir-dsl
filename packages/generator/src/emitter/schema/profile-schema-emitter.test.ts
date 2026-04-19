import { describe, expect, it } from "vitest";
import type { ProfileModel } from "../../model/profile-model.js";
import { makeFallbackMapper } from "../../spec/test-helpers.js";
import type { BindingTypeMap } from "../terminology-emitter.js";
import { nativeAdapter } from "./native.js";
import { emitProfileSchema, emitProfileSchemaIndex, emitProfileSchemaRegistry } from "./profile-schema-emitter.js";

const MAPPER = makeFallbackMapper();

function usCorePatient(): ProfileModel {
  return {
    name: "USCorePatientProfile",
    url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient",
    baseResourceType: "Patient",
    slug: "us-core-patient",
    igName: "hl7.fhir.us.core",
    constrainedProperties: [
      {
        name: "identifier",
        types: [{ code: "Identifier" }],
        isRequired: true,
        isArray: true,
        isChoiceType: false,
      },
      {
        name: "name",
        types: [{ code: "HumanName" }],
        isRequired: true,
        isArray: true,
        isChoiceType: false,
      },
    ],
  };
}

describe("emitProfileSchema", () => {
  const datatypes = new Set(["Identifier", "HumanName"]);

  it("generates an extend on the base resource schema", () => {
    const out = emitProfileSchema(usCorePatient(), nativeAdapter, { mapper: MAPPER, availableDatatypes: datatypes });
    expect(out).toContain('import * as s from "../__runtime.js";');
    expect(out).toContain('import { PatientSchema } from "../resources/patient.schema.js";');
    expect(out).toContain("s.extend(PatientSchema, {");
  });

  it("marks required constrained properties as non-optional arrays with minItems=1", () => {
    const out = emitProfileSchema(usCorePatient(), nativeAdapter, { mapper: MAPPER, availableDatatypes: datatypes });
    expect(out).toContain("identifier: { schema: s.array(IdentifierSchema, 1), optional: false }");
    expect(out).toContain("name: { schema: s.array(HumanNameSchema, 1), optional: false }");
  });

  it("pulls in datatype imports used by constrained properties", () => {
    const out = emitProfileSchema(usCorePatient(), nativeAdapter, { mapper: MAPPER, availableDatatypes: datatypes });
    expect(out).toContain('import { HumanNameSchema, IdentifierSchema } from "../datatypes.js";');
  });

  it("imports terminology for bound code constraints", () => {
    const profile: ProfileModel = {
      name: "FooProfile",
      url: "x",
      baseResourceType: "Foo",
      slug: "foo",
      igName: "ig",
      constrainedProperties: [
        {
          name: "status",
          types: [{ code: "code" }],
          isRequired: true,
          isArray: false,
          isChoiceType: false,
          binding: { strength: "required", valueSet: "http://example.org/vs/statuses" },
        },
      ],
    };
    const map: BindingTypeMap = new Map([["http://example.org/vs/statuses", "Statuses"]]);
    const out = emitProfileSchema(profile, nativeAdapter, {
      mapper: MAPPER,
      bindingTypeMap: map,
      availableDatatypes: datatypes,
    });
    expect(out).toContain('import { StatusesSchema } from "../terminology.js";');
    expect(out).toContain("status: { schema: StatusesSchema, optional: false }");
  });
});

describe("emitProfileSchemaIndex", () => {
  it("re-exports each profile schema and the registry", () => {
    const out = emitProfileSchemaIndex([usCorePatient()]);
    expect(out).toContain('export * from "./uscore-patient-profile.schema.js";');
    expect(out).toContain('export * from "./profile-schema-registry.js";');
  });
});

describe("emitProfileSchemaRegistry", () => {
  it("groups profiles by base resource and keys by slug", () => {
    const out = emitProfileSchemaRegistry([usCorePatient()]);
    expect(out).toContain('import { USCorePatientProfileSchema } from "./uscore-patient-profile.schema.js";');
    expect(out).toContain("export const ProfileSchemaRegistry = {");
    expect(out).toContain("Patient: {");
    expect(out).toContain('"us-core-patient": USCorePatientProfileSchema,');
    expect(out).toContain("} as const;");
  });

  it("sorts resource groups and slugs alphabetically", () => {
    const patientProfile = usCorePatient();
    const obsProfile: ProfileModel = {
      ...patientProfile,
      name: "USCoreLabObservation",
      baseResourceType: "Observation",
      slug: "us-core-lab-observation",
    };
    const out = emitProfileSchemaRegistry([patientProfile, obsProfile]);
    expect(out.indexOf("Observation:")).toBeLessThan(out.indexOf("Patient:"));
  });
});
