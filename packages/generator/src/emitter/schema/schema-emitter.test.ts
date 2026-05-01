import { describe, expect, it } from "vitest";
import type { ResourceModel } from "../../model/resource-model.js";
import { makeFallbackMapper } from "../../spec/test-helpers.js";
import type { BindingTypeMap } from "../terminology-emitter.js";
import { nativeAdapter } from "./native.js";
import {
  emitDatatypeSchemas,
  emitResourceSchema,
  emitResourceSchemaIndex,
  emitSchemaRegistry,
  emitSchemaRootIndex,
} from "./schema-emitter.js";

const MAPPER = makeFallbackMapper();

function patientModel(): ResourceModel {
  return {
    name: "Patient",
    url: "http://hl7.org/fhir/StructureDefinition/Patient",
    kind: "resource",
    isAbstract: false,
    baseType: "DomainResource",
    properties: [
      { name: "id", types: [{ code: "id" }], isRequired: false, isArray: false, isChoiceType: false },
      {
        name: "gender",
        types: [{ code: "code" }],
        isRequired: false,
        isArray: false,
        isChoiceType: false,
        binding: { strength: "required", valueSet: "http://hl7.org/fhir/ValueSet/administrative-gender" },
      },
      {
        name: "name",
        types: [{ code: "HumanName" }],
        isRequired: false,
        isArray: true,
        isChoiceType: false,
      },
      {
        name: "contact",
        types: [{ code: "PatientContact" }],
        isRequired: false,
        isArray: true,
        isChoiceType: false,
      },
      {
        name: "deceased",
        types: [{ code: "boolean" }, { code: "dateTime" }],
        isRequired: false,
        isArray: false,
        isChoiceType: true,
      },
    ],
    backboneElements: [
      {
        name: "PatientContact",
        path: "Patient.contact",
        properties: [
          {
            name: "name",
            types: [{ code: "HumanName" }],
            isRequired: false,
            isArray: false,
            isChoiceType: false,
          },
        ],
      },
    ],
  };
}

function makeBindingMap(): BindingTypeMap {
  return new Map([["http://hl7.org/fhir/ValueSet/administrative-gender", "AdministrativeGender"]]);
}

describe("emitResourceSchema (native adapter)", () => {
  it("emits resourceType literal and required fields", () => {
    const out = emitResourceSchema(patientModel(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
      bindingTypeMap: makeBindingMap(),
    });
    expect(out).toContain('import * as s from "../__runtime.js";');
    expect(out).toContain('resourceType: { schema: s.literal("Patient"), optional: false }');
  });

  it("emits backbone element schemas before the main schema", () => {
    const out = emitResourceSchema(patientModel(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
      bindingTypeMap: makeBindingMap(),
    });
    const backboneIdx = out.indexOf("export const PatientContactSchema");
    const mainIdx = out.indexOf("export const PatientSchema");
    expect(backboneIdx).toBeGreaterThan(-1);
    expect(mainIdx).toBeGreaterThan(backboneIdx);
    // Main resource refers to backbone schema directly (not lazy)
    expect(out).toContain("contact: { schema: s.array(PatientContactSchema)");
  });

  it("imports bound terminology and uses enum ref for required code binding", () => {
    const out = emitResourceSchema(patientModel(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
      bindingTypeMap: makeBindingMap(),
    });
    expect(out).toContain('import { AdministrativeGenderSchema } from "../terminology.js";');
    expect(out).toContain("gender: { schema: AdministrativeGenderSchema, optional: true }");
  });

  it("imports cross-type datatypes from ../datatypes.js", () => {
    const out = emitResourceSchema(patientModel(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
    });
    expect(out).toContain('import { HumanNameSchema } from "../datatypes.js";');
  });

  it("wraps required arrays with minItems=1 via s.array(inner, 1)", () => {
    const model: ResourceModel = {
      name: "Foo",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "tag",
          types: [{ code: "string" }],
          isRequired: true,
          isArray: true,
          isChoiceType: false,
        },
      ],
      backboneElements: [],
    };
    const out = emitResourceSchema(model, nativeAdapter, { mapper: MAPPER, importedDatatypes: new Set() });
    expect(out).toMatch(/tag: \{ schema: s\.array\(s\.string\(.*?\), 1\), optional: false \}/);
  });

  it("emits s.union for choice types", () => {
    const out = emitResourceSchema(patientModel(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
    });
    expect(out).toContain("s.union([");
    // both arms present
    expect(out).toContain("s.boolean()");
  });

  it("extensible binding widens code enum to include plain string", () => {
    const model: ResourceModel = {
      name: "Foo",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "kind",
          types: [{ code: "code" }],
          isRequired: false,
          isArray: false,
          isChoiceType: false,
          binding: { strength: "extensible", valueSet: "http://example.org/vs/kinds" },
        },
      ],
      backboneElements: [],
    };
    const map: BindingTypeMap = new Map([["http://example.org/vs/kinds", "Kinds"]]);
    const out = emitResourceSchema(model, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
      bindingTypeMap: map,
    });
    expect(out).toContain("s.union([");
    expect(out).toContain("KindsSchema");
    // union arm with plain fhir string for open-world values
    expect(out).toContain("s.string(");
  });

  it("strictExtensible forces extensible bindings to be closed", () => {
    const model: ResourceModel = {
      name: "Foo",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "kind",
          types: [{ code: "code" }],
          isRequired: false,
          isArray: false,
          isChoiceType: false,
          binding: { strength: "extensible", valueSet: "http://example.org/vs/kinds" },
        },
      ],
      backboneElements: [],
    };
    const map: BindingTypeMap = new Map([["http://example.org/vs/kinds", "Kinds"]]);
    const out = emitResourceSchema(model, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
      bindingTypeMap: map,
      strictExtensible: true,
    });
    expect(out).toContain("kind: { schema: KindsSchema, optional: true }");
    expect(out).not.toContain("s.union(");
  });

  it("Coding binding emits inline object with bound code field", () => {
    const model: ResourceModel = {
      name: "Foo",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "tag",
          types: [{ code: "Coding" }],
          isRequired: false,
          isArray: false,
          isChoiceType: false,
          binding: { strength: "required", valueSet: "http://example.org/vs/tags" },
        },
      ],
      backboneElements: [],
    };
    const map: BindingTypeMap = new Map([["http://example.org/vs/tags", "Tags"]]);
    const out = emitResourceSchema(model, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
      bindingTypeMap: map,
    });
    expect(out).toContain("tag: { schema: s.object({");
    expect(out).toContain("code: { schema: TagsSchema, optional: true }");
  });

  it("CodeableConcept binding emits coding array with bound code", () => {
    const model: ResourceModel = {
      name: "Foo",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "category",
          types: [{ code: "CodeableConcept" }],
          isRequired: false,
          isArray: false,
          isChoiceType: false,
          binding: { strength: "required", valueSet: "http://example.org/vs/cats" },
        },
      ],
      backboneElements: [],
    };
    const map: BindingTypeMap = new Map([["http://example.org/vs/cats", "Cats"]]);
    const out = emitResourceSchema(model, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
      bindingTypeMap: map,
    });
    expect(out).toContain("coding: { schema: s.array(");
    expect(out).toContain("code: { schema: CatsSchema, optional: true }");
  });
});

describe("emitResourceSchema invariants", () => {
  function patientWithInvariants(): ResourceModel {
    return {
      name: "Patient",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [],
      backboneElements: [
        {
          name: "PatientContact",
          path: "Patient.contact",
          properties: [
            {
              name: "name",
              types: [{ code: "HumanName" }],
              isRequired: false,
              isArray: false,
              isChoiceType: false,
            },
          ],
          invariants: [
            {
              key: "pat-1",
              severity: "error",
              human: "SHALL at least contain a contact's details or a reference to an organization",
              expression: "name.exists() or telecom.exists() or address.exists() or organization.exists()",
            },
          ],
        },
      ],
      invariants: [
        {
          key: "test-root",
          severity: "warning",
          human: "root warning",
          expression: "true",
        },
      ],
    };
  }

  it("emits s.refine wrapping objects that have invariants", () => {
    const out = emitResourceSchema(patientWithInvariants(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
    });
    expect(out).toContain('import { validateInvariants } from "@fhir-dsl/fhirpath";');
    expect(out).toContain("s.refine(");
    expect(out).toContain('key: "pat-1"');
    expect(out).toContain('severity: "error"');
    expect(out).toContain(
      'expression: "name.exists() or telecom.exists() or address.exists() or organization.exists()"',
    );
    // Root-level warning invariant is emitted alongside the main schema.
    expect(out).toContain('key: "test-root"');
  });

  it("does NOT add invariant import when no invariants present", () => {
    const plain: ResourceModel = {
      name: "Plain",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [],
      backboneElements: [],
    };
    const out = emitResourceSchema(plain, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
    });
    expect(out).not.toContain("validateInvariants");
    expect(out).not.toContain("s.refine");
  });

  it("wraps a per-property schema in s.refine when the property has invariants", () => {
    const model: ResourceModel = {
      name: "Profiled",
      url: "x",
      kind: "resource",
      isAbstract: false,
      properties: [
        {
          name: "value",
          types: [{ code: "string" }],
          isRequired: false,
          isArray: false,
          isChoiceType: false,
          invariants: [
            {
              key: "us-core-1",
              severity: "error",
              human: "Value must look like an identifier",
              expression: "matches('^[A-Z0-9]+$')",
            },
          ],
        },
      ],
      backboneElements: [],
    };
    const out = emitResourceSchema(model, nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(),
    });
    expect(out).toContain("validateInvariants");
    expect(out).toContain("s.refine(");
    expect(out).toContain('key: "us-core-1"');
    // The property field still references the refined schema.
    expect(out).toMatch(/value:\s*\{\s*schema:\s*s\.refine\(/);
  });

  it("invariants: false opt-out strips constraints from emitted output", () => {
    const out = emitResourceSchema(patientWithInvariants(), nativeAdapter, {
      mapper: MAPPER,
      importedDatatypes: new Set(["HumanName"]),
      invariants: false,
    });
    expect(out).not.toContain("validateInvariants");
    expect(out).not.toContain("s.refine");
    expect(out).not.toContain("pat-1");
  });
});

describe("emitDatatypeSchemas", () => {
  it("wraps cross-type references in s.lazy to tolerate declaration order", () => {
    const humanName: ResourceModel = {
      name: "HumanName",
      url: "x",
      kind: "complex-type",
      isAbstract: false,
      properties: [
        { name: "period", types: [{ code: "Period" }], isRequired: false, isArray: false, isChoiceType: false },
      ],
      backboneElements: [],
    };
    const period: ResourceModel = {
      name: "Period",
      url: "x",
      kind: "complex-type",
      isAbstract: false,
      properties: [
        { name: "start", types: [{ code: "dateTime" }], isRequired: false, isArray: false, isChoiceType: false },
      ],
      backboneElements: [],
    };
    const out = emitDatatypeSchemas([humanName, period], nativeAdapter, { mapper: MAPPER });
    expect(out).toContain("export const HumanNameSchema: StandardSchema<unknown> = s.object({");
    expect(out).toContain("export const PeriodSchema: StandardSchema<unknown> = s.object({");
    expect(out).toContain("s.lazy(() => PeriodSchema)");
  });

  it("sorts datatype declarations alphabetically", () => {
    const a: ResourceModel = {
      name: "Apple",
      url: "x",
      kind: "complex-type",
      isAbstract: false,
      properties: [],
      backboneElements: [],
    };
    const b: ResourceModel = {
      name: "Banana",
      url: "x",
      kind: "complex-type",
      isAbstract: false,
      properties: [],
      backboneElements: [],
    };
    const out = emitDatatypeSchemas([b, a], nativeAdapter, { mapper: MAPPER });
    expect(out.indexOf("AppleSchema")).toBeLessThan(out.indexOf("BananaSchema"));
  });
});

describe("emitResourceSchemaIndex", () => {
  it("re-exports each resource schema in alpha order", () => {
    const models = [{ name: "Patient" } as ResourceModel, { name: "Observation" } as ResourceModel];
    const out = emitResourceSchemaIndex(models);
    expect(out).toBe('export * from "./observation.schema.js";\nexport * from "./patient.schema.js";\n');
  });
});

describe("emitSchemaRootIndex", () => {
  it("includes terminology and profiles conditionally", () => {
    const both = emitSchemaRootIndex(true, true);
    expect(both).toContain("./datatypes.js");
    expect(both).toContain("./resources/index.js");
    expect(both).toContain("./terminology.js");
    expect(both).toContain("./profiles/index.js");
    expect(both).toContain("./schema-registry.js");

    const neither = emitSchemaRootIndex(false, false);
    expect(neither).not.toContain("terminology");
    expect(neither).not.toContain("profiles");
    expect(neither).toContain("./schema-registry.js");
  });
});

describe("emitSchemaRegistry", () => {
  it("emits a SchemaRegistry const indexing every resource and optionally profiles", () => {
    const resources = [{ name: "Patient" } as ResourceModel, { name: "Observation" } as ResourceModel];

    const withoutProfiles = emitSchemaRegistry(resources, false);
    expect(withoutProfiles).toContain('import { ObservationSchema } from "./resources/observation.schema.js";');
    expect(withoutProfiles).toContain('import { PatientSchema } from "./resources/patient.schema.js";');
    expect(withoutProfiles).not.toContain("ProfileSchemaRegistry");
    expect(withoutProfiles).toContain("export const SchemaRegistry = {");
    expect(withoutProfiles).toContain("resources: {");
    expect(withoutProfiles).toContain("Patient: PatientSchema");
    expect(withoutProfiles).toContain("Observation: ObservationSchema");
    expect(withoutProfiles).toContain("} as const;");

    const withProfiles = emitSchemaRegistry(resources, true);
    expect(withProfiles).toContain('import { ProfileSchemaRegistry } from "./profiles/profile-schema-registry.js";');
    expect(withProfiles).toContain("profiles: ProfileSchemaRegistry,");
  });
});
