import type { CodeableConcept, Period, Quantity, Range, Ratio, SampledData, Timing } from "../datatypes.js";
import type { FhirBoolean, FhirDateTime, FhirInstant, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Clinical Result Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-clinical-result
 */
export interface USCoreObservationClinicalResultProfile extends Observation {
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
