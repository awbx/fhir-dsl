import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource, Element, Reference } from "../datatypes.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode;
  _status?: Element;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference<"Patient">;
}
