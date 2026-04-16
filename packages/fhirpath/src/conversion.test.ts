import type { Resource } from "@fhir-dsl/types";
import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";

type AnyResource = Resource;

function fp(resourceType = "Patient") {
  return fhirpath<AnyResource>(resourceType);
}

describe("conversion functions", () => {
  describe("toBoolean", () => {
    it("converts true string", () => {
      const res = { resourceType: "Patient", active: "true" };
      expect(fp().active.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts false string", () => {
      const res = { resourceType: "Patient", active: "false" };
      expect(fp().active.toBoolean().evaluate(res)).toEqual([false]);
    });

    it("converts boolean true", () => {
      const res = { resourceType: "Patient", active: true };
      expect(fp().active.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts integer 1", () => {
      const res = { resourceType: "Observation", valueInteger: 1 };
      expect(fhirpath<AnyResource>("Observation").valueInteger.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts integer 0", () => {
      const res = { resourceType: "Observation", valueInteger: 0 };
      expect(fhirpath<AnyResource>("Observation").valueInteger.toBoolean().evaluate(res)).toEqual([false]);
    });
  });

  describe("toInteger", () => {
    it("converts string to integer", () => {
      const res = { resourceType: "Patient", multipleBirthInteger: "3" };
      expect(fp().multipleBirthInteger.toInteger().evaluate(res)).toEqual([3]);
    });

    it("passes through integer", () => {
      const res = { resourceType: "Patient", multipleBirthInteger: 3 };
      expect(fp().multipleBirthInteger.toInteger().evaluate(res)).toEqual([3]);
    });

    it("converts boolean to integer", () => {
      const res = { resourceType: "Patient", active: true };
      expect(fp().active.toInteger().evaluate(res)).toEqual([1]);
    });
  });

  describe("toDecimal", () => {
    it("converts string", () => {
      const res = { resourceType: "Observation", valueString: "3.14" };
      expect(fhirpath<AnyResource>("Observation").valueString.toDecimal().evaluate(res)).toEqual([3.14]);
    });

    it("passes through number", () => {
      const res = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fhirpath<AnyResource>("Observation").valueQuantity.value.toDecimal().evaluate(res)).toEqual([120]);
    });
  });

  describe("toFhirString (FHIRPath toString)", () => {
    it("converts number to string", () => {
      const res = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fhirpath<AnyResource>("Observation").valueQuantity.value.toFhirString().evaluate(res)).toEqual(["120"]);
    });

    it("converts boolean to string", () => {
      const res = { resourceType: "Patient", active: true };
      expect(fp().active.toFhirString().evaluate(res)).toEqual(["true"]);
    });

    it("compiles as toString()", () => {
      expect(fp().active.toFhirString().compile()).toBe("Patient.active.toString()");
    });
  });

  describe("toDate", () => {
    it("extracts date from dateTime", () => {
      const res = { resourceType: "Patient", birthDate: "1990-01-15" };
      expect(fp().birthDate.toDate().evaluate(res)).toEqual(["1990-01-15"]);
    });

    it("extracts date from full ISO datetime", () => {
      const res = { resourceType: "Observation", effectiveDateTime: "2024-01-15T10:30:00Z" };
      expect(fhirpath<AnyResource>("Observation").effectiveDateTime.toDate().evaluate(res)).toEqual(["2024-01-15"]);
    });
  });

  describe("convertsTo*", () => {
    it("convertsToBoolean true for 'true'", () => {
      const res = { resourceType: "Patient", active: "true" };
      expect(fp().active.convertsToBoolean().evaluate(res)).toEqual([true]);
    });

    it("convertsToBoolean false for random string", () => {
      const res = { resourceType: "Patient", active: "maybe" };
      expect(fp().active.convertsToBoolean().evaluate(res)).toEqual([false]);
    });

    it("convertsToInteger true for '42'", () => {
      const res = { resourceType: "Patient", multipleBirthInteger: "42" };
      expect(fp().multipleBirthInteger.convertsToInteger().evaluate(res)).toEqual([true]);
    });

    it("convertsToInteger false for 'abc'", () => {
      const res = { resourceType: "Patient", multipleBirthInteger: "abc" };
      expect(fp().multipleBirthInteger.convertsToInteger().evaluate(res)).toEqual([false]);
    });

    it("convertsToString true for number", () => {
      const res = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fhirpath<AnyResource>("Observation").valueQuantity.value.convertsToString().evaluate(res)).toEqual([true]);
    });

    it("convertsToDate true for date string", () => {
      const res = { resourceType: "Patient", birthDate: "1990-01-15" };
      expect(fp().birthDate.convertsToDate().evaluate(res)).toEqual([true]);
    });
  });

  describe("compile output", () => {
    it("toBoolean", () => {
      expect(fp().active.toBoolean().compile()).toBe("Patient.active.toBoolean()");
    });

    it("toInteger", () => {
      expect(fp().active.toInteger().compile()).toBe("Patient.active.toInteger()");
    });

    it("convertsToBoolean", () => {
      expect(fp().active.convertsToBoolean().compile()).toBe("Patient.active.convertsToBoolean()");
    });

    it("toQuantity with unit", () => {
      expect(fp().active.toQuantity("mg").compile()).toBe("Patient.active.toQuantity('mg')");
    });

    it("toQuantity without unit", () => {
      expect(fp().active.toQuantity().compile()).toBe("Patient.active.toQuantity()");
    });
  });
});
