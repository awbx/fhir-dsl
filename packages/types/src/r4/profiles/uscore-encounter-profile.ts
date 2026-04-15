import type { Reference } from "../datatypes.js";
import type { Encounter } from "../resources/encounter.js";

/**
 * US Core Encounter Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter
 */
export interface USCoreEncounterProfile extends Encounter {
  subject: Reference<"us-core-patient">;
  reasonReference?: Reference<"us-core-condition-problems-health-concerns" | "us-core-condition-encounter-diagnosis" | "us-core-procedure" | "Observation" | "ImmunizationRecommendation">[];
  serviceProvider?: Reference<"us-core-organization">;
}

