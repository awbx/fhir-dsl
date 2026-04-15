import type {
  Annotation,
  CodeableConcept,
  CodeableReference,
  DataRequirement,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface GuidanceResponse extends DomainResource {
  resourceType: "GuidanceResponse";
  requestIdentifier?: Identifier;
  identifier?: Identifier[];
  moduleUri?: FhirUri;
  moduleCanonical?: FhirCanonical;
  moduleCodeableConcept?: CodeableConcept;
  status: FhirCode;
  subject?: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  performer?: Reference<"Device">;
  reason?: CodeableReference[];
  note?: Annotation[];
  evaluationMessage?: Reference<"OperationOutcome">;
  outputParameters?: Reference<"Parameters">;
  result?: Reference<
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
    | "Task"
    | "VisionPrescription"
  >[];
  dataRequirement?: DataRequirement[];
}
