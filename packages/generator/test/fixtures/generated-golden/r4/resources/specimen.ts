import type { CodeableConcept, DomainResource } from "../datatypes.js";

export interface Specimen extends DomainResource {
  resourceType: "Specimen";
  type?: CodeableConcept;
}
