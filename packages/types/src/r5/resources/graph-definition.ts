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
  FhirId,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface GraphDefinitionNode extends BackboneElement {
  nodeId: FhirId;
  description?: FhirString;
  type: FhirCode;
  profile?: FhirCanonical;
}

export interface GraphDefinitionLinkCompartment extends BackboneElement {
  use: FhirCode;
  rule: FhirCode;
  code: FhirCode;
  expression?: FhirString;
  description?: FhirString;
}

export interface GraphDefinitionLink extends BackboneElement {
  description?: FhirString;
  min?: FhirInteger;
  max?: FhirString;
  sourceId: FhirId;
  path?: FhirString;
  sliceName?: FhirString;
  targetId: FhirId;
  params?: FhirString;
  compartment?: GraphDefinitionLinkCompartment[];
}

export interface GraphDefinition extends DomainResource {
  resourceType: "GraphDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
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
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  copyrightLabel?: FhirString;
  start?: FhirId;
  node?: GraphDefinitionNode[];
  link?: GraphDefinitionLink[];
}
