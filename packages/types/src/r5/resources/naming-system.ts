import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface NamingSystemUniqueId extends BackboneElement {
  type: FhirCode;
  value: FhirString;
  preferred?: FhirBoolean;
  comment?: FhirString;
  period?: Period;
  authoritative?: FhirBoolean;
}

export interface NamingSystem extends DomainResource {
  resourceType: "NamingSystem";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  versionAlgorithmString?: FhirString;
  versionAlgorithmCoding?: Coding;
  name: FhirString;
  title?: FhirString;
  status: FhirCode;
  kind: FhirCode;
  experimental?: FhirBoolean;
  date: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  responsible?: FhirString;
  type?: CodeableConcept;
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
  usage?: FhirString;
  uniqueId: NamingSystemUniqueId[];
}
