import type { FhirCode } from "../primitives.js";
import type { DomainResource } from "../datatypes.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;
}
