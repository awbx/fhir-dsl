import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";

export interface MedicationRequest extends DomainResource {
  resourceType: "MedicationRequest";
  medicationCodeableConcept?: CodeableConcept;
  subject: Reference<"Patient">;
}
