import type { CodeableConcept, Quantity, Reference } from "../datatypes.js";
import type { MedicationDispense } from "../resources/medication-dispense.js";

/**
 * US Core MedicationDispense Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationdispense
 */
export interface USCoreMedicationDispenseProfile extends MedicationDispense {
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"us-core-medication">;
  subject: Reference<"us-core-patient">;
  authorizingPrescription?: Reference<"us-core-medicationrequest">;
  quantity?: Quantity;
}

