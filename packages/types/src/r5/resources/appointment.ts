import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
  DomainResource,
  Identifier,
  Period,
  Reference,
  VirtualServiceDetail,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirInstant,
  FhirPositiveInt,
  FhirString,
} from "../primitives.js";

export interface AppointmentParticipant extends BackboneElement {
  type?: CodeableConcept[];
  period?: Period;
  actor?: Reference<
    | "Patient"
    | "Group"
    | "Practitioner"
    | "PractitionerRole"
    | "CareTeam"
    | "RelatedPerson"
    | "Device"
    | "HealthcareService"
    | "Location"
  >;
  required?: FhirBoolean;
  status: FhirCode;
}

export interface AppointmentRecurrenceTemplateWeeklyTemplate extends BackboneElement {
  monday?: FhirBoolean;
  tuesday?: FhirBoolean;
  wednesday?: FhirBoolean;
  thursday?: FhirBoolean;
  friday?: FhirBoolean;
  saturday?: FhirBoolean;
  sunday?: FhirBoolean;
  weekInterval?: FhirPositiveInt;
}

export interface AppointmentRecurrenceTemplateMonthlyTemplate extends BackboneElement {
  dayOfMonth?: FhirPositiveInt;
  nthWeekOfMonth?: Coding;
  dayOfWeek?: Coding;
  monthInterval: FhirPositiveInt;
}

export interface AppointmentRecurrenceTemplateYearlyTemplate extends BackboneElement {
  yearInterval: FhirPositiveInt;
}

export interface AppointmentRecurrenceTemplate extends BackboneElement {
  timezone?: CodeableConcept;
  recurrenceType: CodeableConcept;
  lastOccurrenceDate?: FhirDate;
  occurrenceCount?: FhirPositiveInt;
  occurrenceDate?: FhirDate[];
  weeklyTemplate?: AppointmentRecurrenceTemplateWeeklyTemplate;
  monthlyTemplate?: AppointmentRecurrenceTemplateMonthlyTemplate;
  yearlyTemplate?: AppointmentRecurrenceTemplateYearlyTemplate;
  excludingDate?: FhirDate[];
  excludingRecurrenceId?: FhirPositiveInt[];
}

export interface Appointment extends DomainResource {
  resourceType: "Appointment";
  identifier?: Identifier[];
  status: FhirCode;
  cancellationReason?: CodeableConcept;
  class?: CodeableConcept[];
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableReference[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  reason?: CodeableReference[];
  priority?: CodeableConcept;
  description?: FhirString;
  replaces?: Reference<"Appointment">[];
  virtualService?: VirtualServiceDetail[];
  supportingInformation?: Reference<"Resource">[];
  previousAppointment?: Reference<"Appointment">;
  originatingAppointment?: Reference<"Appointment">;
  start?: FhirInstant;
  end?: FhirInstant;
  minutesDuration?: FhirPositiveInt;
  requestedPeriod?: Period[];
  slot?: Reference<"Slot">[];
  account?: Reference<"Account">[];
  created?: FhirDateTime;
  cancellationDate?: FhirDateTime;
  note?: Annotation[];
  patientInstruction?: CodeableReference[];
  basedOn?: Reference<"CarePlan" | "DeviceRequest" | "MedicationRequest" | "ServiceRequest">[];
  subject?: Reference<"Patient" | "Group">;
  participant: AppointmentParticipant[];
  recurrenceId?: FhirPositiveInt;
  occurrenceChanged?: FhirBoolean;
  recurrenceTemplate?: AppointmentRecurrenceTemplate[];
}
