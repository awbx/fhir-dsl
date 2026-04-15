import type { CodeableConcept } from "../datatypes.js";
import type { us-core-vital-signs } from "../resources/us-core-vital-signs.js";

/**
 * US Core Blood Pressure Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-blood-pressure
 */
export interface USCoreBloodPressureProfile extends us-core-vital-signs {
  code?: CodeableConcept;
  component: unknown[];
  component: unknown;
  component: unknown;
}

