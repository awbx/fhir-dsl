import type { FhirCode, FhirInstant, FhirString } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface AppointmentResponse extends DomainResource {
  resourceType: "AppointmentResponse";
  identifier?: Identifier[];
  appointment: Reference<"Appointment">;
  start?: FhirInstant;
  end?: FhirInstant;
  participantType?: CodeableConcept[];
  actor?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device" | "HealthcareService" | "Location">;
  participantStatus: FhirCode;
  comment?: FhirString;
}
