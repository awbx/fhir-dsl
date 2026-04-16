import { describe, expect, it } from "vitest";
import { parseStructureDefinition } from "./structure-definition.js";

function makeSD(overrides: Record<string, any> = {}) {
  return {
    resourceType: "StructureDefinition" as const,
    url: "http://hl7.org/fhir/StructureDefinition/TestResource",
    name: "TestResource",
    kind: "resource",
    abstract: false,
    type: "TestResource",
    baseDefinition: "http://hl7.org/fhir/StructureDefinition/DomainResource",
    snapshot: {
      element: [
        { path: "TestResource", definition: "A test resource" },
        { path: "TestResource.id", type: [{ code: "http://hl7.org/fhirpath/System.String" }], min: 0, max: "1" },
        { path: "TestResource.meta", type: [{ code: "Meta" }], min: 0, max: "1" },
        { path: "TestResource.text", type: [{ code: "Narrative" }], min: 0, max: "1" },
        { path: "TestResource.contained", type: [{ code: "Resource" }], min: 0, max: "*" },
        { path: "TestResource.extension", type: [{ code: "Extension" }], min: 0, max: "*" },
        { path: "TestResource.modifierExtension", type: [{ code: "Extension" }], min: 0, max: "*" },
        {
          path: "TestResource.status",
          type: [{ code: "code" }],
          min: 1,
          max: "1",
          short: "active | inactive",
        },
        {
          path: "TestResource.name",
          type: [{ code: "string" }],
          min: 0,
          max: "1",
          short: "Name of the resource",
        },
        {
          path: "TestResource.subject",
          type: [{ code: "Reference", targetProfile: ["http://hl7.org/fhir/StructureDefinition/Patient"] }],
          min: 0,
          max: "1",
        },
      ],
    },
    ...overrides,
  };
}

describe("parseStructureDefinition", () => {
  it("parses basic resource properties", () => {
    const model = parseStructureDefinition(makeSD());

    expect(model.name).toBe("TestResource");
    expect(model.kind).toBe("resource");
    expect(model.isAbstract).toBe(false);
    expect(model.baseType).toBe("DomainResource");
  });

  it("extracts description from root element", () => {
    const model = parseStructureDefinition(makeSD());
    expect(model.description).toBe("A test resource");
  });

  it("skips inherited DomainResource properties", () => {
    const model = parseStructureDefinition(makeSD());
    const propNames = model.properties.map((p) => p.name);

    expect(propNames).not.toContain("id");
    expect(propNames).not.toContain("meta");
    expect(propNames).not.toContain("text");
    expect(propNames).not.toContain("contained");
    expect(propNames).not.toContain("extension");
    expect(propNames).not.toContain("modifierExtension");
  });

  it("includes resource-specific properties", () => {
    const model = parseStructureDefinition(makeSD());
    const propNames = model.properties.map((p) => p.name);

    expect(propNames).toContain("status");
    expect(propNames).toContain("name");
    expect(propNames).toContain("subject");
  });

  it("marks required properties correctly", () => {
    const model = parseStructureDefinition(makeSD());
    const status = model.properties.find((p) => p.name === "status")!;
    const name = model.properties.find((p) => p.name === "name")!;

    expect(status.isRequired).toBe(true);
    expect(name.isRequired).toBe(false);
  });

  it("resolves Reference target profiles", () => {
    const model = parseStructureDefinition(makeSD());
    const subject = model.properties.find((p) => p.name === "subject")!;

    expect(subject.types[0]!.code).toBe("Reference");
    expect(subject.types[0]!.targetProfiles).toEqual(["Patient"]);
  });

  it("parses choice types into expanded properties", () => {
    const sd = makeSD({
      snapshot: {
        element: [
          { path: "TestResource" },
          {
            path: "TestResource.value[x]",
            type: [{ code: "string" }, { code: "Quantity" }, { code: "boolean" }],
            min: 0,
            max: "1",
            short: "Value of the resource",
          },
        ],
      },
      baseDefinition: undefined,
    });

    const model = parseStructureDefinition(sd);
    const propNames = model.properties.map((p) => p.name);

    expect(propNames).toContain("valueString");
    expect(propNames).toContain("valueQuantity");
    expect(propNames).toContain("valueBoolean");
    expect(model.properties.every((p) => p.isChoiceType)).toBe(true);
  });

  it("parses backbone elements", () => {
    const sd = makeSD({
      snapshot: {
        element: [
          { path: "TestResource" },
          {
            path: "TestResource.contact",
            type: [{ code: "BackboneElement" }],
            min: 0,
            max: "*",
          },
          {
            path: "TestResource.contact.name",
            type: [{ code: "HumanName" }],
            min: 0,
            max: "1",
          },
          {
            path: "TestResource.contact.telecom",
            type: [{ code: "ContactPoint" }],
            min: 0,
            max: "*",
          },
        ],
      },
      baseDefinition: undefined,
    });

    const model = parseStructureDefinition(sd);

    expect(model.backboneElements).toHaveLength(1);
    expect(model.backboneElements[0]!.name).toBe("TestResourceContact");
    expect(model.backboneElements[0]!.properties).toHaveLength(2);

    const contactProp = model.properties.find((p) => p.name === "contact")!;
    expect(contactProp.types[0]!.code).toBe("TestResourceContact");
    expect(contactProp.isArray).toBe(true);
  });

  it("parses array properties", () => {
    const sd = makeSD({
      snapshot: {
        element: [
          { path: "TestResource" },
          { path: "TestResource.identifier", type: [{ code: "Identifier" }], min: 0, max: "*" },
        ],
      },
      baseDefinition: undefined,
    });

    const model = parseStructureDefinition(sd);
    const identifier = model.properties.find((p) => p.name === "identifier")!;

    expect(identifier.isArray).toBe(true);
  });

  it("resolves FHIRPath system types", () => {
    const sd = makeSD({
      snapshot: {
        element: [
          { path: "TestResource" },
          {
            path: "TestResource.active",
            type: [{ code: "http://hl7.org/fhirpath/System.Boolean" }],
            min: 0,
            max: "1",
          },
        ],
      },
      baseDefinition: undefined,
    });

    const model = parseStructureDefinition(sd);
    const active = model.properties.find((p) => p.name === "active")!;

    expect(active.types[0]!.code).toBe("boolean");
  });

  it("extracts binding from elements", () => {
    const sd = makeSD({
      snapshot: {
        element: [
          { path: "TestResource" },
          {
            path: "TestResource.status",
            type: [{ code: "code" }],
            min: 1,
            max: "1",
            binding: {
              strength: "required",
              valueSet: "http://hl7.org/fhir/ValueSet/observation-status|4.0.1",
            },
          },
          {
            path: "TestResource.category",
            type: [{ code: "CodeableConcept" }],
            min: 0,
            max: "*",
            binding: {
              strength: "extensible",
              valueSet: "http://hl7.org/fhir/ValueSet/observation-category",
            },
          },
          {
            path: "TestResource.code",
            type: [{ code: "CodeableConcept" }],
            min: 1,
            max: "1",
            binding: {
              strength: "example",
              valueSet: "http://hl7.org/fhir/ValueSet/observation-codes",
            },
          },
          {
            path: "TestResource.name",
            type: [{ code: "string" }],
            min: 0,
            max: "1",
          },
        ],
      },
      baseDefinition: undefined,
    });

    const model = parseStructureDefinition(sd);

    const status = model.properties.find((p) => p.name === "status")!;
    expect(status.binding).toEqual({
      strength: "required",
      valueSet: "http://hl7.org/fhir/ValueSet/observation-status|4.0.1",
    });

    const category = model.properties.find((p) => p.name === "category")!;
    expect(category.binding?.strength).toBe("extensible");

    const code = model.properties.find((p) => p.name === "code")!;
    expect(code.binding?.strength).toBe("example");

    const name = model.properties.find((p) => p.name === "name")!;
    expect(name.binding).toBeUndefined();
  });

  it("falls back to differential when snapshot is missing", () => {
    const sd = {
      resourceType: "StructureDefinition" as const,
      url: "http://example.com/TestResource",
      name: "TestResource",
      kind: "resource",
      abstract: false,
      type: "TestResource",
      differential: {
        element: [
          { path: "TestResource" },
          { path: "TestResource.code", type: [{ code: "CodeableConcept" }], min: 1, max: "1" },
        ],
      },
    };

    const model = parseStructureDefinition(sd);
    expect(model.properties).toHaveLength(1);
    expect(model.properties[0]!.name).toBe("code");
  });
});
