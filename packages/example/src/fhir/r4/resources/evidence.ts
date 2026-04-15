import type {
  Annotation,
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type { FhirCode, FhirDate, FhirDateTime, FhirMarkdown, FhirString, FhirUri } from "../primitives.js";

export interface Evidence extends DomainResource {
  resourceType: "Evidence";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  shortTitle?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  note?: Annotation[];
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  effectivePeriod?: Period;
  topic?: CodeableConcept[];
  author?: ContactDetail[];
  editor?: ContactDetail[];
  reviewer?: ContactDetail[];
  endorser?: ContactDetail[];
  relatedArtifact?: RelatedArtifact[];
  exposureBackground: Reference<"EvidenceVariable">;
  exposureVariant?: Reference<"EvidenceVariable">[];
  outcome?: Reference<"EvidenceVariable">[];
}
