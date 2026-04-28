import type { FhirCode } from "../primitives.js";
import type { DomainResource, Element } from "../datatypes.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;
  _gender?: Element;
}
