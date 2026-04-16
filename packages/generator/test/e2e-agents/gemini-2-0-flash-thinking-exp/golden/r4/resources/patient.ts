import type { FhirCode } from "../primitives.js";
import type { DomainResource } from "../datatypes.js";
import type { AdministrativeGender } from "../terminology/valuesets.js";

export interface Patient extends DomainResource {
  resourceType: "Patient";
  gender?: FhirCode<AdministrativeGender>;
}
