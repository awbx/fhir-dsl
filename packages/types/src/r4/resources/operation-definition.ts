import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirInteger, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, ContactDetail, DomainResource, UsageContext } from "../datatypes.js";

export interface OperationDefinitionParameterBinding extends BackboneElement {
  strength: FhirCode;
  valueSet: FhirCanonical;
}

export interface OperationDefinitionParameterReferencedFrom extends BackboneElement {
  source: FhirString;
  sourceId?: FhirString;
}

export interface OperationDefinitionParameter extends BackboneElement {
  name: FhirCode;
  use: FhirCode;
  min: FhirInteger;
  max: FhirString;
  documentation?: FhirString;
  type?: FhirCode;
  targetProfile?: FhirCanonical[];
  searchType?: FhirCode;
  binding?: OperationDefinitionParameterBinding;
  referencedFrom?: OperationDefinitionParameterReferencedFrom[];
  part?: OperationDefinitionParameter[];
}

export interface OperationDefinitionOverload extends BackboneElement {
  parameterName?: FhirString[];
  comment?: FhirString;
}

export interface OperationDefinition extends DomainResource {
  resourceType: "OperationDefinition";
  url?: FhirUri;
  version?: FhirString;
  name: FhirString;
  title?: FhirString;
  status: FhirCode;
  kind: FhirCode;
  experimental?: FhirBoolean;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  affectsState?: FhirBoolean;
  code: FhirCode;
  comment?: FhirMarkdown;
  base?: FhirCanonical;
  resource?: FhirCode[];
  system: FhirBoolean;
  type: FhirBoolean;
  instance: FhirBoolean;
  inputProfile?: FhirCanonical;
  outputProfile?: FhirCanonical;
  parameter?: OperationDefinitionParameter[];
  overload?: OperationDefinitionOverload[];
}
