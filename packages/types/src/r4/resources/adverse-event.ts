import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface AdverseEventSuspectEntityCausality extends BackboneElement {
  assessment?: CodeableConcept;
  productRelatedness?: FhirString;
  author?: Reference<"Practitioner" | "PractitionerRole">;
  method?: CodeableConcept;
}

export interface AdverseEventSuspectEntity extends BackboneElement {
  instance: Reference<"Immunization" | "Procedure" | "Substance" | "Medication" | "MedicationAdministration" | "MedicationStatement" | "Device">;
  causality?: AdverseEventSuspectEntityCausality[];
}

export interface AdverseEvent extends DomainResource {
  resourceType: "AdverseEvent";
  identifier?: Identifier;
  actuality: FhirCode;
  category?: CodeableConcept[];
  event?: CodeableConcept;
  subject: Reference<"Patient" | "Group" | "Practitioner" | "RelatedPerson">;
  encounter?: Reference<"Encounter">;
  date?: FhirDateTime;
  detected?: FhirDateTime;
  recordedDate?: FhirDateTime;
  resultingCondition?: Reference<"Condition">[];
  location?: Reference<"Location">;
  seriousness?: CodeableConcept;
  severity?: CodeableConcept;
  outcome?: CodeableConcept;
  recorder?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  contributor?: Reference<"Practitioner" | "PractitionerRole" | "Device">[];
  suspectEntity?: AdverseEventSuspectEntity[];
  subjectMedicalHistory?: Reference<"Condition" | "Observation" | "AllergyIntolerance" | "FamilyMemberHistory" | "Immunization" | "Procedure" | "Media" | "DocumentReference">[];
  referenceDocument?: Reference<"DocumentReference">[];
  study?: Reference<"ResearchStudy">[];
}
