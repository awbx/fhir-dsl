import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Reference,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirId,
  FhirMarkdown,
  FhirString,
  FhirUri,
  FhirUrl,
} from "../primitives.js";

export interface ImplementationGuideDependsOn extends BackboneElement {
  uri: FhirCanonical;
  packageId?: FhirId;
  version?: FhirString;
  reason?: FhirMarkdown;
}

export interface ImplementationGuideGlobal extends BackboneElement {
  type: FhirCode;
  profile: FhirCanonical;
}

export interface ImplementationGuideDefinitionGrouping extends BackboneElement {
  name: FhirString;
  description?: FhirMarkdown;
}

export interface ImplementationGuideDefinitionResource extends BackboneElement {
  reference: Reference<"Resource">;
  fhirVersion?: FhirCode[];
  name?: FhirString;
  description?: FhirMarkdown;
  isExample?: FhirBoolean;
  profile?: FhirCanonical[];
  groupingId?: FhirId;
}

export interface ImplementationGuideDefinitionPage extends BackboneElement {
  sourceUrl?: FhirUrl;
  sourceString?: FhirString;
  sourceMarkdown?: FhirMarkdown;
  name: FhirUrl;
  title: FhirString;
  generation: FhirCode;
  page?: ImplementationGuideDefinitionPage[];
}

export interface ImplementationGuideDefinitionParameter extends BackboneElement {
  code: Coding;
  value: FhirString;
}

export interface ImplementationGuideDefinitionTemplate extends BackboneElement {
  code: FhirCode;
  source: FhirString;
  scope?: FhirString;
}

export interface ImplementationGuideDefinition extends BackboneElement {
  grouping?: ImplementationGuideDefinitionGrouping[];
  resource?: ImplementationGuideDefinitionResource[];
  page?: ImplementationGuideDefinitionPage;
  parameter?: ImplementationGuideDefinitionParameter[];
  template?: ImplementationGuideDefinitionTemplate[];
}

export interface ImplementationGuideManifestResource extends BackboneElement {
  reference: Reference<"Resource">;
  isExample?: FhirBoolean;
  profile?: FhirCanonical[];
  relativePath?: FhirUrl;
}

export interface ImplementationGuideManifestPage extends BackboneElement {
  name: FhirString;
  title?: FhirString;
  anchor?: FhirString[];
}

export interface ImplementationGuideManifest extends BackboneElement {
  rendering?: FhirUrl;
  resource: ImplementationGuideManifestResource[];
  page?: ImplementationGuideManifestPage[];
  image?: FhirString[];
  other?: FhirString[];
}

export interface ImplementationGuide extends DomainResource {
  resourceType: "ImplementationGuide";
  url: FhirUri;
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
  packageId: FhirId;
  license?: FhirCode;
  fhirVersion: FhirCode[];
  dependsOn?: ImplementationGuideDependsOn[];
  global?: ImplementationGuideGlobal[];
  definition?: ImplementationGuideDefinition;
  manifest?: ImplementationGuideManifest;
}
