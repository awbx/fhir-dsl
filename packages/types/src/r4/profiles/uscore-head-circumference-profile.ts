import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Head Circumference Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-head-circumference
 */
export interface USCoreHeadCircumferenceProfile extends Observation {
  code?: CodeableConcept;
}

