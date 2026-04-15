import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, ContactDetail, DomainResource, UsageContext } from "../datatypes.js";

export interface SearchParameterComponent extends BackboneElement {
  definition: FhirCanonical;
  expression: FhirString;
}

export interface SearchParameter extends DomainResource {
  resourceType: "SearchParameter";
  url: FhirUri;
  version?: FhirString;
  name: FhirString;
  derivedFrom?: FhirCanonical;
  status: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  code: FhirCode;
  base: FhirCode[];
  type: FhirCode;
  expression?: FhirString;
  xpath?: FhirString;
  xpathUsage?: FhirCode;
  target?: FhirCode[];
  multipleOr?: FhirBoolean;
  multipleAnd?: FhirBoolean;
  comparator?: FhirCode[];
  modifier?: FhirCode[];
  chain?: FhirString[];
  component?: SearchParameterComponent[];
}
