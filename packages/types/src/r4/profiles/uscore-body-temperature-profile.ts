import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Body Temperature Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-body-temperature
 */
export interface USCoreBodyTemperatureProfile extends Observation {
  code?: CodeableConcept;
}

