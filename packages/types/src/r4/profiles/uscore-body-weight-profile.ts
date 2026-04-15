import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Body Weight Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-body-weight
 */
export interface USCoreBodyWeightProfile extends Observation {
  code?: CodeableConcept;
}

