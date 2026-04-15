import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUnsignedInt,
  FhirUri,
} from "../primitives.js";

export interface CodeSystemFilter extends BackboneElement {
  code: FhirCode;
  description?: FhirString;
  operator: FhirCode[];
  value: FhirString;
}

export interface CodeSystemProperty extends BackboneElement {
  code: FhirCode;
  uri?: FhirUri;
  description?: FhirString;
  type: FhirCode;
}

export interface CodeSystemConceptDesignation extends BackboneElement {
  language?: FhirCode;
  use?: Coding;
  additionalUse?: Coding[];
  value: FhirString;
}

export interface CodeSystemConceptProperty extends BackboneElement {
  code: FhirCode;
  valueCode?: FhirCode;
  valueCoding?: Coding;
  valueString?: FhirString;
  valueInteger?: FhirInteger;
  valueBoolean?: FhirBoolean;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
}

export interface CodeSystemConcept extends BackboneElement {
  code: FhirCode;
  display?: FhirString;
  definition?: FhirString;
  designation?: CodeSystemConceptDesignation[];
  property?: CodeSystemConceptProperty[];
  concept?: CodeSystemConcept[];
}

export interface CodeSystem extends DomainResource {
  resourceType: "CodeSystem";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name?: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  caseSensitive?: FhirBoolean;
  valueSet?: FhirCanonical;
  hierarchyMeaning?: FhirCode;
  compositional?: FhirBoolean;
  versionNeeded?: FhirBoolean;
  content: FhirCode;
  supplements?: FhirCanonical;
  count?: FhirUnsignedInt;
  filter?: CodeSystemFilter[];
  property?: CodeSystemProperty[];
  concept?: CodeSystemConcept[];
}
