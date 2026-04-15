import type { CodeableConcept } from "../datatypes.js";
import type { MedicationDispense } from "../resources/medication-dispense.js";

/**
 * US Core MedicationDispense Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationdispense
 */
export interface USCoreMedicationDispenseProfile extends MedicationDispense {
  medicationCodeableConcept?: CodeableConcept;
}
