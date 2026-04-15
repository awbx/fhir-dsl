import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Dosage,
  Identifier,
  Period,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirMarkdown } from "../primitives.js";

export interface MedicationStatementAdherence extends BackboneElement {
  code: CodeableConcept;
  reason?: CodeableConcept;
}

export interface MedicationStatement extends DomainResource {
  resourceType: "MedicationStatement";
  identifier?: Identifier[];
  partOf?: Reference<"Procedure" | "MedicationStatement">[];
  status: FhirCode;
  category?: CodeableConcept[];
  medication: CodeableReference;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  effectiveTiming?: Timing;
  dateAsserted?: FhirDateTime;
  informationSource?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">[];
  derivedFrom?: Reference<"Resource">[];
  reason?: CodeableReference[];
  note?: Annotation[];
  relatedClinicalInformation?: Reference<"Observation" | "Condition">[];
  renderedDosageInstruction?: FhirMarkdown;
  dosage?: Dosage[];
  adherence?: MedicationStatementAdherence;
}
