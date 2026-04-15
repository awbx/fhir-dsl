import type { Period, Timing } from "../datatypes.js";
import type { FhirDateTime, FhirInstant } from "../primitives.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Sexual Orientation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-sexual-orientation
 */
export interface USCoreObservationSexualOrientationProfile extends Observation {
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
}
