import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Pediatric Weight for Height Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/pediatric-weight-for-height
 */
export interface USCorePediatricWeightForHeightObservationProfile extends Observation {
  code: CodeableConcept;
}

