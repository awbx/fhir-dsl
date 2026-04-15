import type { CodeableConcept, Reference } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Pregnancy Intent Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-pregnancyintent
 */
export interface USCoreObservationPregnancyIntentProfile extends Observation {
  status?: unknown;
  category?: unknown;
  category?: unknown;
  code?: unknown;
  subject: Reference<"us-core-patient">;
  effectiveDateTime: unknown;
  valueCodeableConcept: CodeableConcept;
}

