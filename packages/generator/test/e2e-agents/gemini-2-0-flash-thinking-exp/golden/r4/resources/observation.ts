import type { FhirCode } from "../primitives.js";
import type { CodeableConcept, DomainResource, Element } from "../datatypes.js";
import type { ObservationCategoryCodes, ObservationStatus } from "../terminology/valuesets.js";

export interface Observation extends DomainResource {
  resourceType: "Observation";
  status: FhirCode<ObservationStatus>;
  _status?: Element;
  category?: CodeableConcept<ObservationCategoryCodes>[];
}
