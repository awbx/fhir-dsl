import type { CodeableConcept, Reference } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Occupation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-occupation
 */
export interface USCoreObservationOccupationProfile extends Observation {
  subject: Reference<"us-core-patient">;
  valueCodeableConcept: CodeableConcept;
}

