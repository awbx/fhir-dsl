import type { FhirBoolean, FhirCanonical, FhirCode, FhirDate, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, ContactDetail, DataRequirement, DomainResource, Duration, Expression, Identifier, Period, Reference, RelatedArtifact, Timing, UsageContext } from "../datatypes.js";

export interface ResearchElementDefinitionCharacteristic extends BackboneElement {
  definitionCodeableConcept?: CodeableConcept;
  definitionCanonical?: FhirCanonical;
  definitionExpression?: Expression;
  definitionDataRequirement?: DataRequirement;
  usageContext?: UsageContext[];
  exclude?: FhirBoolean;
  unitOfMeasure?: CodeableConcept;
  studyEffectiveDescription?: FhirString;
  studyEffectiveDateTime?: FhirDateTime;
  studyEffectivePeriod?: Period;
  studyEffectiveDuration?: Duration;
  studyEffectiveTiming?: Timing;
  studyEffectiveTimeFromStart?: Duration;
  studyEffectiveGroupMeasure?: FhirCode;
  participantEffectiveDescription?: FhirString;
  participantEffectiveDateTime?: FhirDateTime;
  participantEffectivePeriod?: Period;
  participantEffectiveDuration?: Duration;
  participantEffectiveTiming?: Timing;
  participantEffectiveTimeFromStart?: Duration;
  participantEffectiveGroupMeasure?: FhirCode;
}

export interface ResearchElementDefinition extends DomainResource {
  resourceType: "ResearchElementDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  shortTitle?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  comment?: FhirString[];
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirString;
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
  library?: FhirCanonical[];
  type: FhirCode;
  variableType?: FhirCode;
  characteristic: ResearchElementDefinitionCharacteristic[];
}
