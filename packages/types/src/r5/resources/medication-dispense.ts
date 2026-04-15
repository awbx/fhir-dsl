import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Dosage,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown } from "../primitives.js";

export interface MedicationDispensePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson" | "CareTeam"
  >;
}

export interface MedicationDispenseSubstitution extends BackboneElement {
  wasSubstituted: FhirBoolean;
  type?: CodeableConcept;
  reason?: CodeableConcept[];
  responsibleParty?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}

export interface MedicationDispense extends DomainResource {
  resourceType: "MedicationDispense";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan">[];
  partOf?: Reference<"Procedure" | "MedicationAdministration">[];
  status: FhirCode;
  notPerformedReason?: CodeableReference;
  statusChanged?: FhirDateTime;
  category?: CodeableConcept[];
  medication: CodeableReference;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  performer?: MedicationDispensePerformer[];
  location?: Reference<"Location">;
  authorizingPrescription?: Reference<"MedicationRequest">[];
  type?: CodeableConcept;
  quantity?: Quantity;
  daysSupply?: Quantity;
  recorded?: FhirDateTime;
  whenPrepared?: FhirDateTime;
  whenHandedOver?: FhirDateTime;
  destination?: Reference<"Location">;
  receiver?: Reference<"Patient" | "Practitioner" | "RelatedPerson" | "Location" | "PractitionerRole">[];
  note?: Annotation[];
  renderedDosageInstruction?: FhirMarkdown;
  dosageInstruction?: Dosage[];
  substitution?: MedicationDispenseSubstitution;
  eventHistory?: Reference<"Provenance">[];
}
