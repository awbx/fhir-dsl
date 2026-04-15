import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
  RelatedArtifact,
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

export interface ArtifactAssessmentContent extends BackboneElement {
  informationType?: FhirCode;
  summary?: FhirMarkdown;
  type?: CodeableConcept;
  classifier?: CodeableConcept[];
  quantity?: Quantity;
  author?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Organization" | "Device">;
  path?: FhirUri[];
  relatedArtifact?: RelatedArtifact[];
  freeToShare?: FhirBoolean;
  component?: ArtifactAssessmentContent[];
}

export interface ArtifactAssessment extends DomainResource {
  resourceType: "ArtifactAssessment";
  identifier?: Identifier[];
  title?: FhirString;
  citeAsReference?: Reference<"Citation">;
  citeAsMarkdown?: FhirMarkdown;
  date?: FhirDateTime;
  copyright?: FhirMarkdown;
  approvalDate?: FhirDate;
  lastReviewDate?: FhirDate;
  artifactReference?: Reference<"Resource">;
  artifactCanonical?: FhirCanonical;
  artifactUri?: FhirUri;
  content?: ArtifactAssessmentContent[];
  workflowStatus?: FhirCode;
  disposition?: FhirCode;
}
