import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";

export interface Encounter extends DomainResource {
  resourceType: "Encounter";
  priority?: CodeableConcept;
  subject?: Reference<"Patient">;
}
