import type {
  Annotation,
  CodeableConcept,
  DomainResource,
  Dosage,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface MedicationStatement extends DomainResource {
  resourceType: "MedicationStatement";
  identifier?: Identifier[];
  basedOn?: Reference<"MedicationRequest" | "CarePlan" | "ServiceRequest">[];
  partOf?: Reference<
    "MedicationAdministration" | "MedicationDispense" | "MedicationStatement" | "Procedure" | "Observation"
  >[];
  status: FhirCode;
  statusReason?: CodeableConcept[];
  category?: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"Medication">;
  subject: Reference<"Patient" | "Group">;
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  dateAsserted?: FhirDateTime;
  informationSource?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">;
  derivedFrom?: Reference<"Resource">[];
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport">[];
  note?: Annotation[];
  dosage?: Dosage[];
}
