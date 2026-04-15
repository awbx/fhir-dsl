import type { Reference } from "../datatypes.js";
import type { RelatedPerson } from "../resources/related-person.js";

/**
 * US Core RelatedPerson Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-relatedperson
 */
export interface USCoreRelatedPersonProfile extends RelatedPerson {
  active: unknown;
  patient?: Reference<"us-core-patient">;
  relationship?: unknown;
  name?: unknown;
  telecom?: unknown;
  address?: unknown;
}

