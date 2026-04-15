import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirId } from "../primitives.js";

export interface ResearchSubjectProgress extends BackboneElement {
  type?: CodeableConcept;
  subjectState?: CodeableConcept;
  milestone?: CodeableConcept;
  reason?: CodeableConcept;
  startDate?: FhirDateTime;
  endDate?: FhirDateTime;
}

export interface ResearchSubject extends DomainResource {
  resourceType: "ResearchSubject";
  identifier?: Identifier[];
  status: FhirCode;
  progress?: ResearchSubjectProgress[];
  period?: Period;
  study: Reference<"ResearchStudy">;
  subject: Reference<
    "Patient" | "Group" | "Specimen" | "Device" | "Medication" | "Substance" | "BiologicallyDerivedProduct"
  >;
  assignedComparisonGroup?: FhirId;
  actualComparisonGroup?: FhirId;
  consent?: Reference<"Consent">[];
}
