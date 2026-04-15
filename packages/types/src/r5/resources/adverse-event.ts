import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime } from "../primitives.js";

export interface AdverseEventParticipant extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "Patient"
    | "Device"
    | "RelatedPerson"
    | "ResearchSubject"
  >;
}

export interface AdverseEventSuspectEntityCausality extends BackboneElement {
  assessmentMethod?: CodeableConcept;
  entityRelatedness?: CodeableConcept;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "ResearchSubject">;
}

export interface AdverseEventSuspectEntity extends BackboneElement {
  instanceCodeableConcept?: CodeableConcept;
  instanceReference?: Reference<
    | "Immunization"
    | "Procedure"
    | "Substance"
    | "Medication"
    | "MedicationAdministration"
    | "MedicationStatement"
    | "Device"
    | "BiologicallyDerivedProduct"
    | "ResearchStudy"
  >;
  causality?: AdverseEventSuspectEntityCausality;
}

export interface AdverseEventContributingFactor extends BackboneElement {
  itemReference?: Reference<
    | "Condition"
    | "Observation"
    | "AllergyIntolerance"
    | "FamilyMemberHistory"
    | "Immunization"
    | "Procedure"
    | "Device"
    | "DeviceUsage"
    | "DocumentReference"
    | "MedicationAdministration"
    | "MedicationStatement"
  >;
  itemCodeableConcept?: CodeableConcept;
}

export interface AdverseEventPreventiveAction extends BackboneElement {
  itemReference?: Reference<
    "Immunization" | "Procedure" | "DocumentReference" | "MedicationAdministration" | "MedicationRequest"
  >;
  itemCodeableConcept?: CodeableConcept;
}

export interface AdverseEventMitigatingAction extends BackboneElement {
  itemReference?: Reference<"Procedure" | "DocumentReference" | "MedicationAdministration" | "MedicationRequest">;
  itemCodeableConcept?: CodeableConcept;
}

export interface AdverseEventSupportingInfo extends BackboneElement {
  itemReference?: Reference<
    | "Condition"
    | "Observation"
    | "AllergyIntolerance"
    | "FamilyMemberHistory"
    | "Immunization"
    | "Procedure"
    | "DocumentReference"
    | "MedicationAdministration"
    | "MedicationStatement"
    | "QuestionnaireResponse"
  >;
  itemCodeableConcept?: CodeableConcept;
}

export interface AdverseEvent extends DomainResource {
  resourceType: "AdverseEvent";
  identifier?: Identifier[];
  status: FhirCode;
  actuality: FhirCode;
  category?: CodeableConcept[];
  code?: CodeableConcept;
  subject: Reference<"Patient" | "Group" | "Practitioner" | "RelatedPerson" | "ResearchSubject">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  detected?: FhirDateTime;
  recordedDate?: FhirDateTime;
  resultingEffect?: Reference<"Condition" | "Observation">[];
  location?: Reference<"Location">;
  seriousness?: CodeableConcept;
  outcome?: CodeableConcept[];
  recorder?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "ResearchSubject">;
  participant?: AdverseEventParticipant[];
  study?: Reference<"ResearchStudy">[];
  expectedInResearchStudy?: FhirBoolean;
  suspectEntity?: AdverseEventSuspectEntity[];
  contributingFactor?: AdverseEventContributingFactor[];
  preventiveAction?: AdverseEventPreventiveAction[];
  mitigatingAction?: AdverseEventMitigatingAction[];
  supportingInfo?: AdverseEventSupportingInfo[];
  note?: Annotation[];
}
