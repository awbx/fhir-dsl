import { describe, expect, it } from "vitest";
import type { ResourceModel } from "../model/resource-model.js";
import { makeFallbackMapper } from "../spec/test-helpers.js";
import { emitResource } from "./resource-emitter.js";

const MAPPER = makeFallbackMapper();

function makeModel(overrides: Partial<ResourceModel> = {}): ResourceModel {
  return {
    name: "TestResource",
    url: "http://hl7.org/fhir/StructureDefinition/TestResource",
    kind: "resource",
    isAbstract: false,
    baseType: "DomainResource",
    properties: [],
    backboneElements: [],
    ...overrides,
  };
}

describe("emitResource", () => {
  it("emits a basic interface extending DomainResource", () => {
    const output = emitResource(
      makeModel({
        properties: [
          { name: "status", types: [{ code: "code" }], isRequired: true, isArray: false, isChoiceType: false },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("export interface TestResource extends DomainResource");
    expect(output).toContain('resourceType: "TestResource"');
    expect(output).toContain("status: FhirCode;");
  });

  it("emits optional properties with ?", () => {
    const output = emitResource(
      makeModel({
        properties: [
          { name: "name", types: [{ code: "string" }], isRequired: false, isArray: false, isChoiceType: false },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("name?: FhirString;");
  });

  it("emits array properties with []", () => {
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "identifier",
            types: [{ code: "Identifier" }],
            isRequired: false,
            isArray: true,
            isChoiceType: false,
          },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("identifier?: Identifier[];");
  });

  it("emits Reference with target profiles", () => {
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "subject",
            types: [{ code: "Reference", targetProfiles: ["Patient", "Group"] }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain('Reference<"Patient" | "Group">');
  });

  it("emits backbone element interfaces", () => {
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "contact",
            types: [{ code: "TestResourceContact" }],
            isRequired: false,
            isArray: true,
            isChoiceType: false,
          },
        ],
        backboneElements: [
          {
            name: "TestResourceContact",
            path: "TestResource.contact",
            properties: [
              { name: "name", types: [{ code: "HumanName" }], isRequired: false, isArray: false, isChoiceType: false },
            ],
          },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("export interface TestResourceContact extends BackboneElement");
    expect(output).toContain("name?: HumanName;");
  });

  it("emits primitive imports", () => {
    const output = emitResource(
      makeModel({
        properties: [
          { name: "status", types: [{ code: "code" }], isRequired: true, isArray: false, isChoiceType: false },
          { name: "date", types: [{ code: "dateTime" }], isRequired: false, isArray: false, isChoiceType: false },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain('import type { FhirCode, FhirDateTime } from "../primitives.js"');
  });

  it("emits datatype imports", () => {
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "subject",
            types: [{ code: "Reference" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
          },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("DomainResource");
    expect(output).toContain("Reference");
  });

  it("emits FhirCode with terminology type for required binding", () => {
    const bindingTypeMap = new Map([["http://hl7.org/fhir/ValueSet/gender", "AdministrativeGender"]]);
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "gender",
            types: [{ code: "code" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "required", valueSet: "http://hl7.org/fhir/ValueSet/gender" },
          },
        ],
      }),
      MAPPER,
      bindingTypeMap,
    );

    expect(output).toContain("gender?: FhirCode<AdministrativeGender>;");
    expect(output).toContain('import type { AdministrativeGender } from "../terminology/valuesets.js"');
  });

  it("emits extensible binding with string & {} fallback", () => {
    const bindingTypeMap = new Map([["http://hl7.org/fhir/ValueSet/condition-clinical", "ConditionClinical"]]);
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "clinicalStatus",
            types: [{ code: "CodeableConcept" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "extensible", valueSet: "http://hl7.org/fhir/ValueSet/condition-clinical" },
          },
        ],
      }),
      MAPPER,
      bindingTypeMap,
    );

    expect(output).toContain("clinicalStatus?: CodeableConcept<ConditionClinical | (string & {})>;");
  });

  it("does not parameterize preferred or example bindings", () => {
    const bindingTypeMap = new Map([["http://hl7.org/fhir/ValueSet/test", "TestCodes"]]);
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "code",
            types: [{ code: "code" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "example", valueSet: "http://hl7.org/fhir/ValueSet/test" },
          },
        ],
      }),
      MAPPER,
      bindingTypeMap,
    );

    expect(output).toContain("code?: FhirCode;");
    expect(output).not.toContain("TestCodes");
  });

  it("falls back to unparameterized type when binding URL not in map", () => {
    const bindingTypeMap = new Map<string, string>();
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "status",
            types: [{ code: "code" }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "required", valueSet: "http://hl7.org/fhir/ValueSet/unknown" },
          },
        ],
      }),
      MAPPER,
      bindingTypeMap,
    );

    expect(output).toContain("status: FhirCode;");
  });

  it("resolves binding URL with version suffix", () => {
    const bindingTypeMap = new Map([["http://hl7.org/fhir/ValueSet/status", "ObservationStatus"]]);
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "status",
            types: [{ code: "code" }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "required", valueSet: "http://hl7.org/fhir/ValueSet/status|4.0.1" },
          },
        ],
      }),
      MAPPER,
      bindingTypeMap,
    );

    expect(output).toContain("status: FhirCode<ObservationStatus>;");
  });

  it("emits without terminology when no bindingTypeMap provided", () => {
    const output = emitResource(
      makeModel({
        properties: [
          {
            name: "status",
            types: [{ code: "code" }],
            isRequired: true,
            isArray: false,
            isChoiceType: false,
            binding: { strength: "required", valueSet: "http://hl7.org/fhir/ValueSet/status" },
          },
        ],
      }),
      MAPPER,
    );

    expect(output).toContain("status: FhirCode;");
    expect(output).not.toContain("terminology");
  });
});
