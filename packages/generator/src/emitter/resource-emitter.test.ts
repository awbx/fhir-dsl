import { describe, expect, it } from "vitest";
import type { ResourceModel } from "../model/resource-model.js";
import { emitResource } from "./resource-emitter.js";

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
    );

    expect(output).toContain("name?: FhirString;");
  });

  it("emits array properties with []", () => {
    const output = emitResource(
      makeModel({
        properties: [
          { name: "identifier", types: [{ code: "Identifier" }], isRequired: false, isArray: true, isChoiceType: false },
        ],
      }),
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
    );

    expect(output).toContain("DomainResource");
    expect(output).toContain("Reference");
  });
});
