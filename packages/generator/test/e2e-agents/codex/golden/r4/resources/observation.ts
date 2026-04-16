import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";
import type { ObservationCategoryCodes, ObservationStatus } from "../terminology/valuesets.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode<ObservationStatus>;
  category?: CodeableConcept<ObservationCategoryCodes>[];
  code: CodeableConcept;
  subject?: Reference<"Patient">;
}
