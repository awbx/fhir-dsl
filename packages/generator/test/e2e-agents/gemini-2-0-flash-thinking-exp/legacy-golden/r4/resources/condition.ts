import type { CodeableConcept, DomainResource } from "../datatypes.js";

export interface Condition extends DomainResource {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept;
}
