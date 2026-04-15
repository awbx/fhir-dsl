import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface CarePlanActivity extends BackboneElement {
  performedActivity?: CodeableReference[];
  progress?: Annotation[];
  plannedActivityReference?: Reference<
    | "Appointment"
    | "CommunicationRequest"
    | "DeviceRequest"
    | "MedicationRequest"
    | "NutritionOrder"
    | "Task"
    | "ServiceRequest"
    | "VisionPrescription"
    | "RequestOrchestration"
    | "ImmunizationRecommendation"
    | "SupplyRequest"
  >;
}

export interface CarePlan extends DomainResource {
  resourceType: "CarePlan";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"CarePlan" | "ServiceRequest" | "RequestOrchestration" | "NutritionOrder">[];
  replaces?: Reference<"CarePlan">[];
  partOf?: Reference<"CarePlan">[];
  status: FhirCode;
  intent: FhirCode;
  category?: CodeableConcept[];
  title?: FhirString;
  description?: FhirString;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  period?: Period;
  created?: FhirDateTime;
  custodian?: Reference<
    "Patient" | "Practitioner" | "PractitionerRole" | "Device" | "RelatedPerson" | "Organization" | "CareTeam"
  >;
  contributor?: Reference<
    "Patient" | "Practitioner" | "PractitionerRole" | "Device" | "RelatedPerson" | "Organization" | "CareTeam"
  >[];
  careTeam?: Reference<"CareTeam">[];
  addresses?: CodeableReference[];
  supportingInfo?: Reference<"Resource">[];
  goal?: Reference<"Goal">[];
  activity?: CarePlanActivity[];
  note?: Annotation[];
}
