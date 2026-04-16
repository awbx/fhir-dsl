import type { FhirBoolean, FhirCode } from "../primitives.js";
import type { DomainResource, HumanName } from "../datatypes.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;
  name?: HumanName[];
  active?: FhirBoolean;
}
