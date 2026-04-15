import type { FhirCode, FhirDate, FhirDateTime, FhirDecimal, FhirInteger, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, ContactDetail, DomainResource, Identifier, Period, Reference, RelatedArtifact, UsageContext } from "../datatypes.js";

export interface EffectEvidenceSynthesisSampleSize extends BackboneElement {
  description?: FhirString;
  numberOfStudies?: FhirInteger;
  numberOfParticipants?: FhirInteger;
}

export interface EffectEvidenceSynthesisResultsByExposure extends BackboneElement {
  description?: FhirString;
  exposureState?: FhirCode;
  variantState?: CodeableConcept;
  riskEvidenceSynthesis: Reference<"RiskEvidenceSynthesis">;
}

export interface EffectEvidenceSynthesisEffectEstimatePrecisionEstimate extends BackboneElement {
  type?: CodeableConcept;
  level?: FhirDecimal;
  from?: FhirDecimal;
  to?: FhirDecimal;
}

export interface EffectEvidenceSynthesisEffectEstimate extends BackboneElement {
  description?: FhirString;
  type?: CodeableConcept;
  variantState?: CodeableConcept;
  value?: FhirDecimal;
  unitOfMeasure?: CodeableConcept;
  precisionEstimate?: EffectEvidenceSynthesisEffectEstimatePrecisionEstimate[];
}

export interface EffectEvidenceSynthesisCertaintyCertaintySubcomponent extends BackboneElement {
  type?: CodeableConcept;
  rating?: CodeableConcept[];
  note?: Annotation[];
}

export interface EffectEvidenceSynthesisCertainty extends BackboneElement {
  rating?: CodeableConcept[];
  note?: Annotation[];
  certaintySubcomponent?: EffectEvidenceSynthesisCertaintyCertaintySubcomponent[];
}

export interface EffectEvidenceSynthesis extends DomainResource {
  resourceType: "EffectEvidenceSynthesis";
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
  exposure: Reference<"EvidenceVariable">;
  exposureAlternative: Reference<"EvidenceVariable">;
  outcome: Reference<"EvidenceVariable">;
  sampleSize?: EffectEvidenceSynthesisSampleSize;
  resultsByExposure?: EffectEvidenceSynthesisResultsByExposure[];
  effectEstimate?: EffectEvidenceSynthesisEffectEstimate[];
  certainty?: EffectEvidenceSynthesisCertainty[];
}
