import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type {
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirInstant,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface DocumentReferenceAttester extends BackboneElement {
  mode: CodeableConcept;
  time?: FhirDateTime;
  party?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Organization">;
}

export interface DocumentReferenceRelatesTo extends BackboneElement {
  code: CodeableConcept;
  target: Reference<"DocumentReference">;
}

export interface DocumentReferenceContentProfile extends BackboneElement {
  valueCoding?: Coding;
  valueUri?: FhirUri;
  valueCanonical?: FhirCanonical;
}

export interface DocumentReferenceContent extends BackboneElement {
  attachment: Attachment;
  profile?: DocumentReferenceContentProfile[];
}

export interface DocumentReference extends DomainResource {
  resourceType: "DocumentReference";
  identifier?: Identifier[];
  version?: FhirString;
  basedOn?: Reference<
    | "Appointment"
    | "AppointmentResponse"
    | "CarePlan"
    | "Claim"
    | "CommunicationRequest"
    | "Contract"
    | "CoverageEligibilityRequest"
    | "DeviceRequest"
    | "EnrollmentRequest"
    | "ImmunizationRecommendation"
    | "MedicationRequest"
    | "NutritionOrder"
    | "RequestOrchestration"
    | "ServiceRequest"
    | "SupplyRequest"
    | "VisionPrescription"
  >[];
  status: FhirCode;
  docStatus?: FhirCode;
  modality?: CodeableConcept[];
  type?: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference<"Resource">;
  context?: Reference<"Appointment" | "Encounter" | "EpisodeOfCare">[];
  event?: CodeableReference[];
  bodySite?: CodeableReference[];
  facilityType?: CodeableConcept;
  practiceSetting?: CodeableConcept;
  period?: Period;
  date?: FhirInstant;
  author?: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "Device" | "Patient" | "RelatedPerson" | "CareTeam"
  >[];
  attester?: DocumentReferenceAttester[];
  custodian?: Reference<"Organization">;
  relatesTo?: DocumentReferenceRelatesTo[];
  description?: FhirMarkdown;
  securityLabel?: CodeableConcept[];
  content: DocumentReferenceContent[];
}
