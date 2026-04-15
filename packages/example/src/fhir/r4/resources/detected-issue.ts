import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface DetectedIssueEvidence extends BackboneElement {
  code?: CodeableConcept[];
  detail?: Reference<"Resource">[];
}

export interface DetectedIssueMitigation extends BackboneElement {
  action: CodeableConcept;
  date?: FhirDateTime;
  author?: Reference<"Practitioner" | "PractitionerRole">;
}

export interface DetectedIssue extends DomainResource {
  resourceType: "DetectedIssue";
  identifier?: Identifier[];
  status: FhirCode;
  code?: CodeableConcept;
  severity?: FhirCode;
  patient?: Reference<"Patient">;
  identifiedDateTime?: FhirDateTime;
  identifiedPeriod?: Period;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Device">;
  implicated?: Reference<"Resource">[];
  evidence?: DetectedIssueEvidence[];
  detail?: FhirString;
  reference?: FhirUri;
  mitigation?: DetectedIssueMitigation[];
}
