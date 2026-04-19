import type { CodeableConcept, HumanName, Identifier, Reference, Resource } from "@fhir-dsl/types";
import { describe, expectTypeOf, it } from "vitest";
import { fhirpath } from "./builder.js";
import type { FhirPathExpr, IsPrimitive, NavKeys, Unwrap } from "./types.js";

// --- Mock resource types for type-level tests ---

interface TestPatient extends Resource {
  resourceType: "Patient";
  name?: HumanName[];
  birthDate?: string;
  active?: boolean;
  identifier?: Identifier[];
  managingOrganization?: Reference<"Organization">;
}

interface TestObservation extends Resource {
  resourceType: "Observation";
  status: string;
  code: CodeableConcept;
  valueQuantity?: TestQuantity;
  valueString?: string;
  component?: TestObservationComponent[];
}

interface TestQuantity {
  value?: number;
  unit?: string;
  system?: string;
}

interface TestObservationComponent {
  code: CodeableConcept;
  valueQuantity?: TestQuantity;
}

// --- Type utility tests ---

describe("type-level tests", () => {
  describe("Unwrap", () => {
    it("strips array and undefined", () => {
      expectTypeOf<Unwrap<HumanName[] | undefined>>().toEqualTypeOf<HumanName>();
    });

    it("strips undefined from non-array", () => {
      expectTypeOf<Unwrap<string | undefined>>().toEqualTypeOf<string>();
    });

    it("preserves plain type", () => {
      expectTypeOf<Unwrap<HumanName>>().toEqualTypeOf<HumanName>();
    });

    it("unwraps number", () => {
      expectTypeOf<Unwrap<number | undefined>>().toEqualTypeOf<number>();
    });
  });

  describe("IsPrimitive", () => {
    it("true for string", () => {
      expectTypeOf<IsPrimitive<string>>().toEqualTypeOf<true>();
    });

    it("true for string | undefined", () => {
      expectTypeOf<IsPrimitive<string | undefined>>().toEqualTypeOf<true>();
    });

    it("true for number", () => {
      expectTypeOf<IsPrimitive<number>>().toEqualTypeOf<true>();
    });

    it("true for boolean", () => {
      expectTypeOf<IsPrimitive<boolean>>().toEqualTypeOf<true>();
    });

    it("false for HumanName", () => {
      expectTypeOf<IsPrimitive<HumanName>>().toEqualTypeOf<false>();
    });

    it("false for HumanName[]", () => {
      expectTypeOf<IsPrimitive<HumanName[] | undefined>>().toEqualTypeOf<false>();
    });
  });

  describe("NavKeys", () => {
    it("includes own properties of unwrapped type", () => {
      type Keys = NavKeys<HumanName[] | undefined>;
      expectTypeOf<"family">().toMatchTypeOf<Keys>();
      expectTypeOf<"given">().toMatchTypeOf<Keys>();
      expectTypeOf<"use">().toMatchTypeOf<Keys>();
    });

    it("includes resource properties", () => {
      type Keys = NavKeys<TestPatient>;
      expectTypeOf<"name">().toMatchTypeOf<Keys>();
      expectTypeOf<"birthDate">().toMatchTypeOf<Keys>();
      expectTypeOf<"resourceType">().toMatchTypeOf<Keys>();
    });
  });

  describe("FhirPathExpr navigation", () => {
    it("navigates from resource to complex type", () => {
      const expr = fhirpath<TestPatient>("Patient");
      expectTypeOf(expr.name).toMatchTypeOf<FhirPathExpr<HumanName[] | undefined>>();
    });

    it("navigates through array to nested property", () => {
      const expr = fhirpath<TestPatient>("Patient");
      // name is HumanName[] | undefined, family is string | undefined on HumanName
      // After unwrap: HumanName -> family -> string | undefined
      expectTypeOf(expr.name.family.compile).toBeFunction();
    });

    it("has compile and evaluate on primitive terminal", () => {
      const expr = fhirpath<TestPatient>("Patient").birthDate;
      expectTypeOf(expr.compile).toBeFunction();
      expectTypeOf(expr.evaluate).toBeFunction();
    });

    it("where preserves the element type", () => {
      const expr = fhirpath<TestPatient>("Patient").name.where("use", "official");
      // Still navigable as HumanName
      expectTypeOf(expr.family.compile).toBeFunction();
    });

    it("first unwraps collection", () => {
      const expr = fhirpath<TestPatient>("Patient").name.first();
      expectTypeOf(expr.family.compile).toBeFunction();
    });

    it("exists returns boolean expression", () => {
      const expr = fhirpath<TestPatient>("Patient").name.exists();
      expectTypeOf(expr.compile).toBeFunction();
    });

    it("count returns number expression", () => {
      const expr = fhirpath<TestPatient>("Patient").name.count();
      expectTypeOf(expr.compile).toBeFunction();
    });

    it("navigates nested complex types", () => {
      const expr = fhirpath<TestObservation>("Observation");
      // code is CodeableConcept → has coding, text
      expectTypeOf(expr.code.text.compile).toBeFunction();
    });

    it("navigates through backbone elements", () => {
      const expr = fhirpath<TestObservation>("Observation");
      // component[].code.text
      expectTypeOf(expr.component.code.text.compile).toBeFunction();
    });

    it("navigates quantity value", () => {
      const expr = fhirpath<TestObservation>("Observation");
      expectTypeOf(expr.valueQuantity.value.compile).toBeFunction();
    });
  });

  describe("Reference<T> target-type narrowing (BUG-027)", () => {
    // The generic `T` now narrows the `type` field, giving typed references
    // a form of nominal distinction. Literals without a `type` stay
    // structurally assignable to any Reference<T>; literals with a wrong
    // `type` are rejected.
    it("literal without `type` is assignable to any Reference<T>", () => {
      const a: Reference<"Patient"> = { reference: "Patient/abc" };
      const b: Reference<"Practitioner"> = { reference: "Practitioner/xyz" };
      expectTypeOf(a).toMatchTypeOf<Reference<"Patient">>();
      expectTypeOf(b).toMatchTypeOf<Reference<"Practitioner">>();
    });

    it("matching `type` literal assigns; mismatched literal is rejected", () => {
      const ok: Reference<"Patient"> = { reference: "Patient/abc", type: "Patient" };
      // @ts-expect-error — `type: "Practitioner"` is not assignable to Reference<"Patient">.type (`"Patient"`)
      const bad: Reference<"Patient"> = { reference: "Patient/abc", type: "Practitioner" };
      void ok;
      void bad;
    });
  });
});
