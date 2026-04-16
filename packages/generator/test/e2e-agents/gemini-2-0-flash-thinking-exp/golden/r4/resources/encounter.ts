import type { CodeableConcept, DomainResource } from "../datatypes.js";

export interface Encounter extends DomainResource {
  resourceType: "Encounter";
  priority?: CodeableConcept;
}
