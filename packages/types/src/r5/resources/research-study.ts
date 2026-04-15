import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirId,
  FhirMarkdown,
  FhirString,
  FhirUnsignedInt,
  FhirUri,
} from "../primitives.js";

export interface ResearchStudyLabel extends BackboneElement {
  type?: CodeableConcept;
  value?: FhirString;
}

export interface ResearchStudyAssociatedParty extends BackboneElement {
  name?: FhirString;
  role: CodeableConcept;
  period?: Period[];
  classifier?: CodeableConcept[];
  party?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}

export interface ResearchStudyProgressStatus extends BackboneElement {
  state: CodeableConcept;
  actual?: FhirBoolean;
  period?: Period;
}

export interface ResearchStudyRecruitment extends BackboneElement {
  targetNumber?: FhirUnsignedInt;
  actualNumber?: FhirUnsignedInt;
  eligibility?: Reference<"Group" | "EvidenceVariable">;
  actualGroup?: Reference<"Group">;
}

export interface ResearchStudyComparisonGroup extends BackboneElement {
  linkId?: FhirId;
  name: FhirString;
  type?: CodeableConcept;
  description?: FhirMarkdown;
  intendedExposure?: Reference<"EvidenceVariable">[];
  observedGroup?: Reference<"Group">;
}

export interface ResearchStudyObjective extends BackboneElement {
  name?: FhirString;
  type?: CodeableConcept;
  description?: FhirMarkdown;
}

export interface ResearchStudyOutcomeMeasure extends BackboneElement {
  name?: FhirString;
  type?: CodeableConcept[];
  description?: FhirMarkdown;
  reference?: Reference<"EvidenceVariable">;
}

export interface ResearchStudy extends DomainResource {
  resourceType: "ResearchStudy";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  label?: ResearchStudyLabel[];
  protocol?: Reference<"PlanDefinition">[];
  partOf?: Reference<"ResearchStudy">[];
  relatedArtifact?: RelatedArtifact[];
  date?: FhirDateTime;
  status: FhirCode;
  primaryPurposeType?: CodeableConcept;
  phase?: CodeableConcept;
  studyDesign?: CodeableConcept[];
  focus?: CodeableReference[];
  condition?: CodeableConcept[];
  keyword?: CodeableConcept[];
  region?: CodeableConcept[];
  descriptionSummary?: FhirMarkdown;
  description?: FhirMarkdown;
  period?: Period;
  site?: Reference<"Location" | "ResearchStudy" | "Organization">[];
  note?: Annotation[];
  classifier?: CodeableConcept[];
  associatedParty?: ResearchStudyAssociatedParty[];
  progressStatus?: ResearchStudyProgressStatus[];
  whyStopped?: CodeableConcept;
  recruitment?: ResearchStudyRecruitment;
  comparisonGroup?: ResearchStudyComparisonGroup[];
  objective?: ResearchStudyObjective[];
  outcomeMeasure?: ResearchStudyOutcomeMeasure[];
  result?: Reference<"EvidenceReport" | "Citation" | "DiagnosticReport">[];
}
