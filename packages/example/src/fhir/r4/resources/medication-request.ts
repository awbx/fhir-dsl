import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Dosage,
  Duration,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirUnsignedInt, FhirUri } from "../primitives.js";

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
  performer?: Reference<"Organization">;
}

export interface MedicationRequestSubstitution extends BackboneElement {
  allowedBoolean?: FhirBoolean;
  allowedCodeableConcept?: CodeableConcept;
  reason?: CodeableConcept;
}

export interface MedicationRequest extends DomainResource {
  resourceType: "MedicationRequest";
  identifier?: Identifier[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  intent: FhirCode;
  category?: CodeableConcept[];
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  reportedBoolean?: FhirBoolean;
  reportedReference?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">;
  medicationCodeableConcept?: CodeableConcept;
  medicationReference?: Reference<"Medication">;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  authoredOn?: FhirDateTime;
  requester?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  performer?: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson" | "CareTeam"
  >;
  performerType?: CodeableConcept;
  recorder?: Reference<"Practitioner" | "PractitionerRole">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation">[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"CarePlan" | "MedicationRequest" | "ServiceRequest" | "ImmunizationRecommendation">[];
  groupIdentifier?: Identifier;
  courseOfTherapyType?: CodeableConcept;
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  note?: Annotation[];
  dosageInstruction?: Dosage[];
  dispenseRequest?: MedicationRequestDispenseRequest;
  substitution?: MedicationRequestSubstitution;
  priorPrescription?: Reference<"MedicationRequest">;
  detectedIssue?: Reference<"DetectedIssue">[];
  eventHistory?: Reference<"Provenance">[];
}
