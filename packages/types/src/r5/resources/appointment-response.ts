import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirInstant, FhirMarkdown, FhirPositiveInt } from "../primitives.js";

export interface AppointmentResponse extends DomainResource {
  resourceType: "AppointmentResponse";
  identifier?: Identifier[];
  appointment: Reference<"Appointment">;
  proposedNewTime?: FhirBoolean;
  start?: FhirInstant;
  end?: FhirInstant;
  participantType?: CodeableConcept[];
  actor?: Reference<
    | "Patient"
    | "Group"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
    | "Device"
    | "HealthcareService"
    | "Location"
  >;
  participantStatus: FhirCode;
  comment?: FhirMarkdown;
  recurring?: FhirBoolean;
  occurrenceDate?: FhirDate;
  recurrenceId?: FhirPositiveInt;
}
