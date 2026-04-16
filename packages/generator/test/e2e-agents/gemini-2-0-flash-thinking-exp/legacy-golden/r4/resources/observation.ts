import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource } from "../datatypes.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode;
  category?: CodeableConcept[];
}
