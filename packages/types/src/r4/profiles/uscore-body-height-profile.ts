import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Body Height Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-body-height
 */
export interface USCoreBodyHeightProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  valueQuantity?: unknown;
}

