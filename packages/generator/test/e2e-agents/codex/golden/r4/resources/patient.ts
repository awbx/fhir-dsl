import type { FhirBoolean, FhirCode } from "../primitives.js";
import type { DomainResource, Element, HumanName } from "../datatypes.js";
import type { AdministrativeGender } from "../terminology/valuesets.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode<AdministrativeGender>;
  _gender?: Element;
  name?: HumanName[];
  active?: FhirBoolean;
  _active?: Element;
}
