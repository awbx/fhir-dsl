import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource, Element } from "../datatypes.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode;
  _status?: Element;
  category?: CodeableConcept[];
}
