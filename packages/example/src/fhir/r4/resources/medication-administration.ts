import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Quantity, Ratio, Reference } from "../datatypes.js";

export interface MedicationAdministrationPerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Device">;
}

export interface MedicationAdministrationDosage extends BackboneElement {
  text?: FhirString;
  site?: CodeableConcept;
  route?: CodeableConcept;
  method?: CodeableConcept;
  dose?: Quantity;
  rateRatio?: Ratio;
  rateQuantity?: Quantity;
}

export interface MedicationAdministration extends DomainResource {
  resourceType: "MedicationAdministration";
  identifier?: Identifier[];
  instantiates?: FhirUri[];
  partOf?: Reference<"MedicationAdministration" | "Procedure">[];
  status: FhirCode;
  statusReason?: CodeableConcept[];
  category?: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"Medication">;
  subject: Reference<"Patient" | "Group">;
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  supportingInformation?: Reference<"Resource">[];
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  performer?: MedicationAdministrationPerformer[];
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport">[];
  request?: Reference<"MedicationRequest">;
  device?: Reference<"Device">[];
  note?: Annotation[];
  dosage?: MedicationAdministrationDosage;
  eventHistory?: Reference<"Provenance">[];
}
