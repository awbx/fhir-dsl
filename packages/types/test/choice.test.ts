import { describe, expect, expectTypeOf, it } from "vitest";
import { type ChoiceOf, choiceOf } from "../src/choice.js";

interface FakeObservation {
  resourceType: "Observation";
  status: "final";
  valueQuantity?: { value: number; unit: string };
  valueString?: string;
  valueBoolean?: boolean;
  // Underscore sibling — must be ignored by choiceOf.
  _valueQuantity?: { id?: string };
  // Same-prefix but lowercase suffix — not a choice variant.
  values?: number[];
}

describe("choiceOf — runtime", () => {
  it("returns the active variant + key", () => {
    const obs: FakeObservation = {
      resourceType: "Observation",
      status: "final",
      valueQuantity: { value: 120, unit: "mmHg" },
    };
    const v = choiceOf(obs, "value");
    expect(v).toEqual({
      key: "valueQuantity",
      value: { value: 120, unit: "mmHg" },
    });
  });

  it("returns undefined when no variant is set", () => {
    const obs: FakeObservation = { resourceType: "Observation", status: "final" };
    expect(choiceOf(obs, "value")).toBeUndefined();
  });

  it("skips underscore-prefixed siblings", () => {
    const obs: FakeObservation = {
      resourceType: "Observation",
      status: "final",
      _valueQuantity: { id: "ext-1" },
    };
    expect(choiceOf(obs, "value")).toBeUndefined();
  });

  it("requires uppercase suffix (rejects same-prefix lowercase fields)", () => {
    const obs: FakeObservation = {
      resourceType: "Observation",
      status: "final",
      values: [1, 2, 3],
    };
    expect(choiceOf(obs, "value")).toBeUndefined();
  });

  it("returns the first set variant when multiple are present (defensive)", () => {
    // Spec forbids two siblings, but if a non-conformant payload arrives
    // we shouldn't crash — return the first one Object.entries surfaces.
    const obs: FakeObservation = {
      resourceType: "Observation",
      status: "final",
      valueQuantity: { value: 1, unit: "x" },
      valueString: "huh",
    };
    expect(choiceOf(obs, "value")?.key).toBe("valueQuantity");
  });
});

describe("ChoiceOf — types", () => {
  it("narrows by key discriminator", () => {
    type V = ChoiceOf<FakeObservation, "value">;
    expectTypeOf<V>().toEqualTypeOf<
      | { key: "valueQuantity"; value: { value: number; unit: string } }
      | { key: "valueString"; value: string }
      | { key: "valueBoolean"; value: boolean }
    >();
  });

  it("returns ChoiceOf | undefined from choiceOf()", () => {
    const obs = {} as FakeObservation;
    const v = choiceOf(obs, "value");
    expectTypeOf(v).toEqualTypeOf<ChoiceOf<FakeObservation, "value"> | undefined>();
  });
});
