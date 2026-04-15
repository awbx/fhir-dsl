import type { Reference } from "../datatypes.js";
import type { PractitionerRole } from "../resources/practitioner-role.js";

/**
 * US Core PractitionerRole Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitionerrole
 */
export interface USCorePractitionerRoleProfile extends PractitionerRole {
  practitioner?: Reference<"us-core-practitioner">;
  organization?: Reference<"us-core-organization">;
  code?: unknown;
  specialty?: unknown;
  location?: unknown;
  telecom?: unknown;
  endpoint?: unknown;
}

