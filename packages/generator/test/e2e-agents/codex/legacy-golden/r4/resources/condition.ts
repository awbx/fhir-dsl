import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";

export interface Condition extends DomainResource {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept;
  subject: Reference<"Patient">;
}
