import type { BackboneElement, Coding, ContactDetail, DomainResource, UsageContext } from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface CompartmentDefinitionResource extends BackboneElement {
  code: FhirCode;
  param?: FhirString[];
  documentation?: FhirString;
  startParam?: FhirUri;
  endParam?: FhirUri;
}

export interface CompartmentDefinition extends DomainResource {
  resourceType: "CompartmentDefinition";
  url: FhirUri;
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  purpose?: FhirMarkdown;
  code: FhirCode;
  search: FhirBoolean;
  resource?: CompartmentDefinitionResource[];
}
