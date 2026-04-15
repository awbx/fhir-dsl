import type { CodeableConcept, Period, Quantity, Range, Ratio, SampledData } from "../datatypes.js";
import type { FhirBoolean, FhirDateTime, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Vital Signs Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs
 */
export interface USCoreVitalSignsProfile extends Observation {
  category: CodeableConcept[];
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
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
