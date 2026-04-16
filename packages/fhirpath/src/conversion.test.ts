import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";
import type { TestObservation, TestPatient } from "./test-types.js";

function fpPatient() {
  return fhirpath<TestPatient>("Patient");
}

function fpObs() {
  return fhirpath<TestObservation>("Observation");
}

describe("conversion functions", () => {
  describe("toBoolean", () => {
    it("converts true string", () => {
      const res: TestPatient = { resourceType: "Patient", active: "true" };
      expect(fpPatient().active.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts false string", () => {
      const res: TestPatient = { resourceType: "Patient", active: "false" };
      expect(fpPatient().active.toBoolean().evaluate(res)).toEqual([false]);
    });

    it("converts boolean true", () => {
      const res: TestPatient = { resourceType: "Patient", active: true };
      expect(fpPatient().active.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts integer 1", () => {
      const res: TestObservation = { resourceType: "Observation", valueInteger: 1 };
      expect(fpObs().valueInteger.toBoolean().evaluate(res)).toEqual([true]);
    });

    it("converts integer 0", () => {
      const res: TestObservation = { resourceType: "Observation", valueInteger: 0 };
      expect(fpObs().valueInteger.toBoolean().evaluate(res)).toEqual([false]);
    });
  });

  describe("toInteger", () => {
    it("converts string to integer", () => {
      const res: TestPatient = { resourceType: "Patient", multipleBirthInteger: "3" };
      expect(fpPatient().multipleBirthInteger.toInteger().evaluate(res)).toEqual([3]);
    });

    it("passes through integer", () => {
      const res: TestPatient = { resourceType: "Patient", multipleBirthInteger: 3 };
      expect(fpPatient().multipleBirthInteger.toInteger().evaluate(res)).toEqual([3]);
    });

    it("converts boolean to integer", () => {
      const res: TestPatient = { resourceType: "Patient", active: true };
      expect(fpPatient().active.toInteger().evaluate(res)).toEqual([1]);
    });
  });

  describe("toDecimal", () => {
    it("converts string", () => {
      const res: TestObservation = { resourceType: "Observation", valueString: "3.14" };
      expect(fpObs().valueString.toDecimal().evaluate(res)).toEqual([3.14]);
    });

    it("passes through number", () => {
      const res: TestObservation = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fpObs().valueQuantity.value.toDecimal().evaluate(res)).toEqual([120]);
    });
  });

  describe("toFhirString (FHIRPath toString)", () => {
    it("converts number to string", () => {
      const res: TestObservation = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fpObs().valueQuantity.value.toFhirString().evaluate(res)).toEqual(["120"]);
    });

    it("converts boolean to string", () => {
      const res: TestPatient = { resourceType: "Patient", active: true };
      expect(fpPatient().active.toFhirString().evaluate(res)).toEqual(["true"]);
    });

    it("compiles as toString()", () => {
      expect(fpPatient().active.toFhirString().compile()).toBe("Patient.active.toString()");
    });
  });

  describe("toDate", () => {
    it("extracts date from dateTime", () => {
      const res: TestPatient = { resourceType: "Patient", birthDate: "1990-01-15" };
      expect(fpPatient().birthDate.toDate().evaluate(res)).toEqual(["1990-01-15"]);
    });

    it("extracts date from full ISO datetime", () => {
      const res: TestObservation = { resourceType: "Observation", effectiveDateTime: "2024-01-15T10:30:00Z" };
      expect(fpObs().effectiveDateTime.toDate().evaluate(res)).toEqual(["2024-01-15"]);
    });
  });

  describe("convertsTo*", () => {
    it("convertsToBoolean true for 'true'", () => {
      const res: TestPatient = { resourceType: "Patient", active: "true" };
      expect(fpPatient().active.convertsToBoolean().evaluate(res)).toEqual([true]);
    });

    it("convertsToBoolean false for random string", () => {
      const res: TestPatient = { resourceType: "Patient", active: "maybe" };
      expect(fpPatient().active.convertsToBoolean().evaluate(res)).toEqual([false]);
    });

    it("convertsToInteger true for '42'", () => {
      const res: TestPatient = { resourceType: "Patient", multipleBirthInteger: "42" };
      expect(fpPatient().multipleBirthInteger.convertsToInteger().evaluate(res)).toEqual([true]);
    });

    it("convertsToInteger false for 'abc'", () => {
      const res: TestPatient = { resourceType: "Patient", multipleBirthInteger: "abc" };
      expect(fpPatient().multipleBirthInteger.convertsToInteger().evaluate(res)).toEqual([false]);
    });

    it("convertsToString true for number", () => {
      const res: TestObservation = { resourceType: "Observation", valueQuantity: { value: 120 } };
      expect(fpObs().valueQuantity.value.convertsToString().evaluate(res)).toEqual([true]);
    });

    it("convertsToDate true for date string", () => {
      const res: TestPatient = { resourceType: "Patient", birthDate: "1990-01-15" };
      expect(fpPatient().birthDate.convertsToDate().evaluate(res)).toEqual([true]);
    });
  });

  describe("compile output", () => {
    it("toBoolean", () => {
      expect(fpPatient().active.toBoolean().compile()).toBe("Patient.active.toBoolean()");
    });

    it("toInteger", () => {
      expect(fpPatient().active.toInteger().compile()).toBe("Patient.active.toInteger()");
    });

    it("convertsToBoolean", () => {
      expect(fpPatient().active.convertsToBoolean().compile()).toBe("Patient.active.convertsToBoolean()");
    });

    it("toQuantity with unit", () => {
      expect(fpPatient().active.toQuantity("mg").compile()).toBe("Patient.active.toQuantity('mg')");
    });

    it("toQuantity without unit", () => {
      expect(fpPatient().active.toQuantity().compile()).toBe("Patient.active.toQuantity()");
    });
  });
});
