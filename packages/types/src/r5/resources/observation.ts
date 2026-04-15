import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Ratio,
  Reference,
  SampledData,
  Timing,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirInstant,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirTime,
} from "../primitives.js";

export interface ObservationTriggeredBy extends BackboneElement {
  observation: Reference<"Observation">;
  type: FhirCode;
  reason?: FhirString;
}

export interface ObservationReferenceRange extends BackboneElement {
  low?: Quantity;
  high?: Quantity;
  normalValue?: CodeableConcept;
  type?: CodeableConcept;
  appliesTo?: CodeableConcept[];
  age?: Range;
  text?: FhirMarkdown;
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
  valueAttachment?: Attachment;
  valueReference?: Reference<"MolecularSequence">;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  referenceRange?: ObservationReferenceRange[];
}

export interface Observation extends DomainResource {
  resourceType: "Observation";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical;
  instantiatesReference?: Reference<"ObservationDefinition">;
  basedOn?: Reference<
    | "CarePlan"
    | "DeviceRequest"
    | "ImmunizationRecommendation"
    | "MedicationRequest"
    | "NutritionOrder"
    | "ServiceRequest"
  >[];
  triggeredBy?: ObservationTriggeredBy[];
  partOf?: Reference<
    | "MedicationAdministration"
    | "MedicationDispense"
    | "MedicationStatement"
    | "Procedure"
    | "Immunization"
    | "ImagingStudy"
    | "GenomicStudy"
  >[];
  status: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference<
    | "Patient"
    | "Group"
    | "Device"
    | "Location"
    | "Organization"
    | "Procedure"
    | "Practitioner"
    | "Medication"
    | "Substance"
    | "BiologicallyDerivedProduct"
    | "NutritionProduct"
  >;
  focus?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  effectiveInstant?: FhirInstant;
  issued?: FhirInstant;
  performer?: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "RelatedPerson"
  >[];
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
  valueAttachment?: Attachment;
  valueReference?: Reference<"MolecularSequence">;
  dataAbsentReason?: CodeableConcept;
  interpretation?: CodeableConcept[];
  note?: Annotation[];
  bodySite?: CodeableConcept;
  bodyStructure?: Reference<"BodyStructure">;
  method?: CodeableConcept;
  specimen?: Reference<"Specimen" | "Group">;
  device?: Reference<"Device" | "DeviceMetric">;
  referenceRange?: ObservationReferenceRange[];
  hasMember?: Reference<"Observation" | "QuestionnaireResponse" | "MolecularSequence">[];
  derivedFrom?: Reference<
    | "DocumentReference"
    | "ImagingStudy"
    | "ImagingSelection"
    | "QuestionnaireResponse"
    | "Observation"
    | "MolecularSequence"
    | "GenomicStudy"
  >[];
  component?: ObservationComponent[];
}
