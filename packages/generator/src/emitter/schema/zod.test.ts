import { describe, expect, it } from "vitest";
import type { SchemaNode } from "./adapter.js";
import { zodAdapter } from "./zod.js";

describe("zodAdapter", () => {
  it("emits Zod library import", () => {
    expect(zodAdapter.libImport()).toBe('import { z } from "zod";');
  });

  it("emits string primitive with regex constraint", () => {
    const node: SchemaNode = { kind: "primitive", fhirType: "id" };
    const out = zodAdapter.render(node);
    expect(out).toContain("z.string()");
    expect(out).toContain(".regex(");
    expect(out).toMatch(/\[A-Za-z0-9/);
  });

  it("emits integer with min bound for positiveInt", () => {
    const node: SchemaNode = { kind: "primitive", fhirType: "positiveInt" };
    expect(zodAdapter.render(node)).toBe("z.number().int().min(1)");
  });

  it("emits boolean primitive", () => {
    expect(zodAdapter.render({ kind: "primitive", fhirType: "boolean" })).toBe("z.boolean()");
  });

  it("emits closed enum", () => {
    const node: SchemaNode = { kind: "enum", values: ["male", "female"], extensible: false };
    expect(zodAdapter.render(node)).toBe('z.enum(["male", "female"] as const)');
  });

  it("emits extensible enum as union", () => {
    const node: SchemaNode = { kind: "enum", values: ["a", "b"], extensible: true };
    expect(zodAdapter.render(node)).toBe('z.union([z.enum(["a", "b"] as const), z.string()])');
  });

  it("emits literal for resourceType discriminator", () => {
    expect(zodAdapter.render({ kind: "literal", value: "Patient" })).toBe('z.literal("Patient")');
  });

  it("emits object with optional and required fields", () => {
    const node: SchemaNode = {
      kind: "object",
      fields: [
        { name: "resourceType", schema: { kind: "literal", value: "Patient" }, optional: false },
        { name: "active", schema: { kind: "primitive", fhirType: "boolean" }, optional: true },
      ],
    };
    const out = zodAdapter.render(node);
    expect(out).toContain('resourceType: z.literal("Patient"),');
    expect(out).toContain("active: z.boolean().optional(),");
    expect(out).toContain(".catchall(z.unknown())");
  });

  it("emits array with min items for required arrays", () => {
    const node: SchemaNode = {
      kind: "array",
      inner: { kind: "primitive", fhirType: "string" },
      minItems: 1,
    };
    expect(zodAdapter.render(node)).toBe("z.array(z.string().max(1048576)).min(1)");
  });

  it("emits union of two options", () => {
    const node: SchemaNode = {
      kind: "union",
      options: [
        { kind: "primitive", fhirType: "string" },
        { kind: "primitive", fhirType: "boolean" },
      ],
    };
    const out = zodAdapter.render(node);
    expect(out).toContain("z.union([");
    expect(out).toContain("z.boolean()");
  });

  it("emits lazy reference for cross-datatype cycles", () => {
    const node: SchemaNode = { kind: "lazy", ref: "PeriodSchema" };
    expect(zodAdapter.render(node)).toBe("z.lazy((): z.ZodTypeAny => PeriodSchema)");
  });

  it("declareConst wraps in export statement", () => {
    const out = zodAdapter.declareConst("PatientSchema", {
      kind: "object",
      fields: [{ name: "id", schema: { kind: "primitive", fhirType: "id" }, optional: true }],
    });
    expect(out).toMatch(/^export const PatientSchema = z\.object/);
  });

  it("emits .superRefine wrapper for objects with invariants", () => {
    const out = zodAdapter.render({
      kind: "object",
      fields: [{ name: "name", schema: { kind: "primitive", fhirType: "string" }, optional: true }],
      invariants: [
        {
          key: "pat-1",
          severity: "error",
          human: "SHALL at least contain a contact's details",
          expression: "name.exists() or telecom.exists()",
        },
      ],
    });
    expect(out).toContain(".superRefine((value, ctx) =>");
    expect(out).toContain("validateInvariants(value,");
    expect(out).toContain('key: "pat-1"');
    expect(out).toContain("z.ZodIssueCode.custom");
  });

  it("declareExtend uses .extend({shape})", () => {
    const out = zodAdapter.declareExtend("USCorePatientSchema", "PatientSchema", [
      {
        name: "identifier",
        schema: { kind: "array", inner: { kind: "primitive", fhirType: "string" }, minItems: 1 },
        optional: false,
      },
    ]);
    expect(out).toContain("PatientSchema.extend({");
    expect(out).toContain("identifier: z.array");
    // No .catchall in the extend shape
    expect(out).not.toContain(".catchall(");
  });
});
