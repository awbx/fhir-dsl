import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Respiratory Rate Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-respiratory-rate
 */
export interface USCoreRespiratoryRateProfile extends Observation {
  code?: CodeableConcept;
}

