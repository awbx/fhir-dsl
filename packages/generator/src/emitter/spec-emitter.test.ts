import { describe, expect, it } from "vitest";
import type { ProfileModel } from "../model/profile-model.js";
import type { ResourceModel, ResourceSearchParams } from "../model/resource-model.js";
import { emitProfileSpec, emitResourceSpec, emitSpecIndex } from "./spec-emitter.js";

function makeResource(overrides: Partial<ResourceModel> = {}): ResourceModel {
  return {
    name: "Patient",
    url: "http://hl7.org/fhir/StructureDefinition/Patient",
    kind: "resource",
    isAbstract: false,
    baseType: "DomainResource",
    properties: [],
    backboneElements: [],
    description: "Demographics and other administrative information about an individual receiving care.",
    ...overrides,
  };
}

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

describe("emitResourceSpec", () => {
  it("emits H1 title and metadata block", () => {
    const output = emitResourceSpec(makeResource());
    expect(output).toContain("# Patient");
    expect(output).toContain("- **URL:** http://hl7.org/fhir/StructureDefinition/Patient");
    expect(output).toContain("- **Kind:** resource");
    expect(output).toContain("- **Base:** DomainResource");
  });

  it("includes description paragraph", () => {
    const output = emitResourceSpec(makeResource());
    expect(output).toContain("Demographics and other administrative information");
  });

  it("renders properties table with cardinality", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
          {
            name: "active",
            types: [{ code: "boolean" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            description: "Whether this patient record is in active use",
          },
          {
            name: "name",
            types: [{ code: "HumanName" }],
            isRequired: true,
            isArray: true,
            isChoiceType: false,
          },
          {
            name: "identifier",
            types: [{ code: "Identifier" }],
            isRequired: false,
            isArray: true,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("## Properties");
    expect(output).toContain("| Name | Card | Type | Binding | Description |");
    expect(output).toContain("| active | 0..1 | boolean |");
    expect(output).toContain("| name | 1..* | HumanName |");
    expect(output).toContain("| identifier | 0..* | Identifier |");
    expect(output).toContain("Whether this patient record is in active use");
  });

  it("formats choice-type properties with escaped pipe", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
          {
            name: "deceased",
            types: [{ code: "boolean" }, { code: "dateTime" }],
            isRequired: false,
            isArray: false,
            isChoiceType: true,
          },
        ],
      }),
    );
    expect(output).toContain("boolean \\| dateTime");
  });

  it("renders Reference with target profiles inline", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
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
    expect(output).toContain("Reference(Patient \\| Group)");
  });

  it("renders binding column when present", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
          {
            name: "gender",
            types: [{ code: "code" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            binding: {
              strength: "required",
              valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender",
            },
          },
        ],
      }),
    );
    expect(output).toContain("required @ http://hl7.org/fhir/ValueSet/administrative-gender");
  });

  it("renders backbone elements section", () => {
    const output = emitResourceSpec(
      makeResource({
        backboneElements: [
          {
            name: "PatientContact",
            path: "Patient.contact",
            properties: [
              {
                name: "relationship",
                types: [{ code: "CodeableConcept" }],
                isRequired: false,
                isArray: true,
                isChoiceType: false,
              },
            ],
          },
        ],
      }),
    );
    expect(output).toContain("## Backbone elements");
    expect(output).toContain("### PatientContact");
    expect(output).toContain("Path: `Patient.contact`");
    expect(output).toContain("| relationship | 0..* | CodeableConcept |");
  });

  it("renders search parameters when supplied", () => {
    const searchParams: ResourceSearchParams = {
      resourceType: "Patient",
      params: [
        {
          name: "identifier",
          code: "identifier",
          type: "token",
          description: "A patient identifier",
          expression: "Patient.identifier",
        },
      ],
    };
    const output = emitResourceSpec(makeResource(), searchParams);
    expect(output).toContain("## Search parameters");
    expect(output).toContain("| identifier | token | Patient.identifier | A patient identifier |");
  });

  it("omits search parameters section when none provided", () => {
    const output = emitResourceSpec(makeResource());
    expect(output).not.toContain("## Search parameters");
  });

  it("escapes pipe characters in descriptions", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
          {
            name: "note",
            types: [{ code: "string" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            description: "Values are a | b | c",
          },
        ],
      }),
    );
    expect(output).toContain("Values are a \\| b \\| c");
  });

  it("collapses multi-line descriptions onto a single table row", () => {
    const output = emitResourceSpec(
      makeResource({
        properties: [
          {
            name: "note",
            types: [{ code: "string" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            description: "First line.\nSecond line.",
          },
        ],
      }),
    );
    const tableRow = output.split("\n").find((line) => line.startsWith("| note "));
    expect(tableRow).toBeDefined();
    expect(tableRow).toContain("First line. Second line.");
  });
});

describe("emitProfileSpec", () => {
  it("emits H1, base resource, and IG name", () => {
    const output = emitProfileSpec(makeProfile());
    expect(output).toContain("# USCorePatient");
    expect(output).toContain("- **Base resource:** Patient");
    expect(output).toContain("- **IG:** hl7.fhir.us.core");
  });

  it("lists only constrained properties with a deltas note", () => {
    const output = emitProfileSpec(
      makeProfile({
        constrainedProperties: [
          {
            name: "identifier",
            types: [{ code: "Identifier" }],
            isRequired: true,
            isArray: true,
            isChoiceType: false,
          },
        ],
      }),
    );
    expect(output).toContain("## Constrained properties");
    expect(output).toContain("narrowed relative to `Patient`");
    expect(output).toContain("| identifier | 1..* | Identifier |");
  });

  it("omits constrained properties section when empty", () => {
    const output = emitProfileSpec(makeProfile({ constrainedProperties: [] }));
    expect(output).not.toContain("## Constrained properties");
  });
});

describe("emitSpecIndex", () => {
  it("lists resources sorted alphabetically linking kebab-case files", () => {
    const output = emitSpecIndex(
      "r4",
      [makeResource({ name: "Observation", description: "A measurement" }), makeResource({ name: "Patient" })],
      [],
    );
    expect(output).toContain("# FHIR R4 spec");
    const obsIdx = output.indexOf("Observation](./resources/observation.md)");
    const patIdx = output.indexOf("Patient](./resources/patient.md)");
    expect(obsIdx).toBeGreaterThan(-1);
    expect(patIdx).toBeGreaterThan(-1);
    expect(obsIdx).toBeLessThan(patIdx);
    expect(output).toContain("— A measurement");
  });

  it("lists profiles with base resource and link", () => {
    const output = emitSpecIndex("r4", [makeResource()], [makeProfile()]);
    expect(output).toContain("## Profiles");
    expect(output).toContain("[USCorePatient](./profiles/uscore-patient.md) _(Patient)_ — US Core Patient Profile");
  });

  it("omits Profiles section when no profiles supplied", () => {
    const output = emitSpecIndex("r4", [makeResource()], []);
    expect(output).not.toContain("## Profiles");
  });
});
