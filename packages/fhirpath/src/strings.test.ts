import type { Resource } from "@fhir-dsl/types";
import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";

type AnyResource = Resource;

const patient = {
  resourceType: "Patient",
  name: [{ use: "official", family: "Smith", given: ["John", "Michael"] }],
  birthDate: "1990-01-15",
};

function fp(resourceType = "Patient") {
  return fhirpath<AnyResource>(resourceType);
}

describe("string functions", () => {
  it("indexOf", () => {
    expect(fp().name.family.indexOf("mi").evaluate(patient)).toEqual([1]);
  });

  it("indexOf not found", () => {
    expect(fp().name.family.indexOf("xyz").evaluate(patient)).toEqual([-1]);
  });

  it("substring with start", () => {
    expect(fp().name.family.substring(2).evaluate(patient)).toEqual(["ith"]);
  });

  it("substring with start and length", () => {
    expect(fp().name.family.substring(0, 3).evaluate(patient)).toEqual(["Smi"]);
  });

  it("startsWith", () => {
    expect(fp().name.family.startsWith("Sm").evaluate(patient)).toEqual([true]);
  });

  it("startsWith false", () => {
    expect(fp().name.family.startsWith("Jo").evaluate(patient)).toEqual([false]);
  });

  it("endsWith", () => {
    expect(fp().name.family.endsWith("th").evaluate(patient)).toEqual([true]);
  });

  it("contains", () => {
    expect(fp().name.family.contains("mit").evaluate(patient)).toEqual([true]);
  });

  it("contains false", () => {
    expect(fp().name.family.contains("xyz").evaluate(patient)).toEqual([false]);
  });

  it("upper", () => {
    expect(fp().name.family.upper().evaluate(patient)).toEqual(["SMITH"]);
  });

  it("lower", () => {
    expect(fp().name.family.lower().evaluate(patient)).toEqual(["smith"]);
  });

  it("replace", () => {
    expect(fp().name.family.replace("Smith", "Jones").evaluate(patient)).toEqual(["Jones"]);
  });

  it("matches", () => {
    expect(fp().name.family.matches("^S.*h$").evaluate(patient)).toEqual([true]);
  });

  it("matches false", () => {
    expect(fp().name.family.matches("^J.*$").evaluate(patient)).toEqual([false]);
  });

  it("replaceMatches", () => {
    expect(fp().name.family.replaceMatches("[aeiou]", "*").evaluate(patient)).toEqual(["Sm*th"]);
  });

  it("length", () => {
    expect(fp().name.family.length().evaluate(patient)).toEqual([5]);
  });

  it("toChars", () => {
    expect(fp().name.family.toChars().evaluate(patient)).toEqual(["S", "m", "i", "t", "h"]);
  });

  describe("compile output", () => {
    it("indexOf", () => {
      expect(fp().name.family.indexOf("mi").compile()).toBe("Patient.name.family.indexOf('mi')");
    });

    it("substring", () => {
      expect(fp().name.family.substring(0, 3).compile()).toBe("Patient.name.family.substring(0, 3)");
    });

    it("startsWith", () => {
      expect(fp().name.family.startsWith("Sm").compile()).toBe("Patient.name.family.startsWith('Sm')");
    });

    it("upper", () => {
      expect(fp().name.family.upper().compile()).toBe("Patient.name.family.upper()");
    });

    it("replace", () => {
      expect(fp().name.family.replace("a", "b").compile()).toBe("Patient.name.family.replace('a', 'b')");
    });

    it("length", () => {
      expect(fp().name.family.length().compile()).toBe("Patient.name.family.length()");
    });
  });
});
