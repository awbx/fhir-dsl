import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Pediatric BMI for Age Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/pediatric-bmi-for-age
 */
export interface USCorePediatricBMIforAgeObservationProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

