import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { DomainResource, Identifier, Reference } from "../datatypes.js";

export interface EnrollmentResponse extends DomainResource {
  resourceType: "EnrollmentResponse";
  identifier?: Identifier[];
  status?: FhirCode;
  request?: Reference<"EnrollmentRequest">;
  outcome?: FhirCode;
  disposition?: FhirString;
  created?: FhirDateTime;
  organization?: Reference<"Organization">;
  requestProvider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}
