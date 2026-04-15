import type { Practitioner } from "../resources/practitioner.js";

/**
 * US Core Practitioner Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner
 */
export interface USCorePractitionerProfile extends Practitioner {
  identifier: unknown;
  identifier?: unknown;
  name: unknown;
  telecom?: unknown;
  address?: unknown;
}

