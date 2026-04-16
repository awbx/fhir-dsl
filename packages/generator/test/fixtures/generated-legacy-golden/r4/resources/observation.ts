import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference<"Patient">;
}
