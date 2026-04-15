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

export interface RequirementsStatement extends BackboneElement {
  key: FhirId;
  label?: FhirString;
  conformance?: FhirCode[];
  conditionality?: FhirBoolean;
  requirement: FhirMarkdown;
  derivedFrom?: FhirString;
  parent?: FhirString;
  satisfiedBy?: FhirUrl[];
  reference?: FhirUrl[];
  source?: Reference<
    | "CareTeam"
    | "Device"
    | "Group"
    | "HealthcareService"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
  >[];
}

export interface Requirements extends DomainResource {
  resourceType: "Requirements";
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
  derivedFrom?: FhirCanonical[];
  reference?: FhirUrl[];
  actor?: FhirCanonical[];
  statement?: RequirementsStatement[];
}
