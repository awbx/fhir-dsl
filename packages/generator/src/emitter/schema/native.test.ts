import { describe, expect, it } from "vitest";
import type { SchemaNode } from "./adapter.js";
import { nativeAdapter } from "./native.js";

describe("nativeAdapter", () => {
  it("emits runtime import", () => {
    expect(nativeAdapter.libImport()).toBe('import * as s from "./__runtime.js";');
  });

  it("emits s.boolean() for boolean primitive", () => {
    expect(nativeAdapter.render({ kind: "primitive", fhirType: "boolean" })).toBe("s.boolean()");
  });

  it("emits s.number() with int + min for positiveInt", () => {
    expect(nativeAdapter.render({ kind: "primitive", fhirType: "positiveInt" })).toBe(
      "s.number({ int: true, min: 1 })",
    );
  });

  it("emits s.string() with regex for id", () => {
    const out = nativeAdapter.render({ kind: "primitive", fhirType: "id" });
    expect(out).toContain("s.string(");
    expect(out).toContain("regex:");
  });

  it("emits s.literal() for literal nodes", () => {
    expect(nativeAdapter.render({ kind: "literal", value: "Patient" })).toBe('s.literal("Patient")');
  });

  it("emits s.enum() closed for non-extensible", () => {
    const node: SchemaNode = { kind: "enum", values: ["male", "female"], extensible: false };
    expect(nativeAdapter.render(node)).toBe('s.enum(["male", "female"] as const)');
  });

  it("emits s.enum() extensible with true flag", () => {
    const node: SchemaNode = { kind: "enum", values: ["a", "b"], extensible: true };
    expect(nativeAdapter.render(node)).toBe('s.enum(["a", "b"] as const, true)');
  });

  it("emits s.array() with minItems when required", () => {
    const node: SchemaNode = {
      kind: "array",
      inner: { kind: "primitive", fhirType: "boolean" },
      minItems: 1,
    };
    expect(nativeAdapter.render(node)).toBe("s.array(s.boolean(), 1)");
  });

  it("emits s.array() without count for optional arrays", () => {
    const node: SchemaNode = { kind: "array", inner: { kind: "primitive", fhirType: "boolean" } };
    expect(nativeAdapter.render(node)).toBe("s.array(s.boolean())");
  });

  it("emits s.union() for multi-option unions", () => {
    const node: SchemaNode = {
      kind: "union",
      options: [
        { kind: "primitive", fhirType: "string" },
        { kind: "primitive", fhirType: "boolean" },
      ],
    };
    const out = nativeAdapter.render(node);
    expect(out).toContain("s.union([");
    expect(out).toContain("s.boolean()");
  });

  it("collapses single-option union to inner", () => {
    const node: SchemaNode = { kind: "union", options: [{ kind: "primitive", fhirType: "boolean" }] };
    expect(nativeAdapter.render(node)).toBe("s.boolean()");
  });

  it("emits s.lazy(() => Ref) for cyclic refs", () => {
    expect(nativeAdapter.render({ kind: "lazy", ref: "PeriodSchema" })).toBe("s.lazy(() => PeriodSchema)");
  });

  it("emits bare ref for non-cyclic references", () => {
    expect(nativeAdapter.render({ kind: "ref", name: "HumanNameSchema" })).toBe("HumanNameSchema");
  });

  it("object emits optional flag per field", () => {
    const node: SchemaNode = {
      kind: "object",
      fields: [
        { name: "resourceType", schema: { kind: "literal", value: "Patient" }, optional: false },
        { name: "active", schema: { kind: "primitive", fhirType: "boolean" }, optional: true },
      ],
    };
    const out = nativeAdapter.render(node);
    expect(out).toContain('resourceType: { schema: s.literal("Patient"), optional: false }');
    expect(out).toContain("active: { schema: s.boolean(), optional: true }");
  });

  it("quotes field names that aren't valid identifiers", () => {
    const node: SchemaNode = {
      kind: "object",
      fields: [{ name: "_id", schema: { kind: "primitive", fhirType: "string" }, optional: true }],
    };
    // underscore is a valid identifier, should not be quoted
    expect(nativeAdapter.render(node)).toContain("_id: { schema:");

    const node2: SchemaNode = {
      kind: "object",
      fields: [{ name: "1bad", schema: { kind: "primitive", fhirType: "string" }, optional: true }],
    };
    expect(nativeAdapter.render(node2)).toContain('"1bad": { schema:');
  });

  it("declareConst wraps in export", () => {
    const out = nativeAdapter.declareConst("PatientSchema", { kind: "primitive", fhirType: "boolean" });
    expect(out).toBe("export const PatientSchema = s.boolean();");
  });

  it("declareExtend uses s.extend() helper", () => {
    const out = nativeAdapter.declareExtend("USCorePatientSchema", "PatientSchema", [
      {
        name: "identifier",
        schema: { kind: "array", inner: { kind: "primitive", fhirType: "string" }, minItems: 1 },
        optional: false,
      },
    ]);
    expect(out).toContain("export const USCorePatientSchema = s.extend(PatientSchema, {");
    expect(out).toContain("identifier: { schema: s.array(s.string({ maxLength: 1048576 }), 1), optional: false }");
  });

  it("declareExtend with no added fields re-exports base", () => {
    const out = nativeAdapter.declareExtend("USCorePatientSchema", "PatientSchema", []);
    expect(out).toBe("export const USCorePatientSchema = PatientSchema;");
  });

  it("runtimeFile returns __runtime.ts with runtime source", () => {
    const file = nativeAdapter.runtimeFile?.();
    expect(file).toBeTruthy();
    expect(file?.filename).toBe("__runtime.ts");
    expect(file?.source).toContain('vendor: "fhir-dsl"');
    expect(file?.source).toContain("export function object");
    expect(file?.source).toContain("export function extend");
  });
});
