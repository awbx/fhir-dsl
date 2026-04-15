import type { FhirDateTime, FhirInstant } from "../primitives.js";
import type { Period, Reference, Timing } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Sexual Orientation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-sexual-orientation
 */
export interface USCoreObservationSexualOrientationProfile extends Observation {
  status?: unknown;
  code?: unknown;
  subject: Reference<"us-core-patient">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
  valueCodeableConcept?: unknown;
}

