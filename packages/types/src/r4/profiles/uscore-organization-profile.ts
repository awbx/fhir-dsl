import type { Organization } from "../resources/organization.js";

/**
 * US Core Organization Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-organization
 */
export interface USCoreOrganizationProfile extends Organization {
  identifier?: unknown;
  identifier?: unknown;
  active: unknown;
  name: unknown;
  telecom?: unknown;
  address?: unknown;
}

