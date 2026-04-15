import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
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
}

export interface ValueSetCompose extends BackboneElement {
  lockedDate?: FhirDate;
  inactive?: FhirBoolean;
  include: ValueSetComposeInclude[];
  exclude?: ValueSetComposeInclude[];
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

export interface ValueSetExpansionContains extends BackboneElement {
  system?: FhirUri;
  abstract?: FhirBoolean;
  inactive?: FhirBoolean;
  version?: FhirString;
  code?: FhirCode;
  display?: FhirString;
  designation?: ValueSetComposeIncludeConceptDesignation[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSetExpansion extends BackboneElement {
  identifier?: FhirUri;
  timestamp: FhirDateTime;
  total?: FhirInteger;
  offset?: FhirInteger;
  parameter?: ValueSetExpansionParameter[];
  contains?: ValueSetExpansionContains[];
}

export interface ValueSet extends DomainResource {
  resourceType: "ValueSet";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
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
  compose?: ValueSetCompose;
  expansion?: ValueSetExpansion;
}
