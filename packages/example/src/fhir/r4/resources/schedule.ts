import type { FhirBoolean, FhirString } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface Schedule extends DomainResource {
  resourceType: "Schedule";
  identifier?: Identifier[];
  active?: FhirBoolean;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableConcept[];
  specialty?: CodeableConcept[];
  actor: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Device" | "HealthcareService" | "Location">[];
  planningHorizon?: Period;
  comment?: FhirString;
}
