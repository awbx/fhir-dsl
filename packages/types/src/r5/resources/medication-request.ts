import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Dosage,
  Duration,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown, FhirUnsignedInt } from "../primitives.js";

export interface MedicationRequestDispenseRequestInitialFill extends BackboneElement {
  quantity?: Quantity;
  duration?: Duration;
}

export interface MedicationRequestDispenseRequest extends BackboneElement {
  initialFill?: MedicationRequestDispenseRequestInitialFill;
  dispenseInterval?: Duration;
  validityPeriod?: Period;
  numberOfRepeatsAllowed?: FhirUnsignedInt;
  quantity?: Quantity;
  expectedSupplyDuration?: Duration;
  dispenser?: Reference<"Organization">;
  dispenserInstruction?: Annotation[];
  doseAdministrationAid?: CodeableConcept;
}

export interface MedicationRequestSubstitution extends BackboneElement {
  allowedBoolean?: FhirBoolean;
  allowedCodeableConcept?: CodeableConcept;
  reason?: CodeableConcept;
}

export interface MedicationRequest extends DomainResource {
  resourceType: "MedicationRequest";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan" | "MedicationRequest" | "ServiceRequest" | "ImmunizationRecommendation">[];
  priorPrescription?: Reference<"MedicationRequest">;
  groupIdentifier?: Identifier;
  status: FhirCode;
  statusReason?: CodeableConcept;
  statusChanged?: FhirDateTime;
  intent: FhirCode;
  category?: CodeableConcept[];
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  medication: CodeableReference;
  subject: Reference<"Patient" | "Group">;
  informationSource?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">[];
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  authoredOn?: FhirDateTime;
  requester?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  reported?: FhirBoolean;
  performerType?: CodeableConcept;
  performer?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "Patient"
    | "DeviceDefinition"
    | "RelatedPerson"
    | "CareTeam"
    | "HealthcareService"
  >[];
  device?: CodeableReference[];
  recorder?: Reference<"Practitioner" | "PractitionerRole">;
  reason?: CodeableReference[];
  courseOfTherapyType?: CodeableConcept;
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  note?: Annotation[];
  renderedDosageInstruction?: FhirMarkdown;
  effectiveDosePeriod?: Period;
  dosageInstruction?: Dosage[];
  dispenseRequest?: MedicationRequestDispenseRequest;
  substitution?: MedicationRequestSubstitution;
  eventHistory?: Reference<"Provenance">[];
}
