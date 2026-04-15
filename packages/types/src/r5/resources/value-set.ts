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
  FhirUri,
} from "../primitives.js";

export interface ValueSetComposeIncludeConceptDesignation extends BackboneElement {
  language?: FhirCode;
  use?: Coding;
  additionalUse?: Coding[];
  value: FhirString;
}

export interface ValueSetComposeIncludeConcept extends BackboneElement {
  code: FhirCode;
  display?: FhirString;
  designation?: ValueSetComposeIncludeConceptDesignation[];
}

export interface ValueSetComposeIncludeFilter extends BackboneElement {
  property: FhirCode;
  op: FhirCode;
  value: FhirString;
}

export interface ValueSetComposeInclude extends BackboneElement {
  system?: FhirUri;
  version?: FhirString;
  concept?: ValueSetComposeIncludeConcept[];
  filter?: ValueSetComposeIncludeFilter[];
  valueSet?: FhirCanonical[];
  copyright?: FhirString;
}

export interface ValueSetCompose extends BackboneElement {
  lockedDate?: FhirDate;
  inactive?: FhirBoolean;
  include: ValueSetComposeInclude[];
  exclude?: ValueSetComposeInclude[];
  property?: FhirString[];
}

export interface ValueSetExpansionParameter extends BackboneElement {
  name: FhirString;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
  valueUri?: FhirUri;
  valueCode?: FhirCode;
  valueDateTime?: FhirDateTime;
}

export interface ValueSetExpansionProperty extends BackboneElement {
  code: FhirCode;
  uri?: FhirUri;
}

export interface ValueSetExpansionContainsPropertySubProperty extends BackboneElement {
  code: FhirCode;
  valueCode?: FhirCode;
  valueCoding?: Coding;
  valueString?: FhirString;
  valueInteger?: FhirInteger;
  valueBoolean?: FhirBoolean;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
}

export interface ValueSetExpansionContainsProperty extends BackboneElement {
  code: FhirCode;
  valueCode?: FhirCode;
  valueCoding?: Coding;
  valueString?: FhirString;
  valueInteger?: FhirInteger;
  valueBoolean?: FhirBoolean;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
  subProperty?: ValueSetExpansionContainsPropertySubProperty[];
}

export interface ValueSetExpansionContains extends BackboneElement {
  system?: FhirUri;
  abstract?: FhirBoolean;
  inactive?: FhirBoolean;
  version?: FhirString;
  code?: FhirCode;
  display?: FhirString;
  designation?: ValueSetComposeIncludeConceptDesignation[];
  property?: ValueSetExpansionContainsProperty[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSetExpansion extends BackboneElement {
  identifier?: FhirUri;
  next?: FhirUri;
  timestamp: FhirDateTime;
  total?: FhirInteger;
  offset?: FhirInteger;
  parameter?: ValueSetExpansionParameter[];
  property?: ValueSetExpansionProperty[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSetScope extends BackboneElement {
  inclusionCriteria?: FhirString;
  exclusionCriteria?: FhirString;
}

export interface ValueSet extends DomainResource {
  resourceType: "ValueSet";
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
  immutable?: FhirBoolean;
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
  compose?: ValueSetCompose;
  expansion?: ValueSetExpansion;
  scope?: ValueSetScope;
}
