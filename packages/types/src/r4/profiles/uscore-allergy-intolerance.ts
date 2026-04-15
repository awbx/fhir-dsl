import type { Reference } from "../datatypes.js";
import type { AllergyIntolerance } from "../resources/allergy-intolerance.js";

/**
 * US Core AllergyIntolerance Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-allergyintolerance
 */
export interface USCoreAllergyIntolerance extends AllergyIntolerance {
  patient?: Reference<"us-core-patient">;
}

