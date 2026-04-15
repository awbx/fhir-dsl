import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirId, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, ContactDetail, DomainResource, ElementDefinition, Identifier, UsageContext } from "../datatypes.js";

export interface StructureDefinitionMapping extends BackboneElement {
  identity: FhirId;
  uri?: FhirUri;
  name?: FhirString;
  comment?: FhirString;
}

export interface StructureDefinitionContext extends BackboneElement {
  type: FhirCode;
  expression: FhirString;
}

export interface StructureDefinitionSnapshot extends BackboneElement {
  element: ElementDefinition[];
}

export interface StructureDefinitionDifferential extends BackboneElement {
  element: ElementDefinition[];
}

export interface StructureDefinition extends DomainResource {
  resourceType: "StructureDefinition";
  url: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
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
  keyword?: Coding[];
  fhirVersion?: FhirCode;
  mapping?: StructureDefinitionMapping[];
  kind: FhirCode;
  abstract: FhirBoolean;
  context?: StructureDefinitionContext[];
  contextInvariant?: FhirString[];
  type: FhirUri;
  baseDefinition?: FhirCanonical;
  derivation?: FhirCode;
  snapshot?: StructureDefinitionSnapshot;
  differential?: StructureDefinitionDifferential;
}
