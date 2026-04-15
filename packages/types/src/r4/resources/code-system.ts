import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirDecimal, FhirInteger, FhirMarkdown, FhirString, FhirUnsignedInt, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, ContactDetail, DomainResource, Identifier, UsageContext } from "../datatypes.js";

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
