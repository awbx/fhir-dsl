import type { CodeableConcept, Reference } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Occupation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-occupation
 */
export interface USCoreObservationOccupationProfile extends Observation {
  status?: unknown;
  category?: unknown;
  category?: unknown;
  code?: unknown;
  subject: Reference<"us-core-patient">;
  effectivePeriod?: unknown;
  valueCodeableConcept: CodeableConcept;
  component?: unknown;
  component?: unknown;
}

