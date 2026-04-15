import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DataRequirement,
  DomainResource,
  Duration,
  Expression,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  Timing,
  TriggerDefinition,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface EvidenceVariableCharacteristic extends BackboneElement {
  description?: FhirString;
  definitionReference?: Reference<"Group">;
  definitionCanonical?: FhirCanonical;
  definitionCodeableConcept?: CodeableConcept;
  definitionExpression?: Expression;
  definitionDataRequirement?: DataRequirement;
  definitionTriggerDefinition?: TriggerDefinition;
  usageContext?: UsageContext[];
  exclude?: FhirBoolean;
  participantEffectiveDateTime?: FhirDateTime;
  participantEffectivePeriod?: Period;
  participantEffectiveDuration?: Duration;
  participantEffectiveTiming?: Timing;
  timeFromStart?: Duration;
  groupMeasure?: FhirCode;
}

export interface EvidenceVariable extends DomainResource {
  resourceType: "EvidenceVariable";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  shortTitle?: FhirString;
  subtitle?: FhirString;
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
  type?: FhirCode;
  characteristic: EvidenceVariableCharacteristic[];
}
