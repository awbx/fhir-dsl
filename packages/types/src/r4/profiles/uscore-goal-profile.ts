import type { FhirDate } from "../primitives.js";
import type { CodeableConcept, Reference } from "../datatypes.js";
import type { Goal } from "../resources/goal.js";

/**
 * US Core Goal Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-goal
 */
export interface USCoreGoalProfile extends Goal {
  subject?: Reference<"us-core-patient">;
  startDate?: FhirDate;
  startCodeableConcept?: CodeableConcept;
}

