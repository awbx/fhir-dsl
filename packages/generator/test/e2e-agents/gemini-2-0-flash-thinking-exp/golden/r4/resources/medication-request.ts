import type { CodeableConcept, DomainResource } from "../datatypes.js";

export interface MedicationRequest extends DomainResource {
  resourceType: "MedicationRequest";
  medicationCodeableConcept?: CodeableConcept;
}
