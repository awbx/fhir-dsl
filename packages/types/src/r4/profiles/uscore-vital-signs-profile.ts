import type { FhirBoolean, FhirDateTime, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, Reference, SampledData } from "../datatypes.js";
import type { vitalsigns } from "../resources/vitalsigns.js";

/**
 * US Core Vital Signs Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-vital-signs
 */
export interface USCoreVitalSignsProfile extends vitalsigns {
  status?: unknown;
  category: CodeableConcept[];
  category: CodeableConcept;
  code?: unknown;
  subject?: Reference<"us-core-patient">;
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
  dataAbsentReason?: unknown;
  component?: unknown;
}

