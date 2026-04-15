import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Reference } from "../datatypes.js";
import type { Immunization } from "../resources/immunization.js";

/**
 * US Core Immunization Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization
 */
export interface USCoreImmunizationProfile extends Immunization {
  patient?: Reference<"us-core-patient">;
  occurrenceDateTime?: FhirDateTime;
  occurrenceString?: FhirString;
}

