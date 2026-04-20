import { describe, it } from "vitest";
import type { Assert, Equals } from "./_internal/test-helpers.js";
import type { Path, PathValue } from "./path.js";
import type { Scope } from "./scope.js";

// Minimal test schema mirroring the acceptance scenario: Encounter with a
// subject reference whose canonical FHIRPath expression is `subject`.

interface HumanName {
  family?: string;
  given?: string[];
}

interface Reference<_T extends string = string> {
  reference?: string;
  type?: string;
  display?: string;
}

interface Patient {
  resourceType: "Patient";
  id?: string;
  name?: HumanName[];
  gender?: "male" | "female" | "other";
}

interface Practitioner {
  resourceType: "Practitioner";
  id?: string;
  name?: HumanName[];
}

interface Organization {
  resourceType: "Organization";
  id?: string;
  name?: string;
}

interface Encounter {
  resourceType: "Encounter";
  id?: string;
  status?: "planned" | "arrived" | "in-progress" | "finished";
  subject?: Reference<"Patient">;
  participant?: Array<{ actor?: Reference<"Practitioner"> }>;
  serviceProvider?: Reference<"Organization">;
}

interface TestSchema {
  resources: {
    Encounter: Encounter;
    Patient: Patient;
    Practitioner: Practitioner;
    Organization: Organization;
  };
  searchParams: Record<string, never>;
  includes: {
    Encounter: {
      patient: "Patient";
      practitioner: "Practitioner";
      "service-provider": "Organization";
    };
  };
  revIncludes: Record<string, never>;
  includeExpressions: {
    Encounter: {
      patient: "subject";
      practitioner: "participant.actor";
      "service-provider": "serviceProvider";
    };
  };
  profiles: Record<string, never>;
}

describe("Path (type-level)", () => {
  it("walks into nested objects", () => {
    type P = Path<{ a: { b: { c: string } } }>;
    type _ = Assert<Equals<Extract<P, "a.b.c">, "a.b.c">>;
  });

  it("requires numeric segments to index into arrays", () => {
    type P = Path<{ items: { name: string }[] }>;
    type HasUnIndexed = "items.name" extends P ? true : false;
    type _1 = Assert<Equals<HasUnIndexed, false>>;
    type _2 = Assert<Equals<Extract<P, `items.${number}.name`>, `items.${number}.name`>>;
  });

  it("distributes over unions", () => {
    type P = Path<{ x: string } | { y: number }>;
    type _1 = Assert<Equals<Extract<P, "x">, "x">>;
    type _2 = Assert<Equals<Extract<P, "y">, "y">>;
  });
});

describe("PathValue (type-level)", () => {
  it("resolves scalar fields", () => {
    type V = PathValue<{ status: "a" | "b" }, "status">;
    type _ = Assert<Equals<V, "a" | "b">>;
  });

  it("resolves through arrays with numeric segments", () => {
    type V = PathValue<{ items: Array<{ name: string }> }, `items.${number}.name`>;
    type _ = Assert<Equals<V, string>>;
  });

  it("returns never for missing paths", () => {
    type V = PathValue<{ a: string }, "b">;
    type _ = Assert<Equals<V, never>>;
  });
});

describe("Scope — include-activated substitution", () => {
  it("leaves subject as a Reference when no includes are active", () => {
    type S = Scope<TestSchema, "Encounter", Record<string, never>>;
    type SubjectT = NonNullable<S["subject"]>;
    // Subject remains a Reference (not unioned with Patient)
    type HasName = "name" extends keyof SubjectT ? true : false;
    type _ = Assert<Equals<HasName, false>>;
  });

  it("unions Patient into subject when patient is included", () => {
    type S = Scope<TestSchema, "Encounter", { patient: "Patient" }>;
    // After include, subject should include Patient fields via union
    type P = Path<S>;
    type _1 = Assert<Equals<Extract<P, "subject.reference">, "subject.reference">>;
    type _2 = Assert<Equals<Extract<P, `subject.name.${number}.family`>, `subject.name.${number}.family`>>;
    type _3 = Assert<
      Equals<Extract<P, `subject.name.${number}.given.${number}`>, `subject.name.${number}.given.${number}`>
    >;
  });

  it("handles array-flattening expressions like participant.actor", () => {
    type S = Scope<TestSchema, "Encounter", { practitioner: "Practitioner" }>;
    type P = Path<S>;
    // participant[i].actor should have Practitioner fields available
    type _ = Assert<
      Equals<
        Extract<P, `participant.${number}.actor.name.${number}.family`>,
        `participant.${number}.actor.name.${number}.family`
      >
    >;
  });

  it("handles multiple simultaneous includes", () => {
    type S = Scope<
      TestSchema,
      "Encounter",
      { patient: "Patient"; practitioner: "Practitioner"; "service-provider": "Organization" }
    >;
    type P = Path<S>;
    type _1 = Assert<Equals<Extract<P, `subject.name.${number}.family`>, `subject.name.${number}.family`>>;
    type _2 = Assert<
      Equals<
        Extract<P, `participant.${number}.actor.name.${number}.family`>,
        `participant.${number}.actor.name.${number}.family`
      >
    >;
    type _3 = Assert<Equals<Extract<P, "serviceProvider.name">, "serviceProvider.name">>;
  });

  it("preserves Reference structural fields alongside the target type", () => {
    type S = Scope<TestSchema, "Encounter", { patient: "Patient" }>;
    type P = Path<S>;
    // Both subject.reference (Reference side) and subject.name (Patient side)
    // must coexist.
    type _1 = Assert<Equals<Extract<P, "subject.reference">, "subject.reference">>;
    type _2 = Assert<Equals<Extract<P, "subject.type">, "subject.type">>;
    type _3 = Assert<Equals<Extract<P, `subject.name.${number}.family`>, `subject.name.${number}.family`>>;
  });

  it("PathValue resolves to Patient's gender enum after include", () => {
    type S = Scope<TestSchema, "Encounter", { patient: "Patient" }>;
    type V = PathValue<S, "subject.gender">;
    // The Reference.display (string | undefined) might also sneak in via
    // the union — we only care that "male" | "female" | "other" is reachable.
    type HasMale = "male" extends V ? true : false;
    type _ = Assert<Equals<HasMale, true>>;
  });
});

// Regression for Bug 1 (v0.22.0): `Scope` collapsed to `never` whenever
// `IncludeExpressions` was emitted as an `interface` — interfaces don't
// satisfy the old `Record<string, unknown>` gate on `IncludeExpressionsFor`
// (declaration merging could add incompatible fields), so the whole chain
// fell through to the `Record<string, never>` fallback, which then cascaded
// a `never` through `ApplyAll` → `ApplyOne` → `SetAtPath`.
//
// Generated schemas always emit an interface, so this is the shape we have
// to test against — the TestSchema above uses a plain object type and
// silently passed the gate.
interface InterfaceIncludeExpressions {
  Encounter: {
    patient: "subject";
    practitioner: "participant.actor";
  };
}
interface InterfaceSchema {
  resources: { Encounter: Encounter; Patient: Patient; Practitioner: Practitioner };
  searchParams: Record<string, never>;
  includes: {
    Encounter: { patient: "Patient"; practitioner: "Practitioner" };
  };
  revIncludes: Record<string, never>;
  includeExpressions: InterfaceIncludeExpressions;
  profiles: Record<string, never>;
}

describe("Scope — interface-shaped IncludeExpressions (Bug 1 regression)", () => {
  it("does not collapse to never on empty IncMap", () => {
    type S = Scope<InterfaceSchema, "Encounter", Record<string, never>>;
    type P = Path<S>;
    type _ = Assert<Equals<Extract<P, "id">, "id">>;
  });

  it("activates reference paths when include is present", () => {
    type S = Scope<InterfaceSchema, "Encounter", { patient: "Patient" }>;
    type P = Path<S>;
    type _1 = Assert<Equals<Extract<P, "id">, "id">>;
    type _2 = Assert<Equals<Extract<P, "subject.reference">, "subject.reference">>;
    type _3 = Assert<Equals<Extract<P, `subject.name.${number}.family`>, `subject.name.${number}.family`>>;
  });

  it("no-ops when IncMap keys aren't in ExprMap", () => {
    type S = Scope<InterfaceSchema, "Encounter", { foo: "Bar" }>;
    type P = Path<S>;
    // Still resolves to plain Encounter — no crash, no widening
    type _ = Assert<Equals<Extract<P, "id">, "id">>;
  });

  it("short-circuits to base resource when IncMap is `any` (wildcard builders)", () => {
    type S = Scope<InterfaceSchema, "Encounter", any>;
    type P = Path<S>;
    type _ = Assert<Equals<Extract<P, "id">, "id">>;
  });
});
