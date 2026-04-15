import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirMarkdown, FhirUri } from "../primitives.js";

export interface DetectedIssueEvidence extends BackboneElement {
  code?: CodeableConcept[];
  detail?: Reference<"Resource">[];
}

export interface DetectedIssueMitigation extends BackboneElement {
  action: CodeableConcept;
  date?: FhirDateTime;
  author?: Reference<"Practitioner" | "PractitionerRole">;
  note?: Annotation[];
}

export interface DetectedIssue extends DomainResource {
  resourceType: "DetectedIssue";
  identifier?: Identifier[];
  status: FhirCode;
  category?: CodeableConcept[];
  code?: CodeableConcept;
  severity?: FhirCode;
  subject?: Reference<
    | "Patient"
    | "Group"
    | "Device"
    | "Location"
    | "Organization"
    | "Procedure"
    | "Practitioner"
    | "Medication"
    | "Substance"
    | "BiologicallyDerivedProduct"
    | "NutritionProduct"
  >;
  encounter?: Reference<"Encounter">;
  identifiedDateTime?: FhirDateTime;
  identifiedPeriod?: Period;
  author?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Device">;
  implicated?: Reference<"Resource">[];
  evidence?: DetectedIssueEvidence[];
  detail?: FhirMarkdown;
  reference?: FhirUri;
  mitigation?: DetectedIssueMitigation[];
}
