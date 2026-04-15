import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Body Height Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-body-height
 */
export interface USCoreBodyHeightProfile extends Observation {
  code?: CodeableConcept;
}

