import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface RiskEvidenceSynthesisSampleSize extends BackboneElement {
  description?: FhirString;
  numberOfStudies?: FhirInteger;
  numberOfParticipants?: FhirInteger;
}

export interface RiskEvidenceSynthesisRiskEstimatePrecisionEstimate extends BackboneElement {
  type?: CodeableConcept;
  level?: FhirDecimal;
  from?: FhirDecimal;
  to?: FhirDecimal;
}

export interface RiskEvidenceSynthesisRiskEstimate extends BackboneElement {
  description?: FhirString;
  type?: CodeableConcept;
  value?: FhirDecimal;
  unitOfMeasure?: CodeableConcept;
  denominatorCount?: FhirInteger;
  numeratorCount?: FhirInteger;
  precisionEstimate?: RiskEvidenceSynthesisRiskEstimatePrecisionEstimate[];
}

export interface RiskEvidenceSynthesisCertaintyCertaintySubcomponent extends BackboneElement {
  type?: CodeableConcept;
  rating?: CodeableConcept[];
  note?: Annotation[];
}

export interface RiskEvidenceSynthesisCertainty extends BackboneElement {
  rating?: CodeableConcept[];
  note?: Annotation[];
  certaintySubcomponent?: RiskEvidenceSynthesisCertaintyCertaintySubcomponent[];
}

export interface RiskEvidenceSynthesis extends DomainResource {
  resourceType: "RiskEvidenceSynthesis";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  status: FhirCode;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  note?: Annotation[];
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  synthesisType?: CodeableConcept;
  studyType?: CodeableConcept;
  population: Reference<"EvidenceVariable">;
  exposure?: Reference<"EvidenceVariable">;
  outcome: Reference<"EvidenceVariable">;
  sampleSize?: RiskEvidenceSynthesisSampleSize;
  riskEstimate?: RiskEvidenceSynthesisRiskEstimate;
  certainty?: RiskEvidenceSynthesisCertainty[];
}
