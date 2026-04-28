import { describe, expect, it } from "vitest";
import { emitResource } from "../../src/emitter/resource-emitter.js";
import type { PropertyModel, ResourceModel } from "../../src/model/resource-model.js";
import type { TypeMapper } from "../../src/spec/type-mapping.js";

const PRIMITIVES = new Set(["string", "boolean", "date", "integer"]);
const COMPLEX = new Set(["HumanName", "Reference", "DomainResource", "Element"]);
const TS_FOR_PRIM: Record<string, string> = {
  string: "FhirString",
  boolean: "FhirBoolean",
  date: "FhirDate",
  integer: "FhirInteger",
};

const mapper: TypeMapper = {
  isPrimitive: (c) => PRIMITIVES.has(c),
  isComplexType: (c) => COMPLEX.has(c),
  fhirTypeToTs: (c) => TS_FOR_PRIM[c] ?? c,
};

const prop = (
  name: string,
  code: string,
  { isArray = false, isRequired = false }: { isArray?: boolean; isRequired?: boolean } = {},
): PropertyModel => ({
  name,
  isRequired,
  isArray,
  isChoiceType: false,
  types: [{ code }],
});

const model: ResourceModel = {
  name: "Patient",
  url: "http://hl7.org/fhir/StructureDefinition/Patient",
  kind: "resource",
  isAbstract: false,
  baseType: "DomainResource",
  properties: [
    prop("active", "boolean"),
    prop("birthDate", "date"),
    prop("given", "string", { isArray: true }),
    prop("name", "HumanName", { isArray: true }),
  ],
  backboneElements: [],
};

describe("Phase 1.3: primitive _field siblings", () => {
  const output = emitResource(model, mapper);

  it("emits a singular Element sibling for primitive properties", () => {
    expect(output).toContain("birthDate?: FhirDate;");
    expect(output).toContain("_birthDate?: Element;");
    expect(output).toContain("active?: FhirBoolean;");
    expect(output).toContain("_active?: Element;");
  });

  it("emits a sparse (Element | null)[] sibling for repeating primitives", () => {
    expect(output).toContain("given?: FhirString[];");
    expect(output).toContain("_given?: (Element | null)[];");
  });

  it("does not emit siblings for complex-typed properties", () => {
    expect(output).toContain("name?: HumanName[];");
    expect(output).not.toContain("_name?:");
  });

  it("imports Element when any primitive sibling is emitted", () => {
    expect(output).toMatch(/import type \{[^}]*\bElement\b[^}]*\} from "\.\.\/datatypes\.js";/);
  });
});
