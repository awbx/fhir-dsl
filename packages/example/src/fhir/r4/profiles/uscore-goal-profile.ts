import type { FhirDate } from "../primitives.js";
import type { CodeableConcept } from "../datatypes.js";
import type { Goal } from "../resources/goal.js";

/**
 * US Core Goal Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-goal
 */
export interface USCoreGoalProfile extends Goal {
  startDate?: FhirDate;
  startCodeableConcept?: CodeableConcept;
}

