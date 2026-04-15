import type { CodeableConcept } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Pediatric BMI for Age Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/pediatric-bmi-for-age
 */
export interface USCorePediatricBMIforAgeObservationProfile extends Observation {
  code?: CodeableConcept;
}

