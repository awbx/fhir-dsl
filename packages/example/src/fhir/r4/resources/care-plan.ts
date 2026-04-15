import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Quantity, Reference, Timing } from "../datatypes.js";

export interface CarePlanActivityDetail extends BackboneElement {
  kind?: FhirCode;
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  code?: CodeableConcept;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  goal?: Reference<"Goal">[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  doNotPerform?: FhirBoolean;
  scheduledTiming?: Timing;
  scheduledPeriod?: Period;
  scheduledString?: FhirString;
  location?: Reference<"Location">;
  performer?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "RelatedPerson" | "Patient" | "CareTeam" | "HealthcareService" | "Device">[];
  productCodeableConcept?: CodeableConcept;
  productReference?: Reference<"Medication" | "Substance">;
  dailyAmount?: Quantity;
  quantity?: Quantity;
  description?: FhirString;
}

export interface CarePlanActivity extends BackboneElement {
  outcomeCodeableConcept?: CodeableConcept[];
  outcomeReference?: Reference<"Resource">[];
  progress?: Annotation[];
  reference?: Reference<"Appointment" | "CommunicationRequest" | "DeviceRequest" | "MedicationRequest" | "NutritionOrder" | "Task" | "ServiceRequest" | "VisionPrescription" | "RequestGroup">;
  detail?: CarePlanActivityDetail;
}

export interface CarePlan extends DomainResource {
  resourceType: "CarePlan";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"CarePlan">[];
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
  author?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Device" | "RelatedPerson" | "Organization" | "CareTeam">;
  contributor?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Device" | "RelatedPerson" | "Organization" | "CareTeam">[];
  careTeam?: Reference<"CareTeam">[];
  addresses?: Reference<"Condition">[];
  supportingInfo?: Reference<"Resource">[];
  goal?: Reference<"Goal">[];
  activity?: CarePlanActivity[];
  note?: Annotation[];
}
