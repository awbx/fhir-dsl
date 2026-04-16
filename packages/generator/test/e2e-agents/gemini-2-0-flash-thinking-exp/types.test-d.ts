import { createFhirClient } from "@fhir-dsl/core";
import { describe, expectTypeOf, it } from "vitest";
import type { GeneratedSchema } from "./golden/r4/client.js";
import type { Condition } from "./golden/r4/resources/condition.js";
import type { Encounter } from "./golden/r4/resources/encounter.js";
import type { MedicationRequest } from "./golden/r4/resources/medication-request.js";
import type { Observation } from "./golden/r4/resources/observation.js";
import type { Patient } from "./golden/r4/resources/patient.js";
import type { Specimen } from "./golden/r4/resources/specimen.js";
import type {
  AdministrativeGender,
  ClinicalCodes,
  ObservationCategoryCodes,
  ObservationStatus,
} from "./golden/r4/terminology/valuesets.js";

describe("gemini-2-0-flash-thinking-exp Type-level tests", () => {
  it("should have exact union for required FhirCode (Patient.gender)", () => {
    type Gender = Patient["gender"];
    // Patient["gender"] is FhirCode<AdministrativeGender> | undefined

    expectTypeOf<Gender>().toEqualTypeOf<AdministrativeGender | undefined>();

    expectTypeOf<"male">().toExtend<AdministrativeGender>();
    expectTypeOf<"female">().toExtend<AdministrativeGender>();
    expectTypeOf<"other">().toExtend<AdministrativeGender>();
    expectTypeOf<"unknown">().toExtend<AdministrativeGender>();

    // @ts-expect-error - invalid code
    const _invalid: AdministrativeGender = "banana";

    // Check union identity
    expectTypeOf<AdministrativeGender>().toEqualTypeOf<"male" | "female" | "other" | "unknown">();
  });

  it("should have exact union for required FhirCode (Observation.status)", () => {
    type Status = Observation["status"];
    expectTypeOf<Status>().toEqualTypeOf<ObservationStatus>();
    expectTypeOf<ObservationStatus>().toEqualTypeOf<"registered" | "preliminary" | "final" | "amended">();
  });

  it("should have exact union for required CodeableConcept (Observation.category)", () => {
    type Category = NonNullable<Observation["category"]>[number];
    type CategoryCode = NonNullable<NonNullable<Category["coding"]>[number]["code"]>;

    expectTypeOf<CategoryCode>().toEqualTypeOf<ObservationCategoryCodes>();
    expectTypeOf<ObservationCategoryCodes>().toEqualTypeOf<"vital-signs" | "imaging" | "laboratory">();

    // @ts-expect-error - invalid code
    const _invalid: ObservationCategoryCodes = "banana";
  });

  it("should allow arbitrary strings for extensible bindings (Condition.clinicalStatus)", () => {
    type ClinicalStatus = NonNullable<Condition["clinicalStatus"]>;
    type ClinicalCode = NonNullable<NonNullable<ClinicalStatus["coding"]>[number]["code"]>;

    // It should allow known codes
    expectTypeOf<"active">().toExtend<ClinicalCode>();
    expectTypeOf<ClinicalCodes>().toExtend<ClinicalCode>();

    // It should also allow arbitrary strings
    expectTypeOf<"banana">().toExtend<ClinicalCode>();

    // It should preserve autocomplete via (string & {})
    // At the type level it is ClinicalCodes | (string & {}) which collapses to string
    expectTypeOf<ClinicalCode>().toEqualTypeOf<string>();
  });

  it("should NOT constrain preferred bindings (Encounter.priority)", () => {
    type Priority = NonNullable<Encounter["priority"]>;
    type PriorityCode = NonNullable<NonNullable<Priority["coding"]>[number]["code"]>;

    // Should be just string
    expectTypeOf<PriorityCode>().toEqualTypeOf<string>();
  });

  it("should NOT constrain example bindings (Specimen.type)", () => {
    type SpecimenType = NonNullable<Specimen["type"]>;
    type SpecimenCode = NonNullable<NonNullable<SpecimenType["coding"]>[number]["code"]>;

    // Should be just string
    expectTypeOf<SpecimenCode>().toEqualTypeOf<string>();
  });

  it("should NOT constrain unresolvable bindings (MedicationRequest.medicationCodeableConcept)", () => {
    type Med = NonNullable<MedicationRequest["medicationCodeableConcept"]>;
    type MedCode = NonNullable<NonNullable<Med["coding"]>[number]["code"]>;

    // Should be just string
    expectTypeOf<MedCode>().toEqualTypeOf<string>();
  });

  it("should flow types through search parameters and query builder", () => {
    const client = createFhirClient<GeneratedSchema>({ baseUrl: "http://localhost" });

    // client.search("Patient").where("gender", "eq", "male") should pass
    client.search("Patient").where("gender", "eq", "male");

    // @ts-expect-error - invalid code in .where()
    client.search("Patient").where("gender", "eq", "banana");

    // Observation status
    client.search("Observation").where("status", "eq", "final");
    // @ts-expect-error - invalid code
    client.search("Observation").where("status", "eq", "banana");
  });
});
