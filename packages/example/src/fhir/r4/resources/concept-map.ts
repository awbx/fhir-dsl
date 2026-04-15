import type {
  BackboneElement,
  CodeableConcept,
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

export interface ConceptMapGroupElementTargetDependsOn extends BackboneElement {
  property: FhirUri;
  system?: FhirCanonical;
  value: FhirString;
  display?: FhirString;
}

export interface ConceptMapGroupElementTarget extends BackboneElement {
  code?: FhirCode;
  display?: FhirString;
  equivalence: FhirCode;
  comment?: FhirString;
  dependsOn?: ConceptMapGroupElementTargetDependsOn[];
  product?: ConceptMapGroupElementTargetDependsOn[];
}

export interface ConceptMapGroupElement extends BackboneElement {
  code?: FhirCode;
  display?: FhirString;
  target?: ConceptMapGroupElementTarget[];
}

export interface ConceptMapGroupUnmapped extends BackboneElement {
  mode: FhirCode;
  code?: FhirCode;
  display?: FhirString;
  url?: FhirCanonical;
}

export interface ConceptMapGroup extends BackboneElement {
  source?: FhirUri;
  sourceVersion?: FhirString;
  target?: FhirUri;
  targetVersion?: FhirString;
  element: ConceptMapGroupElement[];
  unmapped?: ConceptMapGroupUnmapped;
}

export interface ConceptMap extends DomainResource {
  resourceType: "ConceptMap";
  url?: FhirUri;
  identifier?: Identifier;
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
  sourceUri?: FhirUri;
  sourceCanonical?: FhirCanonical;
  targetUri?: FhirUri;
  targetCanonical?: FhirCanonical;
  group?: ConceptMapGroup[];
}
