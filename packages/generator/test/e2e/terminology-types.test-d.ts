/**
 * Type-level tests for the Terminology Engine.
 *
 * These tests run only under `tsc` (via Vitest's `typecheck` mode). They have
 * no runtime assertions — the value they provide is that they fail compilation
 * when the generated types drift from what the product promises.
 *
 * Imports target the checked-in "golden" bundle at
 * `packages/generator/test/fixtures/generated-golden/` so these tests run
 * without needing the pipeline to execute first. The pipeline e2e test
 * regenerates into a temp dir and asserts strings; this file proves those
 * strings actually produce the constraint semantics we claim.
 */

import type { SearchParamFor } from "@fhir-dsl/core";
import { describe, expectTypeOf, it } from "vitest";
import { createClient, type GeneratedSchema } from "../fixtures/generated-golden/r4/client.js";
import type { Condition } from "../fixtures/generated-golden/r4/resources/condition.js";
import type { Encounter } from "../fixtures/generated-golden/r4/resources/encounter.js";
import type { MedicationRequest } from "../fixtures/generated-golden/r4/resources/medication-request.js";
import type { Observation } from "../fixtures/generated-golden/r4/resources/observation.js";
import type { Patient } from "../fixtures/generated-golden/r4/resources/patient.js";
import type { Specimen } from "../fixtures/generated-golden/r4/resources/specimen.js";
import type {
  AdministrativeGender,
  ConditionClinicalStatusCodes,
  ObservationCategoryCodes,
  ObservationStatus,
} from "../fixtures/generated-golden/r4/terminology/valuesets.js";

// ========================================================================
// Required bindings on `code` → FhirCode<ClosedUnion>
// ========================================================================

describe("required bindings on FhirCode", () => {
  it("narrows Patient.gender to the AdministrativeGender union", () => {
    type Gender = NonNullable<Patient["gender"]>;
    expectTypeOf<Gender>().toEqualTypeOf<"male" | "female" | "other" | "unknown">();
  });

  it("AdministrativeGender is the canonical closed union", () => {
    expectTypeOf<AdministrativeGender>().toEqualTypeOf<"male" | "female" | "other" | "unknown">();
  });

  it("narrows Observation.status to the ObservationStatus union", () => {
    type Status = Observation["status"];
    expectTypeOf<Status>().toEqualTypeOf<
      "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown"
    >();
  });

  it("Patient.gender key is optional", () => {
    // "gender" is an optional key on Patient — this proves the field survives
    // the terminology parameterization (it would disappear if something went wrong).
    expectTypeOf<Patient>().toHaveProperty("gender");
  });

  it("accepts a valid AdministrativeGender literal", () => {
    const p: Patient = { resourceType: "Patient", gender: "female" };
    expectTypeOf(p).toExtend<Patient>();
  });

  it("rejects an invalid AdministrativeGender literal", () => {
    // @ts-expect-error — "banana" is not a valid AdministrativeGender
    const _p: Patient = { resourceType: "Patient", gender: "banana" };
    void _p;
  });

  it("rejects an invalid ObservationStatus literal", () => {
    const _o: Observation = {
      resourceType: "Observation",
      // @ts-expect-error — "forged" is not a valid ObservationStatus
      status: "forged",
      code: {},
    };
    void _o;
  });

  it("accepts all four AdministrativeGender values", () => {
    const a: Patient = { resourceType: "Patient", gender: "male" };
    const b: Patient = { resourceType: "Patient", gender: "female" };
    const c: Patient = { resourceType: "Patient", gender: "other" };
    const d: Patient = { resourceType: "Patient", gender: "unknown" };
    expectTypeOf(a).toExtend<Patient>();
    expectTypeOf(b).toExtend<Patient>();
    expectTypeOf(c).toExtend<Patient>();
    expectTypeOf(d).toExtend<Patient>();
  });
});

// ========================================================================
// Required bindings on CodeableConcept → CodeableConcept<ClosedUnion>
// ========================================================================

describe("required bindings on CodeableConcept", () => {
  it("narrows Observation.category coding.code to ObservationCategoryCodes", () => {
    type Cat = NonNullable<Observation["category"]>[number];
    type CodingCode = NonNullable<NonNullable<Cat["coding"]>[number]["code"]>;
    expectTypeOf<CodingCode>().toEqualTypeOf<ObservationCategoryCodes>();
  });

  it("accepts valid category code", () => {
    const o: Observation = {
      resourceType: "Observation",
      status: "final",
      code: {},
      category: [{ coding: [{ code: "vital-signs" }] }],
    };
    expectTypeOf(o).toExtend<Observation>();
  });

  it("rejects invalid category code", () => {
    const _o: Observation = {
      resourceType: "Observation",
      status: "final",
      code: {},
      // @ts-expect-error — "spaceship" is not a valid ObservationCategoryCodes
      category: [{ coding: [{ code: "spaceship" }] }],
    };
    void _o;
  });
});

// ========================================================================
// Extensible bindings — closed union OR arbitrary string
// ========================================================================

describe("extensible bindings", () => {
  it("Condition.clinicalStatus coding code accepts any string (extensible)", () => {
    type Status = NonNullable<Condition["clinicalStatus"]>;
    type Code = NonNullable<NonNullable<Status["coding"]>[number]["code"]>;
    // Extensible bindings resolve to `Known | (string & {})` which collapses to `string`
    // at the type level but still triggers autocomplete for the known codes.
    expectTypeOf<Code>().toExtend<string>();
  });

  it("accepts known clinicalStatus codes", () => {
    const c: Condition = {
      resourceType: "Condition",
      subject: { reference: "Patient/123" },
      clinicalStatus: { coding: [{ code: "active" }] },
    };
    expectTypeOf(c).toExtend<Condition>();
  });

  it("accepts arbitrary strings on extensible bindings (non-known codes)", () => {
    // This is the critical difference between required and extensible: a random
    // string must still be assignable when the binding is extensible.
    const c: Condition = {
      resourceType: "Condition",
      subject: { reference: "Patient/456" },
      clinicalStatus: { coding: [{ code: "some-custom-code-from-another-system" }] },
    };
    expectTypeOf(c).toExtend<Condition>();
  });
});

// ========================================================================
// Preferred / example bindings — no constraint
// ========================================================================

describe("preferred/example bindings", () => {
  it("Encounter.priority is plain CodeableConcept (preferred, no constraint)", () => {
    const e: Encounter = {
      resourceType: "Encounter",
      priority: { coding: [{ code: "anything-goes" }] },
    };
    expectTypeOf(e).toExtend<Encounter>();
  });

  it("Specimen.type is plain CodeableConcept (example, no constraint)", () => {
    const s: Specimen = {
      resourceType: "Specimen",
      type: { coding: [{ code: "whatever" }] },
    };
    expectTypeOf(s).toExtend<Specimen>();
  });
});

// ========================================================================
// Unresolvable binding — fallback to plain type
// ========================================================================

describe("unresolvable binding fallback", () => {
  it("MedicationRequest.medicationCodeableConcept accepts any string", () => {
    // The SNOMED filter can't be resolved offline — the generator correctly
    // falls back to unparameterized CodeableConcept so users aren't locked out.
    const m: MedicationRequest = {
      resourceType: "MedicationRequest",
      subject: { reference: "Patient/1" },
      medicationCodeableConcept: { coding: [{ code: "any-snomed-code-123" }] },
    };
    expectTypeOf(m).toExtend<MedicationRequest>();
  });
});

// ========================================================================
// Search param terminology flow
// ========================================================================

describe("search-param terminology", () => {
  it("Patient.gender search param narrows value to AdministrativeGender", () => {
    type GenderParam = SearchParamFor<GeneratedSchema, "Patient">["gender"];
    type Value = GenderParam extends { value: infer V } ? V : never;
    expectTypeOf<Value>().toEqualTypeOf<AdministrativeGender>();
  });

  it("Observation.status search param narrows value to ObservationStatus", () => {
    type StatusParam = SearchParamFor<GeneratedSchema, "Observation">["status"];
    type Value = StatusParam extends { value: infer V } ? V : never;
    expectTypeOf<Value>().toEqualTypeOf<ObservationStatus>();
  });

  it("where() accepts valid terminology value", () => {
    const client = createClient({ baseUrl: "http://example.com/fhir" });
    const q = client.search("Patient").where("gender", "eq", "male");
    expectTypeOf(q).not.toBeAny();
  });

  it("where() rejects invalid terminology value", () => {
    const client = createClient({ baseUrl: "http://example.com/fhir" });
    // @ts-expect-error — "banana" is not assignable to AdministrativeGender
    client.search("Patient").where("gender", "eq", "banana");
  });

  it("where() accepts all four AdministrativeGender values", () => {
    const client = createClient({ baseUrl: "http://example.com/fhir" });
    client.search("Patient").where("gender", "eq", "male");
    client.search("Patient").where("gender", "eq", "female");
    client.search("Patient").where("gender", "eq", "other");
    client.search("Patient").where("gender", "eq", "unknown");
  });

  it("where() rejects invalid ObservationStatus", () => {
    const client = createClient({ baseUrl: "http://example.com/fhir" });
    // @ts-expect-error — "banana" is not a valid ObservationStatus
    client.search("Observation").where("status", "eq", "banana");
  });

  it("where() on non-bound string param accepts any string", () => {
    const client = createClient({ baseUrl: "http://example.com/fhir" });
    const q = client.search("Patient").where("name", "eq", "Smith");
    expectTypeOf(q).not.toBeAny();
  });
});

// ========================================================================
// Terminology union identity — regression guard
// ========================================================================

describe("terminology union shapes", () => {
  it("ObservationStatus has exactly 8 members", () => {
    expectTypeOf<ObservationStatus>().toEqualTypeOf<
      "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown"
    >();
  });

  it("ConditionClinicalStatusCodes has exactly 6 members", () => {
    expectTypeOf<ConditionClinicalStatusCodes>().toEqualTypeOf<
      "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved"
    >();
  });

  it("ObservationCategoryCodes has exactly 9 members", () => {
    expectTypeOf<ObservationCategoryCodes>().toEqualTypeOf<
      | "social-history"
      | "vital-signs"
      | "imaging"
      | "laboratory"
      | "procedure"
      | "survey"
      | "exam"
      | "therapy"
      | "activity"
    >();
  });
});
