import type { Resource } from "@fhir-dsl/types";
import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";
import type { TestObservation, TestPatient } from "./test-types.js";

interface TestFlags extends Resource {
  flags?: boolean[];
}

interface TestValues extends Resource {
  values?: number[];
}

interface TestMixed extends Resource {
  mixed?: (string | number | boolean)[];
}

interface TestNested extends Resource {
  a?: number[];
  b?: number[];
  nested?: { a?: number; b?: { c?: number } };
}

interface TestBundle extends Resource {
  entry?: Array<{ resource?: Resource }>;
}

interface TestOrganization extends Resource {
  partOf?: TestOrganization;
  name?: string;
}

const patient: TestPatient = {
  resourceType: "Patient",
  name: [
    { use: "official", family: "Smith", given: ["John", "Michael"] },
    { use: "nickname", family: "Smithy", given: ["Johnny"] },
  ],
  telecom: [
    { system: "phone", value: "555-1234" },
    { system: "email", value: "john@example.com" },
  ],
  birthDate: "1990-01-15",
  active: true,
};

const observation: TestObservation = {
  resourceType: "Observation",
  status: "final",
  code: {
    coding: [{ system: "http://loinc.org", code: "85354-9" }],
  },
  valueQuantity: { value: 120, unit: "mmHg" },
};

function fp() {
  return fhirpath<TestPatient>("Patient");
}

function fpObs() {
  return fhirpath<TestObservation>("Observation");
}

describe("fhirpath evaluator", () => {
  describe("property navigation", () => {
    it("evaluates single property", () => {
      expect(fp().name.evaluate(patient)).toEqual(patient.name);
    });

    it("evaluates nested property through array", () => {
      expect(fp().name.family.evaluate(patient)).toEqual(["Smith", "Smithy"]);
    });

    it("evaluates deeply nested array flatmap", () => {
      expect(fp().name.given.evaluate(patient)).toEqual(["John", "Michael", "Johnny"]);
    });

    it("evaluates scalar property", () => {
      expect(fp().birthDate.evaluate(patient)).toEqual(["1990-01-15"]);
    });

    it("evaluates boolean property", () => {
      expect(fp().active.evaluate(patient)).toEqual([true]);
    });

    it("returns empty array for missing property", () => {
      expect(fhirpath<TestPatient>("Patient").birthDate.evaluate({ resourceType: "Patient" })).toEqual([]);
    });

    it("returns empty array for nested missing property", () => {
      expect(fhirpath<TestPatient>("Patient").name.family.evaluate({ resourceType: "Patient" })).toEqual([]);
    });
  });

  describe("complex resource navigation", () => {
    it("navigates into nested object", () => {
      const obs: TestObservation = {
        resourceType: "Observation",
        code: { coding: [{ system: "http://loinc.org", code: "85354-9" }] },
      };
      expect(fpObs().code.coding.code.evaluate(obs)).toEqual(["85354-9"]);
    });

    it("navigates through array of objects", () => {
      expect(fpObs().code.coding.code.evaluate(observation)).toEqual(["85354-9"]);
    });
  });

  describe("where", () => {
    it("filters by field value", () => {
      const result = fp().name.where("use", "official").evaluate(patient);
      expect(result).toEqual([{ use: "official", family: "Smith", given: ["John", "Michael"] }]);
    });

    it("filters and navigates", () => {
      expect(fp().name.where("use", "official").family.evaluate(patient)).toEqual(["Smith"]);
    });

    it("filters and navigates to array", () => {
      expect(fp().name.where("use", "official").given.evaluate(patient)).toEqual(["John", "Michael"]);
    });

    it("returns empty when no match", () => {
      expect(fp().name.where("use", "temp").evaluate(patient)).toEqual([]);
    });

    it("filters telecom", () => {
      expect(fp().telecom.where("system", "phone").value.evaluate(patient)).toEqual(["555-1234"]);
    });
  });

  describe("first", () => {
    it("takes first element", () => {
      const result = fp().name.first().evaluate(patient);
      expect(result).toEqual([patient.name![0]]);
    });

    it("navigates after first", () => {
      expect(fp().name.first().family.evaluate(patient)).toEqual(["Smith"]);
    });

    it("returns empty on empty collection", () => {
      expect(fhirpath<TestPatient>("Patient").name.first().evaluate({ resourceType: "Patient" })).toEqual([]);
    });
  });

  describe("last", () => {
    it("takes last element", () => {
      const result = fp().name.last().evaluate(patient);
      expect(result).toEqual([patient.name![1]]);
    });

    it("navigates after last", () => {
      expect(fp().name.last().family.evaluate(patient)).toEqual(["Smithy"]);
    });
  });

  describe("count", () => {
    it("counts elements", () => {
      expect(fp().name.count().evaluate(patient)).toEqual([2]);
    });

    it("counts zero for missing", () => {
      expect(fhirpath<TestPatient>("Patient").name.count().evaluate({ resourceType: "Patient" })).toEqual([0]);
    });
  });

  describe("exists", () => {
    it("returns true for non-empty", () => {
      expect(fp().name.exists().evaluate(patient)).toEqual([true]);
    });

    it("returns false for missing", () => {
      expect(fhirpath<TestPatient>("Patient").name.exists().evaluate({ resourceType: "Patient" })).toEqual([false]);
    });
  });

  describe("empty", () => {
    it("returns false for non-empty", () => {
      expect(fp().name.empty().evaluate(patient)).toEqual([false]);
    });

    it("returns true for missing", () => {
      expect(fhirpath<TestPatient>("Patient").name.empty().evaluate({ resourceType: "Patient" })).toEqual([true]);
    });
  });

  describe("chained operations", () => {
    it("where + first + navigate", () => {
      expect(fp().name.where("use", "official").first().given.evaluate(patient)).toEqual(["John", "Michael"]);
    });

    it("where + count", () => {
      expect(fp().name.where("use", "official").count().evaluate(patient)).toEqual([1]);
    });
  });

  describe("allTrue / anyTrue / allFalse / anyFalse", () => {
    it("allTrue with all true", () => {
      const data: TestFlags = { resourceType: "Test", flags: [true, true, true] };
      expect(fhirpath<TestFlags>("Test").flags.allTrue().evaluate(data)).toEqual([true]);
    });

    it("allTrue with mixed", () => {
      const data: TestFlags = { resourceType: "Test", flags: [true, false, true] };
      expect(fhirpath<TestFlags>("Test").flags.allTrue().evaluate(data)).toEqual([false]);
    });

    it("anyTrue with one true", () => {
      const data: TestFlags = { resourceType: "Test", flags: [false, true, false] };
      expect(fhirpath<TestFlags>("Test").flags.anyTrue().evaluate(data)).toEqual([true]);
    });

    it("anyTrue with none true", () => {
      const data: TestFlags = { resourceType: "Test", flags: [false, false] };
      expect(fhirpath<TestFlags>("Test").flags.anyTrue().evaluate(data)).toEqual([false]);
    });

    it("allFalse with all false", () => {
      const data: TestFlags = { resourceType: "Test", flags: [false, false] };
      expect(fhirpath<TestFlags>("Test").flags.allFalse().evaluate(data)).toEqual([true]);
    });

    it("anyFalse with one false", () => {
      const data: TestFlags = { resourceType: "Test", flags: [true, false, true] };
      expect(fhirpath<TestFlags>("Test").flags.anyFalse().evaluate(data)).toEqual([true]);
    });
  });

  describe("distinct / isDistinct", () => {
    it("distinct removes duplicates", () => {
      const data: TestValues = { resourceType: "Test", values: [1, 2, 2, 3, 1] };
      expect(fhirpath<TestValues>("Test").values.distinct().evaluate(data)).toEqual([1, 2, 3]);
    });

    it("isDistinct returns false for duplicates", () => {
      const data: TestValues = { resourceType: "Test", values: [1, 2, 2] };
      expect(fhirpath<TestValues>("Test").values.isDistinct().evaluate(data)).toEqual([false]);
    });

    it("isDistinct returns true for unique", () => {
      const data: TestValues = { resourceType: "Test", values: [1, 2, 3] };
      expect(fhirpath<TestValues>("Test").values.isDistinct().evaluate(data)).toEqual([true]);
    });
  });

  describe("single", () => {
    it("returns single element", () => {
      expect(fp().name.where("use", "official").single().evaluate(patient)).toEqual([
        { use: "official", family: "Smith", given: ["John", "Michael"] },
      ]);
    });

    it("throws for multiple elements", () => {
      expect(() => fp().name.single().evaluate(patient)).toThrow("single()");
    });

    it("returns empty for no elements", () => {
      expect(fhirpath<TestPatient>("Patient").name.single().evaluate({ resourceType: "Patient" })).toEqual([]);
    });
  });

  describe("tail", () => {
    it("returns all but first", () => {
      expect(fp().name.tail().family.evaluate(patient)).toEqual(["Smithy"]);
    });

    it("returns empty for single element", () => {
      expect(fp().name.where("use", "official").tail().evaluate(patient)).toEqual([]);
    });
  });

  describe("skip / take", () => {
    it("skip 1", () => {
      expect(fp().name.skip(1).family.evaluate(patient)).toEqual(["Smithy"]);
    });

    it("take 1", () => {
      expect(fp().name.take(1).family.evaluate(patient)).toEqual(["Smith"]);
    });

    it("skip beyond length", () => {
      expect(fp().name.skip(10).evaluate(patient)).toEqual([]);
    });

    it("take 0", () => {
      expect(fp().name.take(0).evaluate(patient)).toEqual([]);
    });
  });

  describe("ofType", () => {
    it("filters by FHIR type name", () => {
      const bundle: TestBundle = {
        resourceType: "Bundle",
        entry: [
          { resource: { resourceType: "Patient", id: "1" } },
          { resource: { resourceType: "Observation", id: "2" } },
          { resource: { resourceType: "Patient", id: "3" } },
        ],
      };
      const result = fhirpath<TestBundle>("Bundle").entry.resource.ofType("Patient").evaluate(bundle);
      expect(result).toEqual([
        { resourceType: "Patient", id: "1" },
        { resourceType: "Patient", id: "3" },
      ]);
    });

    it("filters primitives by type", () => {
      const data: TestMixed = { resourceType: "Test", mixed: [1, "hello", true, 2] };
      expect(fhirpath<TestMixed>("Test").mixed.ofType("string").evaluate(data)).toEqual(["hello"]);
    });

    it("compiles ofType", () => {
      expect(fp().name.ofType("HumanName").compile()).toBe("Patient.name.ofType(HumanName)");
    });
  });

  describe("children / descendants", () => {
    it("children returns immediate children", () => {
      const data: TestNested = { resourceType: "Test", a: [1] };
      const result = fhirpath<TestNested>("Test").children().evaluate(data);
      expect(result).toContain("Test");
      expect(result).toContain(1);
    });

    it("descendants returns nested values", () => {
      const data: TestNested = { resourceType: "Test", nested: { a: 1, b: { c: 2 } } };
      const result = fhirpath<TestNested>("Test").descendants().evaluate(data);
      expect(result).toContain("Test");
      expect(result).toContain(1);
      expect(result).toContain(2);
    });
  });

  describe("union / combine", () => {
    it("union deduplicates", () => {
      const data: TestNested = { resourceType: "Test", a: [1, 2, 3], b: [2, 3, 4] };
      const exprA = fhirpath<TestNested>("Test").a;
      const result = exprA.union(fhirpath<TestNested>("Test").b).evaluate(data);
      expect(result).toEqual([1, 2, 3, 4]);
    });

    it("combine keeps duplicates", () => {
      const data: TestNested = { resourceType: "Test", a: [1, 2], b: [2, 3] };
      const exprA = fhirpath<TestNested>("Test").a;
      const result = exprA.combine(fhirpath<TestNested>("Test").b).evaluate(data);
      expect(result).toEqual([1, 2, 2, 3]);
    });
  });

  describe("trace", () => {
    it("returns input unchanged", () => {
      expect(fp().name.family.trace("debug").evaluate(patient)).toEqual(["Smith", "Smithy"]);
    });
  });

  describe("now / today / timeOfDay", () => {
    it("now returns ISO datetime string", () => {
      const result = fp().now().evaluate(patient);
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe("string");
    });

    it("today returns date string", () => {
      const result = fp().today().evaluate(patient);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("timeOfDay returns time string", () => {
      const result = fp().timeOfDay().evaluate(patient);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe("iif", () => {
    it("returns true branch when condition met", () => {
      const result = fp()
        .name.first()
        .iif(
          ($this) => $this.use.eq("official"),
          ($this) => $this.family,
          ($this) => $this.given,
        )
        .evaluate(patient);
      expect(result).toEqual(["Smith"]);
    });

    it("returns otherwise branch when condition not met", () => {
      const result = fp()
        .name.last()
        .iif(
          ($this) => $this.use.eq("official"),
          ($this) => $this.family,
          ($this) => $this.given,
        )
        .evaluate(patient);
      expect(result).toEqual(["Johnny"]);
    });

    it("returns empty when no otherwise and condition not met", () => {
      const result = fp()
        .name.last()
        .iif(
          ($this) => $this.use.eq("official"),
          ($this) => $this.family,
        )
        .evaluate(patient);
      expect(result).toEqual([]);
    });
  });

  describe("repeat", () => {
    it("recursively navigates", () => {
      const data: TestOrganization = {
        resourceType: "Organization",
        partOf: {
          resourceType: "Organization",
          partOf: {
            resourceType: "Organization",
            name: "Root Org",
          },
          name: "Middle Org",
        },
        name: "Leaf Org",
      };
      const result = fhirpath<TestOrganization>("Organization")
        .repeat(($this) => $this.partOf)
        .evaluate(data);
      expect(result).toHaveLength(2);
    });
  });
});
