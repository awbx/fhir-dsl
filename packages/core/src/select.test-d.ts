import { describe, it } from "vitest";
import type { Assert, Equals } from "./_internal/test-helpers.js";
import type { ApplySelection } from "./query-builder.js";

interface Patient {
  resourceType: "Patient";
  id?: string;
  name?: string;
  birthDate?: string;
  active?: boolean;
}

describe("ApplySelection (type-level)", () => {
  it("returns the full resource when Sel is never", () => {
    type _ = Assert<Equals<ApplySelection<Patient, never>, Patient>>;
  });

  it("narrows to picked fields and preserves resourceType", () => {
    type Actual = ApplySelection<Patient, "id" | "name">;
    type Expected = { resourceType: "Patient"; id?: string; name?: string };
    type _ = Assert<Equals<Actual, Expected>>;
  });

  it("always includes resourceType even if not selected", () => {
    type Actual = ApplySelection<Patient, "id">;
    type Expected = { resourceType: "Patient"; id?: string };
    type _ = Assert<Equals<Actual, Expected>>;
  });

  it("drops fields not in the selection", () => {
    type Actual = ApplySelection<Patient, "id">;
    // birthDate and active should not be in the narrowed type
    type HasBirthDate = "birthDate" extends keyof Actual ? true : false;
    type HasActive = "active" extends keyof Actual ? true : false;
    type _1 = Assert<Equals<HasBirthDate, false>>;
    type _2 = Assert<Equals<HasActive, false>>;
  });
});
