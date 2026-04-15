import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Pediatric Head Occipital Frontal Circumference Percentile Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/head-occipital-frontal-circumference-percentile
 */
export interface USCorePediatricHeadOccipitalFrontalCircumferencePercentileProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

