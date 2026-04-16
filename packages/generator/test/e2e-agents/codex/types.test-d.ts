import { createFhirClient, type SearchParamFor } from "@fhir-dsl/core";
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
  ConditionClinicalStatusCodes,
  ObservationCategoryCodes,
  ObservationStatus,
} from "./golden/r4/terminology/valuesets.js";

describe("codex terminology type flow", () => {
  it("keeps required FhirCode bindings as exact unions", () => {
    expectTypeOf<Patient["gender"]>().toEqualTypeOf<AdministrativeGender | undefined>();
    expectTypeOf<AdministrativeGender>().toEqualTypeOf<"male" | "female" | "other" | "unknown">();
    expectTypeOf<Observation["status"]>().toEqualTypeOf<ObservationStatus>();
    expectTypeOf<ObservationStatus>().toEqualTypeOf<
      "registered" | "preliminary" | "final" | "amended" | "corrected" | "cancelled" | "entered-in-error" | "unknown"
    >();

    const male: AdministrativeGender = "male";
    const finalStatus: ObservationStatus = "final";

    void [male, finalStatus];

    // @ts-expect-error invalid required Patient.gender code
    const invalidGender: AdministrativeGender = "banana";
    // @ts-expect-error invalid required Observation.status code
    const invalidStatus: ObservationStatus = "banana";

    void [invalidGender, invalidStatus];
  });

  it("keeps required CodeableConcept bindings as exact inner-code unions", () => {
    type Category = NonNullable<Observation["category"]>[number];
    type CategoryCode = NonNullable<NonNullable<Category["coding"]>[number]["code"]>;

    expectTypeOf<CategoryCode>().toEqualTypeOf<ObservationCategoryCodes>();
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

    const categoryCode: CategoryCode = "laboratory";
    void categoryCode;

    // @ts-expect-error invalid required Observation.category code
    const invalidCategoryCode: CategoryCode = "banana";
    void invalidCategoryCode;
  });

  it("keeps extensible bindings open to arbitrary strings", () => {
    type ClinicalStatus = NonNullable<Condition["clinicalStatus"]>;
    type ClinicalCode = NonNullable<NonNullable<ClinicalStatus["coding"]>[number]["code"]>;

    expectTypeOf<ConditionClinicalStatusCodes>().toEqualTypeOf<
      "active" | "recurrence" | "relapse" | "inactive" | "remission" | "resolved"
    >();
    expectTypeOf<"active">().toExtend<ClinicalCode>();
    expectTypeOf<ConditionClinicalStatusCodes>().toExtend<ClinicalCode>();
    expectTypeOf<"site-local-code">().toExtend<ClinicalCode>();
    expectTypeOf<ClinicalCode>().toEqualTypeOf<string>();
  });

  it("leaves preferred, example, and unresolvable bindings unconstrained", () => {
    type EncounterCode = NonNullable<NonNullable<NonNullable<Encounter["priority"]>["coding"]>[number]["code"]>;
    type SpecimenCode = NonNullable<NonNullable<NonNullable<Specimen["type"]>["coding"]>[number]["code"]>;
    type MedicationCode = NonNullable<
      NonNullable<NonNullable<MedicationRequest["medicationCodeableConcept"]>["coding"]>[number]["code"]
    >;

    expectTypeOf<EncounterCode>().toEqualTypeOf<string>();
    expectTypeOf<SpecimenCode>().toEqualTypeOf<string>();
    expectTypeOf<MedicationCode>().toEqualTypeOf<string>();
  });

  it("flows required terminology unions through SearchParamFor", () => {
    type PatientGenderParam = SearchParamFor<GeneratedSchema, "Patient">["gender"];
    type ObservationStatusParam = SearchParamFor<GeneratedSchema, "Observation">["status"];

    expectTypeOf<PatientGenderParam["value"]>().toEqualTypeOf<AdministrativeGender>();
    expectTypeOf<ObservationStatusParam["value"]>().toEqualTypeOf<ObservationStatus>();
  });

  it("flows required terminology unions through the query builder", () => {
    const client = createFhirClient<GeneratedSchema>({ baseUrl: "http://example.test/fhir" });

    client.search("Patient").where("gender", "eq", "male");
    client.search("Observation").where("status", "eq", "final");

    // @ts-expect-error invalid Patient.gender query value
    client.search("Patient").where("gender", "eq", "banana");
    // @ts-expect-error invalid Observation.status query value
    client.search("Observation").where("status", "eq", "banana");
  });
});
