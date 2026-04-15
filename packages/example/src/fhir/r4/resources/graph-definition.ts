import type { BackboneElement, CodeableConcept, ContactDetail, DomainResource, UsageContext } from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface GraphDefinitionLinkTargetCompartment extends BackboneElement {
  use: FhirCode;
  code: FhirCode;
  rule: FhirCode;
  expression?: FhirString;
  description?: FhirString;
}

export interface GraphDefinitionLinkTarget extends BackboneElement {
  type: FhirCode;
  params?: FhirString;
  profile?: FhirCanonical;
  compartment?: GraphDefinitionLinkTargetCompartment[];
  link?: GraphDefinitionLink[];
}

export interface GraphDefinitionLink extends BackboneElement {
  path?: FhirString;
  sliceName?: FhirString;
  min?: FhirInteger;
  max?: FhirString;
  description?: FhirString;
  target?: GraphDefinitionLinkTarget[];
}

export interface GraphDefinition extends DomainResource {
  resourceType: "GraphDefinition";
  url?: FhirUri;
  version?: FhirString;
  name: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  start: FhirCode;
  profile?: FhirCanonical;
  link?: GraphDefinitionLink[];
}
