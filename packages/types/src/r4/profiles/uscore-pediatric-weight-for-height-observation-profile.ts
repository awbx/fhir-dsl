import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Pediatric Weight for Height Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/pediatric-weight-for-height
 */
export interface USCorePediatricWeightForHeightObservationProfile extends us-core-vital-signs {
  code: CodeableConcept;
  valueQuantity?: unknown;
}

