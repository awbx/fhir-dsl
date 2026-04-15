import type { BackboneElement, CodeableConcept, ContactDetail, DomainResource, UsageContext } from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
  FhirUrl,
} from "../primitives.js";

export interface TerminologyCapabilitiesSoftware extends BackboneElement {
  name: FhirString;
  version?: FhirString;
}

export interface TerminologyCapabilitiesImplementation extends BackboneElement {
  description: FhirString;
  url?: FhirUrl;
}

export interface TerminologyCapabilitiesCodeSystemVersionFilter extends BackboneElement {
  code: FhirCode;
  op: FhirCode[];
}

export interface TerminologyCapabilitiesCodeSystemVersion extends BackboneElement {
  code?: FhirString;
  isDefault?: FhirBoolean;
  compositional?: FhirBoolean;
  language?: FhirCode[];
  filter?: TerminologyCapabilitiesCodeSystemVersionFilter[];
  property?: FhirCode[];
}

export interface TerminologyCapabilitiesCodeSystem extends BackboneElement {
  uri?: FhirCanonical;
  version?: TerminologyCapabilitiesCodeSystemVersion[];
  subsumption?: FhirBoolean;
}

export interface TerminologyCapabilitiesExpansionParameter extends BackboneElement {
  name: FhirCode;
  documentation?: FhirString;
}

export interface TerminologyCapabilitiesExpansion extends BackboneElement {
  hierarchical?: FhirBoolean;
  paging?: FhirBoolean;
  incomplete?: FhirBoolean;
  parameter?: TerminologyCapabilitiesExpansionParameter[];
  textFilter?: FhirMarkdown;
}

export interface TerminologyCapabilitiesValidateCode extends BackboneElement {
  translations: FhirBoolean;
}

export interface TerminologyCapabilitiesTranslation extends BackboneElement {
  needsMap: FhirBoolean;
}

export interface TerminologyCapabilitiesClosure extends BackboneElement {
  translation?: FhirBoolean;
}

export interface TerminologyCapabilities extends DomainResource {
  resourceType: "TerminologyCapabilities";
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
  software?: TerminologyCapabilitiesSoftware;
  implementation?: TerminologyCapabilitiesImplementation;
  lockedDate?: FhirBoolean;
  codeSystem?: TerminologyCapabilitiesCodeSystem[];
  expansion?: TerminologyCapabilitiesExpansion;
  codeSearch?: FhirCode;
  validateCode?: TerminologyCapabilitiesValidateCode;
  translation?: TerminologyCapabilitiesTranslation;
  closure?: TerminologyCapabilitiesClosure;
}
