import type { FhirBoolean, FhirCode, FhirDateTime } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Dosage, Identifier, Quantity, Reference } from "../datatypes.js";

export interface MedicationDispensePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson">;
}

export interface MedicationDispenseSubstitution extends BackboneElement {
  wasSubstituted: FhirBoolean;
  type?: CodeableConcept;
  reason?: CodeableConcept[];
  responsibleParty?: Reference<"Practitioner" | "PractitionerRole">[];
}

export interface MedicationDispense extends DomainResource {
  resourceType: "MedicationDispense";
  identifier?: Identifier[];
  partOf?: Reference<"Procedure">[];
  status: FhirCode;
  statusReasonCodeableConcept?: CodeableConcept;
  statusReasonReference?: Reference<"DetectedIssue">;
  category?: CodeableConcept;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"Medication">;
  subject?: Reference<"Patient" | "Group">;
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  supportingInformation?: Reference<"Resource">[];
  performer?: MedicationDispensePerformer[];
  location?: Reference<"Location">;
  authorizingPrescription?: Reference<"MedicationRequest">[];
  type?: CodeableConcept;
  quantity?: Quantity;
  daysSupply?: Quantity;
  whenPrepared?: FhirDateTime;
  whenHandedOver?: FhirDateTime;
  destination?: Reference<"Location">;
  receiver?: Reference<"Patient" | "Practitioner">[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  substitution?: MedicationDispenseSubstitution;
  detectedIssue?: Reference<"DetectedIssue">[];
  eventHistory?: Reference<"Provenance">[];
}
