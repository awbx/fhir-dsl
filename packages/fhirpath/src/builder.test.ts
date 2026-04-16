import type { Resource } from "@fhir-dsl/types";
import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";

// Use a flexible type for runtime-focused tests
type AnyResource = Resource;

function fp(resourceType = "Patient") {
  return fhirpath<AnyResource>(resourceType);
}

describe("fhirpath builder", () => {
  describe("compile", () => {
    it("returns resource type for root expression", () => {
      expect(fp().compile()).toBe("Patient");
    });

    it("compiles single property navigation", () => {
      expect(fp().name.compile()).toBe("Patient.name");
    });

    it("compiles nested property navigation", () => {
      expect(fp().name.family.compile()).toBe("Patient.name.family");
    });

    it("compiles deep navigation", () => {
      expect(fp("Observation").code.coding.system.compile()).toBe("Observation.code.coding.system");
    });

    it("compiles where clause", () => {
      expect(fp().name.where("use", "official").compile()).toBe("Patient.name.where(use = 'official')");
    });

    it("compiles where + further navigation", () => {
      expect(fp().name.where("use", "official").given.compile()).toBe("Patient.name.where(use = 'official').given");
    });

    it("compiles first()", () => {
      expect(fp().name.first().compile()).toBe("Patient.name.first()");
    });

    it("compiles last()", () => {
      expect(fp().name.last().compile()).toBe("Patient.name.last()");
    });

    it("compiles first() + navigation", () => {
      expect(fp().name.first().family.compile()).toBe("Patient.name.first().family");
    });

    it("compiles count()", () => {
      expect(fp().name.count().compile()).toBe("Patient.name.count()");
    });

    it("compiles exists()", () => {
      expect(fp().name.exists().compile()).toBe("Patient.name.exists()");
    });

    it("compiles empty()", () => {
      expect(fp().name.empty().compile()).toBe("Patient.name.empty()");
    });

    it("compiles chained operations", () => {
      expect(fp().name.where("use", "official").first().family.compile()).toBe(
        "Patient.name.where(use = 'official').first().family",
      );
    });
  });

  describe("toString", () => {
    it("returns the compiled path", () => {
      expect(String(fp().name.family)).toBe("Patient.name.family");
    });
  });

  describe("new function compile output", () => {
    it("compiles single()", () => {
      expect(fp().name.single().compile()).toBe("Patient.name.single()");
    });

    it("compiles tail()", () => {
      expect(fp().name.tail().compile()).toBe("Patient.name.tail()");
    });

    it("compiles skip()", () => {
      expect(fp().name.skip(2).compile()).toBe("Patient.name.skip(2)");
    });

    it("compiles take()", () => {
      expect(fp().name.take(1).compile()).toBe("Patient.name.take(1)");
    });

    it("compiles distinct()", () => {
      expect(fp().name.distinct().compile()).toBe("Patient.name.distinct()");
    });

    it("compiles isDistinct()", () => {
      expect(fp().name.isDistinct().compile()).toBe("Patient.name.isDistinct()");
    });

    it("compiles allTrue()", () => {
      expect(fp().name.allTrue().compile()).toBe("Patient.name.allTrue()");
    });

    it("compiles anyTrue()", () => {
      expect(fp().name.anyTrue().compile()).toBe("Patient.name.anyTrue()");
    });

    it("compiles allFalse()", () => {
      expect(fp().name.allFalse().compile()).toBe("Patient.name.allFalse()");
    });

    it("compiles anyFalse()", () => {
      expect(fp().name.anyFalse().compile()).toBe("Patient.name.anyFalse()");
    });

    it("compiles ofType()", () => {
      expect(fp().name.ofType("HumanName").compile()).toBe("Patient.name.ofType(HumanName)");
    });

    it("compiles children()", () => {
      expect(fp().children().compile()).toBe("Patient.children()");
    });

    it("compiles descendants()", () => {
      expect(fp().descendants().compile()).toBe("Patient.descendants()");
    });

    it("compiles trace()", () => {
      expect(fp().name.trace("debug").compile()).toBe("Patient.name.trace('debug')");
    });

    it("compiles not()", () => {
      expect(fp().active.not().compile()).toBe("Patient.active.not()");
    });

    it("compiles toFhirString as toString()", () => {
      expect(fp().active.toFhirString().compile()).toBe("Patient.active.toString()");
    });

    it("compiles convertsToBoolean()", () => {
      expect(fp().active.convertsToBoolean().compile()).toBe("Patient.active.convertsToBoolean()");
    });

    it("compiles toBoolean()", () => {
      expect(fp().active.toBoolean().compile()).toBe("Patient.active.toBoolean()");
    });

    it("compiles now()", () => {
      expect(fp().now().compile()).toBe("now()");
    });

    it("compiles today()", () => {
      expect(fp().today().compile()).toBe("today()");
    });

    it("compiles timeOfDay()", () => {
      expect(fp().timeOfDay().compile()).toBe("timeOfDay()");
    });

    it("compiles select()", () => {
      expect(
        fp()
          .name.select(($this: any) => $this.family)
          .compile(),
      ).toBe("Patient.name.select($this.family)");
    });

    it("compiles all()", () => {
      expect(
        fp()
          .name.all(($this: any) => $this.family.exists())
          .compile(),
      ).toBe("Patient.name.all($this.family.exists())");
    });

    it("compiles iif()", () => {
      expect(
        fp()
          .name.iif(
            ($this: any) => $this.use.eq("official"),
            ($this: any) => $this.family,
            ($this: any) => $this.given,
          )
          .compile(),
      ).toBe("Patient.name.iif($this.use = 'official', $this.family, $this.given)");
    });
  });

  describe("proxy safety", () => {
    it("does not throw on JSON.stringify", () => {
      const expr = fp().name;
      expect(() => JSON.stringify(expr)).not.toThrow();
    });

    it("is not a thenable", async () => {
      const expr = fp().name;
      // Should not trigger Promise resolution
      expect((expr as any).then).toBeUndefined();
    });
  });
});
