import type { CodeableConcept, DomainResource } from "../datatypes.js";
import type { ClinicalCodes } from "../terminology/valuesets.js";

export interface Condition extends DomainResource {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept<ClinicalCodes | (string & {})>;
}
