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
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface SearchParameterComponent extends BackboneElement {
  definition: FhirCanonical;
  expression: FhirString;
}

export interface SearchParameter extends DomainResource {
  resourceType: "SearchParameter";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name: FhirString;
  title?: FhirString;
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
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  code: FhirCode;
  base: FhirCode[];
  type: FhirCode;
  expression?: FhirString;
  processingMode?: FhirCode;
  constraint?: FhirString;
  target?: FhirCode[];
  multipleOr?: FhirBoolean;
  multipleAnd?: FhirBoolean;
  comparator?: FhirCode[];
  modifier?: FhirCode[];
  chain?: FhirString[];
  component?: SearchParameterComponent[];
}
