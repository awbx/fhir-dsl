import type { FhirBoolean, FhirCode } from "../primitives.js";
import type { DomainResource, Element, HumanName } from "../datatypes.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode;
  _gender?: Element;
  name?: HumanName[];
  active?: FhirBoolean;
  _active?: Element;
}
