import type {
  Attachment,
  CodeableConcept,
  ContactDetail,
  DataRequirement,
  DomainResource,
  Identifier,
  ParameterDefinition,
  Period,
  Reference,
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

export interface Library extends DomainResource {
  resourceType: "Library";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  type: CodeableConcept;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  useContext?: UsageContext[];
  jurisdiction?: CodeableConcept[];
  purpose?: FhirMarkdown;
  usage?: FhirString;
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
  parameter?: ParameterDefinition[];
  dataRequirement?: DataRequirement[];
  content?: Attachment[];
}
