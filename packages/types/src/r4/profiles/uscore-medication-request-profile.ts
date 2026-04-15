import type { FhirBoolean } from "../primitives.js";
import type { CodeableConcept, Reference } from "../datatypes.js";
import type { MedicationRequest } from "../resources/medication-request.js";

/**
 * US Core MedicationRequest Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest
 */
export interface USCoreMedicationRequestProfile extends MedicationRequest {
  status?: unknown;
  intent?: unknown;
  category?: unknown;
  category?: unknown;
  reportedBoolean?: FhirBoolean;
  reportedReference?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "us-core-practitionerrole" | "us-core-relatedperson">;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"us-core-medication">;
  subject?: Reference<"us-core-patient">;
  encounter?: Reference<"us-core-encounter">;
  authoredOn?: unknown;
  requester?: Reference<"us-core-practitioner" | "us-core-patient" | "us-core-organization" | "us-core-practitionerrole" | "us-core-relatedperson" | "Device">;
  dosageInstruction?: unknown;
  dispenseRequest?: unknown;
}

