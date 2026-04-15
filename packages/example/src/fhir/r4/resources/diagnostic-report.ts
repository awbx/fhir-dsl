import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirInstant, FhirString } from "../primitives.js";

export interface DiagnosticReportMedia extends BackboneElement {
  comment?: FhirString;
  link: Reference<"Media">;
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
  subject?: Reference<"Patient" | "Group" | "Device" | "Location">;
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  issued?: FhirInstant;
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam">[];
  resultsInterpreter?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "CareTeam">[];
  specimen?: Reference<"Specimen">[];
  result?: Reference<"Observation">[];
  imagingStudy?: Reference<"ImagingStudy">[];
  media?: DiagnosticReportMedia[];
  conclusion?: FhirString;
  conclusionCode?: CodeableConcept[];
  presentedForm?: Attachment[];
}
