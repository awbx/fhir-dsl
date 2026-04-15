import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Respiratory Rate Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-respiratory-rate
 */
export interface USCoreRespiratoryRateProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

