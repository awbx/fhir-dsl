import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirInstant, FhirMarkdown, FhirString } from "../primitives.js";

export interface DiagnosticReportSupportingInfo extends BackboneElement {
  type: CodeableConcept;
  reference: Reference<"Procedure" | "Observation" | "DiagnosticReport" | "Citation">;
}

export interface DiagnosticReportMedia extends BackboneElement {
  comment?: FhirString;
  link: Reference<"DocumentReference">;
}

export interface DiagnosticReport extends DomainResource {
  resourceType: "DiagnosticReport";
  identifier?: Identifier[];
  basedOn?: Reference<
    "CarePlan" | "ImmunizationRecommendation" | "MedicationRequest" | "NutritionOrder" | "ServiceRequest"
  >[];
  status: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject?: Reference<
    | "Patient"
    | "Group"
    | "Device"
    | "Location"
    | "Organization"
    | "Practitioner"
    | "Medication"
    | "Substance"
    | "BiologicallyDerivedProduct"
  >;
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  issued?: FhirInstant;
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam">[];
  resultsInterpreter?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam">[];
  specimen?: Reference<"Specimen">[];
  result?: Reference<"Observation">[];
  note?: Annotation[];
  study?: Reference<"GenomicStudy" | "ImagingStudy">[];
  supportingInfo?: DiagnosticReportSupportingInfo[];
  media?: DiagnosticReportMedia[];
  composition?: Reference<"Composition">;
  conclusion?: FhirMarkdown;
  conclusionCode?: CodeableConcept[];
  presentedForm?: Attachment[];
}
