import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirMarkdown, FhirString, FhirUnsignedInt, FhirUri, FhirUrl } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, ContactDetail, DomainResource, Reference, UsageContext } from "../datatypes.js";

export interface CapabilityStatementSoftware extends BackboneElement {
  name: FhirString;
  version?: FhirString;
  releaseDate?: FhirDateTime;
}

export interface CapabilityStatementImplementation extends BackboneElement {
  description: FhirString;
  url?: FhirUrl;
  custodian?: Reference<"Organization">;
}

export interface CapabilityStatementRestSecurity extends BackboneElement {
  cors?: FhirBoolean;
  service?: CodeableConcept[];
  description?: FhirMarkdown;
}

export interface CapabilityStatementRestResourceInteraction extends BackboneElement {
  code: FhirCode;
  documentation?: FhirMarkdown;
}

export interface CapabilityStatementRestResourceSearchParam extends BackboneElement {
  name: FhirString;
  definition?: FhirCanonical;
  type: FhirCode;
  documentation?: FhirMarkdown;
}

export interface CapabilityStatementRestResourceOperation extends BackboneElement {
  name: FhirString;
  definition: FhirCanonical;
  documentation?: FhirMarkdown;
}

export interface CapabilityStatementRestResource extends BackboneElement {
  type: FhirCode;
  profile?: FhirCanonical;
  supportedProfile?: FhirCanonical[];
  documentation?: FhirMarkdown;
  interaction?: CapabilityStatementRestResourceInteraction[];
  versioning?: FhirCode;
  readHistory?: FhirBoolean;
  updateCreate?: FhirBoolean;
  conditionalCreate?: FhirBoolean;
  conditionalRead?: FhirCode;
  conditionalUpdate?: FhirBoolean;
  conditionalDelete?: FhirCode;
  referencePolicy?: FhirCode[];
  searchInclude?: FhirString[];
  searchRevInclude?: FhirString[];
  searchParam?: CapabilityStatementRestResourceSearchParam[];
  operation?: CapabilityStatementRestResourceOperation[];
}

export interface CapabilityStatementRestInteraction extends BackboneElement {
  code: FhirCode;
  documentation?: FhirMarkdown;
}

export interface CapabilityStatementRest extends BackboneElement {
  mode: FhirCode;
  documentation?: FhirMarkdown;
  security?: CapabilityStatementRestSecurity;
  resource?: CapabilityStatementRestResource[];
  interaction?: CapabilityStatementRestInteraction[];
  searchParam?: CapabilityStatementRestResourceSearchParam[];
  operation?: CapabilityStatementRestResourceOperation[];
  compartment?: FhirCanonical[];
}

export interface CapabilityStatementMessagingEndpoint extends BackboneElement {
  protocol: Coding;
  address: FhirUrl;
}

export interface CapabilityStatementMessagingSupportedMessage extends BackboneElement {
  mode: FhirCode;
  definition: FhirCanonical;
}

export interface CapabilityStatementMessaging extends BackboneElement {
  endpoint?: CapabilityStatementMessagingEndpoint[];
  reliableCache?: FhirUnsignedInt;
  documentation?: FhirMarkdown;
  supportedMessage?: CapabilityStatementMessagingSupportedMessage[];
}

export interface CapabilityStatementDocument extends BackboneElement {
  mode: FhirCode;
  documentation?: FhirMarkdown;
  profile: FhirCanonical;
}

export interface CapabilityStatement extends DomainResource {
  resourceType: "CapabilityStatement";
  url?: FhirUri;
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  date: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  copyright?: FhirMarkdown;
  kind: FhirCode;
  instantiates?: FhirCanonical[];
  imports?: FhirCanonical[];
  software?: CapabilityStatementSoftware;
  implementation?: CapabilityStatementImplementation;
  fhirVersion: FhirCode;
  format: FhirCode[];
  patchFormat?: FhirCode[];
  implementationGuide?: FhirCanonical[];
  rest?: CapabilityStatementRest[];
  messaging?: CapabilityStatementMessaging[];
  document?: CapabilityStatementDocument[];
}
