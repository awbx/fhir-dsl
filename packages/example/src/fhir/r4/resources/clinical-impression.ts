import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface ClinicalImpressionInvestigation extends BackboneElement {
  code: CodeableConcept;
  item?: Reference<"Observation" | "QuestionnaireResponse" | "FamilyMemberHistory" | "DiagnosticReport" | "RiskAssessment" | "ImagingStudy" | "Media">[];
}

export interface ClinicalImpressionFinding extends BackboneElement {
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference<"Condition" | "Observation" | "Media">;
  basis?: FhirString;
}

export interface ClinicalImpression extends DomainResource {
  resourceType: "ClinicalImpression";
  identifier?: Identifier[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  code?: CodeableConcept;
  description?: FhirString;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  date?: FhirDateTime;
  assessor?: Reference<"Practitioner" | "PractitionerRole">;
  previous?: Reference<"ClinicalImpression">;
  problem?: Reference<"Condition" | "AllergyIntolerance">[];
  investigation?: ClinicalImpressionInvestigation[];
  protocol?: FhirUri[];
  summary?: FhirString;
  finding?: ClinicalImpressionFinding[];
  prognosisCodeableConcept?: CodeableConcept[];
  prognosisReference?: Reference<"RiskAssessment">[];
  supportingInfo?: Reference<"Resource">[];
  note?: Annotation[];
}
