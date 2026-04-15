import type { FhirBoolean } from "../primitives.js";
import type { CodeableConcept } from "../datatypes.js";
import type { MedicationRequest } from "../resources/medication-request.js";

/**
 * US Core MedicationRequest Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest
 */
export interface USCoreMedicationRequestProfile extends MedicationRequest {
  reportedBoolean?: FhirBoolean;
  medicationCodeableConcept?: CodeableConcept;
}

