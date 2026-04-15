import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core BMI Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-bmi
 */
export interface USCoreBMIProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

