import type { CodeableConcept, DomainResource, Reference } from "../datatypes.js";
import type { ConditionClinicalStatusCodes } from "../terminology/valuesets.js";

export interface Condition extends DomainResource {
  resourceType: "Condition";
  clinicalStatus?: CodeableConcept<ConditionClinicalStatusCodes | (string & {})>;
  subject: Reference<"Patient">;
}
