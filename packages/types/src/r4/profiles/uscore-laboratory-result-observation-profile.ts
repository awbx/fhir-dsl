import type { FhirBoolean, FhirDateTime, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, Reference, SampledData } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Laboratory Result Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab
 */
export interface USCoreLaboratoryResultObservationProfile extends Observation {
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
  specimen?: Reference<"us-core-specimen">;
}

