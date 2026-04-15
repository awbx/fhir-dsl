import type {
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  TriggerDefinition,
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

export interface EventDefinition extends DomainResource {
  resourceType: "EventDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
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
  trigger: TriggerDefinition[];
}
