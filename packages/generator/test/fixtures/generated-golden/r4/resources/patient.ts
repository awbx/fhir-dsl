import type { FhirBoolean, FhirCode } from "../primitives.js";
import type { DomainResource, HumanName } from "../datatypes.js";
import type { AdministrativeGender } from "../terminology/valuesets.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode<AdministrativeGender>;
  name?: HumanName[];
  active?: FhirBoolean;
}
