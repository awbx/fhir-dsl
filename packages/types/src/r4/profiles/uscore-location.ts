import type { Reference } from "../datatypes.js";
import type { Location } from "../resources/location.js";

/**
 * US Core Location Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-location
 */
export interface USCoreLocation extends Location {
  status?: unknown;
  name: unknown;
  telecom?: unknown;
  address?: unknown;
  managingOrganization?: Reference<"us-core-organization">;
}

