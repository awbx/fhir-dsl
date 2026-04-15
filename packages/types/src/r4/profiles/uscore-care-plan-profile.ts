import type { Reference } from "../datatypes.js";
import type { CarePlan } from "../resources/care-plan.js";

/**
 * US Core CarePlan Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-careplan
 */
export interface USCoreCarePlanProfile extends CarePlan {
  status?: unknown;
  intent?: unknown;
  category: unknown;
  category: unknown;
  subject?: Reference<"us-core-patient">;
}

