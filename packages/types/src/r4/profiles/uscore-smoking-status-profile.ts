import type { FhirBoolean, FhirDateTime, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, Reference, SampledData } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Smoking Status Observation Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-smokingstatus
 */
export interface USCoreSmokingStatusProfile extends Observation {
  subject: Reference<"us-core-patient">;
  valueCodeableConcept: CodeableConcept;
  valueQuantity: Quantity;
  valueString: FhirString;
  valueBoolean: FhirBoolean;
  valueInteger: FhirInteger;
  valueRange: Range;
  valueRatio: Ratio;
  valueSampledData: SampledData;
  valueTime: FhirTime;
  valueDateTime: FhirDateTime;
  valuePeriod: Period;
}

