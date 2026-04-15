import type { FhirBoolean, FhirCode, FhirDateTime, FhirInstant, FhirInteger, FhirString, FhirTime } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Quantity, Range, Ratio, Reference, SampledData, Timing } from "../datatypes.js";

export interface ObservationReferenceRange extends BackboneElement {
  low?: Quantity;
  high?: Quantity;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: FhirString;
}

export interface ObservationComponent extends BackboneElement {
  code: CodeableConcept;
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
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

export interface Observation extends DomainResource {
  resourceType: "Observation";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan" | "DeviceRequest" | "ImmunizationRecommendation" | "MedicationRequest" | "NutritionOrder" | "ServiceRequest">[];
  partOf?: Reference<"MedicationAdministration" | "MedicationDispense" | "MedicationStatement" | "Procedure" | "Immunization" | "ImagingStudy">[];
  status: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference<"Patient" | "Group" | "Device" | "Location">;
  focus?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
  issued?: FhirInstant;
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "RelatedPerson">[];
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
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  method?: CodeableConcept;
  specimen?: Reference<"Specimen">;
  device?: Reference<"Device" | "DeviceMetric">;
  referenceRange?: ObservationReferenceRange[];
  hasMember?: Reference<"Observation" | "QuestionnaireResponse" | "MolecularSequence">[];
  derivedFrom?: Reference<"DocumentReference" | "ImagingStudy" | "Media" | "QuestionnaireResponse" | "Observation" | "MolecularSequence">[];
  component?: ObservationComponent[];
}
