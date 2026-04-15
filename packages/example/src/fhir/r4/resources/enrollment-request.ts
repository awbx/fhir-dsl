import type { FhirCode, FhirDateTime } from "../primitives.js";
import type { DomainResource, Identifier, Reference } from "../datatypes.js";

export interface EnrollmentRequest extends DomainResource {
  resourceType: "EnrollmentRequest";
  identifier?: Identifier[];
  status?: FhirCode;
  created?: FhirDateTime;
  insurer?: Reference<"Organization">;
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  candidate?: Reference<"Patient">;
  coverage?: Reference<"Coverage">;
}
