import { describe, expect, it } from "vitest";
import { resolveType, resolveTypesUnion } from "./type-resolver.js";

describe("resolveType", () => {
  it("resolves primitive types", () => {
    const result = resolveType({ code: "string" });
    expect(result.tsType).toBe("FhirString");
    expect(result.importFrom).toBe("primitives");
  });

  it("resolves complex types", () => {
    const result = resolveType({ code: "HumanName" });
    expect(result.tsType).toBe("HumanName");
    expect(result.importFrom).toBe("datatypes");
  });

  it("resolves Reference without targets", () => {
    const result = resolveType({ code: "Reference" });
    expect(result.tsType).toBe("Reference");
    expect(result.importFrom).toBe("datatypes");
  });

  it("resolves Reference with target profiles", () => {
    const result = resolveType({ code: "Reference", targetProfiles: ["Patient", "Practitioner"] });
    expect(result.tsType).toBe('Reference<"Patient" | "Practitioner">');
    expect(result.importFrom).toBe("datatypes");
  });

  it("resolves unknown types as resource imports", () => {
    const result = resolveType({ code: "Observation" });
    expect(result.tsType).toBe("Observation");
    expect(result.importFrom).toBe("resources");
  });

  it("resolves date primitive", () => {
    const result = resolveType({ code: "dateTime" });
    expect(result.tsType).toBe("FhirDateTime");
    expect(result.importFrom).toBe("primitives");
  });

  it("resolves CodeableConcept", () => {
    const result = resolveType({ code: "CodeableConcept" });
    expect(result.tsType).toBe("CodeableConcept");
    expect(result.importFrom).toBe("datatypes");
  });
});

describe("resolveTypesUnion", () => {
  it("resolves single type", () => {
    const { tsType } = resolveTypesUnion([{ code: "string" }]);
    expect(tsType).toBe("FhirString");
  });

  it("resolves union of types", () => {
    const { tsType } = resolveTypesUnion([{ code: "string" }, { code: "Quantity" }]);
    expect(tsType).toBe("FhirString | Quantity");
  });

  it("returns all resolved types", () => {
    const { resolvedTypes } = resolveTypesUnion([{ code: "string" }, { code: "CodeableConcept" }]);
    expect(resolvedTypes).toHaveLength(2);
    expect(resolvedTypes[0]!.importFrom).toBe("primitives");
    expect(resolvedTypes[1]!.importFrom).toBe("datatypes");
  });
});
