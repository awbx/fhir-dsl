import type { FhirBoolean, FhirCode, FhirInstant, FhirString } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface Slot extends DomainResource {
  resourceType: "Slot";
  identifier?: Identifier[];
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  appointmentType?: CodeableConcept;
  schedule: Reference<"Schedule">;
  status: FhirCode;
  start: FhirInstant;
  end: FhirInstant;
  overbooked?: FhirBoolean;
  comment?: FhirString;
}
