import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Pregnancy Status Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-pregnancystatus
 */
export interface USCoreObservationPregnancyStatusProfile extends Observation {
  valueCodeableConcept: CodeableConcept;
}

