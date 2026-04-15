import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Head Circumference Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-head-circumference
 */
export interface USCoreHeadCircumferenceProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

