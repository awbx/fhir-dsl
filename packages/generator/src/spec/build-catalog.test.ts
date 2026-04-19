import { describe, expect, it } from "vitest";
import type { DownloadedSpec } from "../downloader.js";
import { buildSpecCatalog, primitiveToTsName } from "./build-catalog.js";

interface TestElement {
  id?: string;
  path: string;
  type?: Array<{ code?: string; extension?: Array<{ url?: string; valueString?: string }> }>;
  maxLength?: number;
  minValueInteger?: number;
  maxValueInteger?: number;
}

function primitiveSD(name: string, valueElementOverrides: Partial<TestElement> = {}) {
  const systemTypeCodes: Record<string, string> = {
    boolean: "http://hl7.org/fhirpath/System.Boolean",
    integer: "http://hl7.org/fhirpath/System.Integer",
    decimal: "http://hl7.org/fhirpath/System.Decimal",
    string: "http://hl7.org/fhirpath/System.String",
    date: "http://hl7.org/fhirpath/System.Date",
    dateTime: "http://hl7.org/fhirpath/System.DateTime",
    time: "http://hl7.org/fhirpath/System.Time",
  };
  const code = systemTypeCodes[name] ?? "http://hl7.org/fhirpath/System.String";
  const valueEl: TestElement = {
    id: `${name}.value`,
    path: `${name}.value`,
    type: [{ code, extension: [] }],
    ...valueElementOverrides,
  };
  return {
    resourceType: "StructureDefinition",
    name,
    kind: "primitive-type",
    abstract: false,
    type: name,
    snapshot: {
      element: [{ id: name, path: name } as TestElement, valueEl],
    },
  };
}

function primitiveWithRegex(name: string, regex: string, extra: Partial<TestElement> = {}) {
  const base = primitiveSD(name, extra);
  const valueEl = base.snapshot.element[1] as TestElement;
  const existingCode = valueEl.type?.[0]?.code ?? "http://hl7.org/fhirpath/System.String";
  valueEl.type = [
    {
      code: existingCode,
      extension: [{ url: "http://hl7.org/fhir/StructureDefinition/regex", valueString: regex }],
    },
  ];
  return base;
}

function complexTypeSD(name: string, abstract = false) {
  return {
    resourceType: "StructureDefinition",
    name,
    kind: "complex-type",
    abstract,
    type: name,
    snapshot: { element: [{ id: name, path: name }] },
  };
}

function abstractResourceSD(name: string, childPaths: string[]) {
  const elements: TestElement[] = [{ id: name, path: name }];
  for (const p of childPaths) elements.push({ id: `${name}.${p}`, path: `${name}.${p}` });
  return {
    resourceType: "StructureDefinition",
    name,
    kind: name === "Element" || name === "BackboneElement" ? "complex-type" : "resource",
    abstract: true,
    type: name,
    snapshot: { element: elements },
  };
}

function searchParam(code: string, type: string, base: string[]) {
  return { resourceType: "SearchParameter", code, type, base };
}

describe("buildSpecCatalog", () => {
  it("derives primitive entries with anchored regex, constraints, and TS names", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [
        primitiveWithRegex("id", "[A-Za-z0-9\\-\\.]{1,64}"),
        primitiveSD("string", { maxLength: 1048576 }),
        primitiveSD("boolean"),
        primitiveSD("integer", { minValueInteger: -2147483648, maxValueInteger: 2147483647 }),
        primitiveWithRegex("positiveInt", "[1-9][0-9]*"),
        primitiveWithRegex("unsignedInt", "[0]|([1-9][0-9]*)"),
        primitiveSD("decimal"),
      ],
      searchParameters: [],
    };

    const cat = buildSpecCatalog(spec, "r4");

    expect([...cat.primitives.keys()].sort()).toEqual([
      "boolean",
      "decimal",
      "id",
      "integer",
      "positiveInt",
      "string",
      "unsignedInt",
    ]);

    const id = cat.primitives.get("id")!;
    expect(id.tsType).toBe("FhirId");
    expect(id.rule.kind).toBe("string");
    expect(id.rule.regex).toBeInstanceOf(RegExp);
    expect(id.rule.regex!.test("abc-123.xyz")).toBe(true);
    expect(id.rule.regex!.test("has space")).toBe(false);
    expect(id.rule.regex!.source.startsWith("^(?:")).toBe(true);

    expect(cat.primitives.get("string")!.rule.maxLength).toBe(1048576);
    expect(cat.primitives.get("boolean")!.rule.kind).toBe("boolean");

    const integer = cat.primitives.get("integer")!;
    expect(integer.rule.kind).toBe("integer");
    expect(integer.rule.min).toBe(-2147483648);
    expect(integer.rule.max).toBe(2147483647);

    expect(cat.primitives.get("positiveInt")!.rule.min).toBe(1);
    expect(cat.primitives.get("unsignedInt")!.rule.min).toBe(0);
    expect(cat.primitives.get("decimal")!.rule.kind).toBe("number");
  });

  it("keeps integer64 TS name as integer64", () => {
    expect(primitiveToTsName("integer64")).toBe("integer64");
    expect(primitiveToTsName("string")).toBe("FhirString");
    expect(primitiveToTsName("dateTime")).toBe("FhirDateTime");
    expect(primitiveToTsName("base64Binary")).toBe("FhirBase64Binary");
  });

  it("collects complex-type names with abstract flag", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [complexTypeSD("HumanName"), complexTypeSD("Coding"), complexTypeSD("Element", true)],
      searchParameters: [],
    };
    const cat = buildSpecCatalog(spec, "r4");
    expect(cat.complexTypes.get("HumanName")).toEqual({ name: "HumanName", isAbstract: false });
    expect(cat.complexTypes.get("Element")).toEqual({ name: "Element", isAbstract: true });
  });

  it("walks abstract Resource/DomainResource/Element/BackboneElement for base properties", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [
        abstractResourceSD("Resource", ["id", "meta", "implicitRules", "language"]),
        abstractResourceSD("DomainResource", [
          "id",
          "meta",
          "implicitRules",
          "language",
          "text",
          "contained",
          "extension",
          "modifierExtension",
        ]),
        abstractResourceSD("Element", ["id", "extension"]),
        abstractResourceSD("BackboneElement", ["id", "extension", "modifierExtension"]),
      ],
      searchParameters: [],
    };
    const cat = buildSpecCatalog(spec, "r4");
    expect([...cat.baseProperties.get("Resource")!].sort()).toEqual(["id", "implicitRules", "language", "meta"]);
    expect(cat.baseProperties.get("DomainResource")!.has("modifierExtension")).toBe(true);
    expect([...cat.baseProperties.get("Element")!].sort()).toEqual(["extension", "id"]);
    expect([...cat.baseProperties.get("BackboneElement")!].sort()).toEqual(["extension", "id", "modifierExtension"]);
  });

  it("surfaces common search params scoped to Resource/DomainResource", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [],
      searchParameters: [
        searchParam("_id", "token", ["Resource"]),
        searchParam("_tag", "token", ["Resource"]),
        searchParam("_text", "string", ["DomainResource"]),
        searchParam("name", "string", ["Patient"]),
      ],
    };
    const cat = buildSpecCatalog(spec, "r4");
    expect(cat.commonSearchParams.map((p) => `${p.code}:${p.scope}:${p.type}`).sort()).toEqual([
      "_id:Resource:token",
      "_tag:Resource:token",
      "_text:DomainResource:string",
    ]);
  });

  it("prefers DomainResource scope when a code appears at both scopes (R5 _text)", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [],
      searchParameters: [
        searchParam("_text", "string", ["Resource"]),
        searchParam("_text", "special", ["DomainResource"]),
      ],
    };
    const cat = buildSpecCatalog(spec, "r5");
    const textEntry = cat.commonSearchParams.find((p) => p.code === "_text");
    expect(textEntry?.scope).toBe("DomainResource");
    expect(textEntry?.type).toBe("special");
  });

  it("builds FHIRPath system-type map from primitives", () => {
    const spec: DownloadedSpec = {
      resourceDefinitions: [
        primitiveSD("string"),
        primitiveSD("boolean"),
        primitiveSD("dateTime"),
        primitiveSD("integer"),
      ],
      searchParameters: [],
    };
    const cat = buildSpecCatalog(spec, "r4");
    expect(cat.fhirpathSystemTypes.get("http://hl7.org/fhirpath/System.String")).toBe("string");
    expect(cat.fhirpathSystemTypes.get("http://hl7.org/fhirpath/System.Boolean")).toBe("boolean");
    expect(cat.fhirpathSystemTypes.get("http://hl7.org/fhirpath/System.DateTime")).toBe("dateTime");
    expect(cat.fhirpathSystemTypes.get("http://hl7.org/fhirpath/System.Integer")).toBe("integer");
  });
});
