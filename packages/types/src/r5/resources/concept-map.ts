import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ConceptMapProperty extends BackboneElement {
  code: FhirCode;
  uri?: FhirUri;
  description?: FhirString;
  type: FhirCode;
  system?: FhirCanonical;
}

export interface ConceptMapAdditionalAttribute extends BackboneElement {
  code: FhirCode;
  uri?: FhirUri;
  description?: FhirString;
  type: FhirCode;
}

export interface ConceptMapGroupElementTargetProperty extends BackboneElement {
  code: FhirCode;
  valueCoding?: Coding;
  valueString?: FhirString;
  valueInteger?: FhirInteger;
  valueBoolean?: FhirBoolean;
  valueDateTime?: FhirDateTime;
  valueDecimal?: FhirDecimal;
  valueCode?: FhirCode;
}

export interface ConceptMapGroupElementTargetDependsOn extends BackboneElement {
  attribute: FhirCode;
  valueCode?: FhirCode;
  valueCoding?: Coding;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueSet?: FhirCanonical;
}

export interface ConceptMapGroupElementTarget extends BackboneElement {
  code?: FhirCode;
  display?: FhirString;
  valueSet?: FhirCanonical;
  relationship: FhirCode;
  comment?: FhirString;
  property?: ConceptMapGroupElementTargetProperty[];
  dependsOn?: ConceptMapGroupElementTargetDependsOn[];
  product?: ConceptMapGroupElementTargetDependsOn[];
}

export interface ConceptMapGroupElement extends BackboneElement {
  code?: FhirCode;
  display?: FhirString;
  valueSet?: FhirCanonical;
  noMap?: FhirBoolean;
  target?: ConceptMapGroupElementTarget[];
}

export interface ConceptMapGroupUnmapped extends BackboneElement {
  mode: FhirCode;
  code?: FhirCode;
  display?: FhirString;
  valueSet?: FhirCanonical;
  relationship?: FhirCode;
  otherMap?: FhirCanonical;
}

export interface ConceptMapGroup extends BackboneElement {
  source?: FhirCanonical;
  target?: FhirCanonical;
  element: ConceptMapGroupElement[];
  unmapped?: ConceptMapGroupUnmapped;
}

export interface ConceptMap extends DomainResource {
  resourceType: "ConceptMap";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
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
  copyrightLabel?: FhirString;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  property?: ConceptMapProperty[];
  additionalAttribute?: ConceptMapAdditionalAttribute[];
  sourceScopeUri?: FhirUri;
  sourceScopeCanonical?: FhirCanonical;
  targetScopeUri?: FhirUri;
  targetScopeCanonical?: FhirCanonical;
  group?: ConceptMapGroup[];
}
