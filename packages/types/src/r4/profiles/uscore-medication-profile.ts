import type { Medication } from "../resources/medication.js";

/**
 * US Core Medication Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-medication
 */
export interface USCoreMedicationProfile extends Medication {
  code: unknown;
}

