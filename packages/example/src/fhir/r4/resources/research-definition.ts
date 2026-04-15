import type {
  CodeableConcept,
  ContactDetail,
  DomainResource,
  Identifier,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface ResearchDefinition extends DomainResource {
  resourceType: "ResearchDefinition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  name?: FhirString;
  title?: FhirString;
  shortTitle?: FhirString;
  subtitle?: FhirString;
  status: FhirCode;
  experimental?: FhirBoolean;
  subjectCodeableConcept?: CodeableConcept;
  subjectReference?: Reference<"Group">;
  date?: FhirDateTime;
  publisher?: FhirString;
  contact?: ContactDetail[];
  description?: FhirMarkdown;
  comment?: FhirString[];
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
  library?: FhirCanonical[];
  population: Reference<"ResearchElementDefinition">;
  exposure?: Reference<"ResearchElementDefinition">;
  exposureAlternative?: Reference<"ResearchElementDefinition">;
  outcome?: Reference<"ResearchElementDefinition">;
}
