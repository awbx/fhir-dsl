import type { FhirCode } from "../primitives.js";
import type { Patient } from "../resources/patient.js";

/**
 * US Core Patient Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient
 */
export interface USCorePatientProfile extends Patient {
  identifier: unknown;
  name: unknown;
  gender: FhirCode;
  birthDate?: unknown;
  address?: unknown;
}

