import type { FhirBoolean, FhirDateTime, FhirInstant, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { CodeableConcept, Period, Quantity, Range, Ratio, Reference, SampledData, Timing } from "../datatypes.js";
import type { Observation } from "../resources/observation.js";

/**
 * US Core Observation Screening Assessment Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-screening-assessment
 */
export interface USCoreObservationScreeningAssessmentProfile extends Observation {
  subject: Reference<"us-core-patient">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
  performer?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "PractitionerRole" | "us-core-careteam" | "us-core-relatedperson">;
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
  hasMember?: Reference<"us-core-observation-screening-assessment" | "QuestionnaireResponse" | "MolecularSequence">;
  derivedFrom?: Reference<"us-core-observation-screening-assessment" | "us-core-questionnaireresponse" | "us-core-documentreference" | "ImagingStudy" | "Media" | "MolecularSequence">;
}

