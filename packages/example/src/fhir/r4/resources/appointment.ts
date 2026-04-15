import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type {
  FhirCode,
  FhirDateTime,
  FhirInstant,
  FhirPositiveInt,
  FhirString,
  FhirUnsignedInt,
} from "../primitives.js";

export interface AppointmentParticipant extends BackboneElement {
  type?: CodeableConcept[];
  actor?: Reference<
    "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device" | "HealthcareService" | "Location"
  >;
  required?: FhirCode;
  status: FhirCode;
  period?: Period;
}

export interface Appointment extends DomainResource {
  resourceType: "Appointment";
  identifier?: Identifier[];
  status: FhirCode;
  cancelationReason?: CodeableConcept;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Procedure" | "Observation" | "ImmunizationRecommendation">[];
  priority?: FhirUnsignedInt;
  description?: FhirString;
  supportingInformation?: Reference<"Resource">[];
  start?: FhirInstant;
  end?: FhirInstant;
  minutesDuration?: FhirPositiveInt;
  slot?: Reference<"Slot">[];
  created?: FhirDateTime;
  comment?: FhirString;
  patientInstruction?: FhirString;
  basedOn?: Reference<"ServiceRequest">[];
  participant: AppointmentParticipant[];
  requestedPeriod?: Period[];
}
