import type { FhirBoolean, FhirDateTime, FhirInstant, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, SampledData, Timing } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Screening Assessment Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-screening-assessment
 */
export interface USCoreObservationScreeningAssessmentProfile extends Observation {
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
}

