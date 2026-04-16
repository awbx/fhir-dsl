import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";
import type { TestPatient } from "./test-types.js";

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

function fp() {
  return fhirpath<TestPatient>("Patient");
}

describe("expression system", () => {
  describe("where with predicate callback", () => {
    it("filters by equality", () => {
      const result = fp()
        .name.where(($this) => $this.use.eq("official"))
        .evaluate(patient);
      expect(result).toEqual([{ use: "official", family: "Smith", given: ["John", "Michael"] }]);
    });

    it("compiles predicate where", () => {
      expect(
        fp()
          .name.where(($this) => $this.use.eq("official"))
          .compile(),
      ).toBe("Patient.name.where($this.use = 'official')");
    });

    it("navigates after predicate where", () => {
      const result = fp()
        .name.where(($this) => $this.use.eq("official"))
        .family.evaluate(patient);
      expect(result).toEqual(["Smith"]);
    });

    it("backward compatible with field/value form", () => {
      const result = fp().name.where("use", "official").evaluate(patient);
      expect(result).toEqual([{ use: "official", family: "Smith", given: ["John", "Michael"] }]);
    });
  });

  describe("exists with predicate", () => {
    it("returns true when any match", () => {
      expect(
        fp()
          .name.exists(($this) => $this.use.eq("official"))
          .evaluate(patient),
      ).toEqual([true]);
    });

    it("returns false when none match", () => {
      expect(
        fp()
          .name.exists(($this) => $this.use.eq("temp"))
          .evaluate(patient),
      ).toEqual([false]);
    });

    it("compiles exists with predicate", () => {
      expect(
        fp()
          .name.exists(($this) => $this.use.eq("official"))
          .compile(),
      ).toBe("Patient.name.exists($this.use = 'official')");
    });
  });

  describe("all", () => {
    it("returns true when all match", () => {
      expect(
        fp()
          .name.all(($this) => $this.family.exists())
          .evaluate(patient),
      ).toEqual([true]);
    });

    it("returns false when not all match", () => {
      expect(
        fp()
          .name.all(($this) => $this.use.eq("official"))
          .evaluate(patient),
      ).toEqual([false]);
    });

    it("compiles all", () => {
      expect(
        fp()
          .name.all(($this) => $this.use.eq("official"))
          .compile(),
      ).toBe("Patient.name.all($this.use = 'official')");
    });
  });

  describe("select", () => {
    it("projects family names", () => {
      expect(
        fp()
          .name.select(($this) => $this.family)
          .evaluate(patient),
      ).toEqual(["Smith", "Smithy"]);
    });

    it("compiles select", () => {
      expect(
        fp()
          .name.select(($this) => $this.family)
          .compile(),
      ).toBe("Patient.name.select($this.family)");
    });
  });

  describe("comparison operators in predicates", () => {
    it("neq filters correctly", () => {
      const result = fp()
        .name.where(($this) => $this.use.neq("official"))
        .evaluate(patient);
      expect(result).toEqual([{ use: "nickname", family: "Smithy", given: ["Johnny"] }]);
    });
  });
});
