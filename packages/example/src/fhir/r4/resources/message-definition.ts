import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUnsignedInt, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, ContactDetail, DomainResource, Identifier, UsageContext } from "../datatypes.js";

export interface MessageDefinitionFocus extends BackboneElement {
  code: FhirCode;
  profile?: FhirCanonical;
  min: FhirUnsignedInt;
  max?: FhirString;
}

export interface MessageDefinitionAllowedResponse extends BackboneElement {
  message: FhirCanonical;
  situation?: FhirMarkdown;
}

export interface MessageDefinition extends DomainResource {
  resourceType: "MessageDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  replaces?: FhirCanonical[];
  status: FhirCode;
  experimental?: FhirBoolean;
  date: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  base?: FhirCanonical;
  parent?: FhirCanonical[];
  eventCoding?: Coding;
  eventUri?: FhirUri;
  category?: FhirCode;
  focus?: MessageDefinitionFocus[];
  responseRequired?: FhirCode;
  allowedResponse?: MessageDefinitionAllowedResponse[];
  graph?: FhirCanonical[];
}
