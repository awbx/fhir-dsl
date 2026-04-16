import type { Resource } from "@fhir-dsl/types";
import { describe, expect, it } from "vitest";
import { fhirpath } from "./builder.js";

type AnyResource = Resource;

const observation = {
  resourceType: "Observation",
  valueQuantity: { value: -3.7, unit: "mmHg" },
};

function fp(resourceType = "Observation") {
  return fhirpath<AnyResource>(resourceType);
}

describe("math functions", () => {
  it("abs", () => {
    expect(fp().valueQuantity.value.abs().evaluate(observation)).toEqual([3.7]);
  });

  it("ceiling", () => {
    expect(fp().valueQuantity.value.ceiling().evaluate(observation)).toEqual([-3]);
  });

  it("floor", () => {
    expect(fp().valueQuantity.value.floor().evaluate(observation)).toEqual([-4]);
  });

  it("round default precision", () => {
    expect(fp().valueQuantity.value.round().evaluate(observation)).toEqual([-4]);
  });

  it("round with precision", () => {
    expect(fp().valueQuantity.value.round(1).evaluate(observation)).toEqual([-3.7]);
  });

  it("truncate", () => {
    expect(fp().valueQuantity.value.truncate().evaluate(observation)).toEqual([-3]);
  });

  it("sqrt on positive", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: 9 } };
    expect(fp().valueQuantity.value.sqrt().evaluate(obs)).toEqual([3]);
  });

  it("power", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: 2 } };
    expect(fp().valueQuantity.value.power(3).evaluate(obs)).toEqual([8]);
  });

  it("ln", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: Math.E } };
    expect(fp().valueQuantity.value.ln().evaluate(obs)[0]).toBeCloseTo(1);
  });

  it("log", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: 100 } };
    expect(fp().valueQuantity.value.log(10).evaluate(obs)[0]).toBeCloseTo(2);
  });

  it("exp", () => {
    const obs = { resourceType: "Observation", valueQuantity: { value: 0 } };
    expect(fp().valueQuantity.value.exp().evaluate(obs)).toEqual([1]);
  });

  it("returns empty for non-numeric", () => {
    const obs = { resourceType: "Observation", status: "final" };
    expect(fp().status.abs().evaluate(obs)).toEqual([]);
  });

  describe("compile output", () => {
    it("abs", () => {
      expect(fp().valueQuantity.value.abs().compile()).toBe("Observation.valueQuantity.value.abs()");
    });

    it("round with precision", () => {
      expect(fp().valueQuantity.value.round(2).compile()).toBe("Observation.valueQuantity.value.round(2)");
    });

    it("log", () => {
      expect(fp().valueQuantity.value.log(10).compile()).toBe("Observation.valueQuantity.value.log(10)");
    });

    it("power", () => {
      expect(fp().valueQuantity.value.power(3).compile()).toBe("Observation.valueQuantity.value.power(3)");
    });
  });
});
