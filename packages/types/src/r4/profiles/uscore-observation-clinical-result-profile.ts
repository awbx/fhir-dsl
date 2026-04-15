import type { FhirBoolean, FhirDateTime, FhirInstant, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, Reference, SampledData, Timing } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Clinical Result Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-clinical-result
 */
export interface USCoreObservationClinicalResultProfile extends Observation {
  status?: unknown;
  category: unknown;
  category?: unknown;
  code?: unknown;
  subject: Reference<"us-core-patient">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueSampledData?: SampledData;
  valueTime?: FhirTime;
  valueDateTime?: FhirDateTime;
  valuePeriod?: Period;
  dataAbsentReason?: unknown;
}

