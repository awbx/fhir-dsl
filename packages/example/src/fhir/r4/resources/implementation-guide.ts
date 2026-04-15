import type {
  BackboneElement,
  CodeableConcept,
  ContactDetail,
  DomainResource,
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
}

export interface ImplementationGuideGlobal extends BackboneElement {
  type: FhirCode;
  profile: FhirCanonical;
}

export interface ImplementationGuideDefinitionGrouping extends BackboneElement {
  name: FhirString;
  description?: FhirString;
}

export interface ImplementationGuideDefinitionResource extends BackboneElement {
  reference: Reference<"Resource">;
  fhirVersion?: FhirCode[];
  name?: FhirString;
  description?: FhirString;
  exampleBoolean?: FhirBoolean;
  exampleCanonical?: FhirCanonical;
  groupingId?: FhirId;
}

export interface ImplementationGuideDefinitionPage extends BackboneElement {
  nameUrl?: FhirUrl;
  nameReference?: Reference<"Binary">;
  title: FhirString;
  generation: FhirCode;
  page?: ImplementationGuideDefinitionPage[];
}

export interface ImplementationGuideDefinitionParameter extends BackboneElement {
  code: FhirCode;
  value: FhirString;
}

export interface ImplementationGuideDefinitionTemplate extends BackboneElement {
  code: FhirCode;
  source: FhirString;
  scope?: FhirString;
}

export interface ImplementationGuideDefinition extends BackboneElement {
  grouping?: ImplementationGuideDefinitionGrouping[];
  resource: ImplementationGuideDefinitionResource[];
  page?: ImplementationGuideDefinitionPage;
  parameter?: ImplementationGuideDefinitionParameter[];
  template?: ImplementationGuideDefinitionTemplate[];
}

export interface ImplementationGuideManifestResource extends BackboneElement {
  reference: Reference<"Resource">;
  exampleBoolean?: FhirBoolean;
  exampleCanonical?: FhirCanonical;
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
  copyright?: FhirMarkdown;
  packageId: FhirId;
  license?: FhirCode;
  fhirVersion: FhirCode[];
  dependsOn?: ImplementationGuideDependsOn[];
  global?: ImplementationGuideGlobal[];
  definition?: ImplementationGuideDefinition;
  manifest?: ImplementationGuideManifest;
}
