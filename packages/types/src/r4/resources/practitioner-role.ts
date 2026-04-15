import type { FhirBoolean, FhirCode, FhirString, FhirTime } from "../primitives.js";
import type { BackboneElement, CodeableConcept, ContactPoint, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface PractitionerRoleAvailableTime extends BackboneElement {
  daysOfWeek?: FhirCode[];
  allDay?: FhirBoolean;
  availableStartTime?: FhirTime;
  availableEndTime?: FhirTime;
}

export interface PractitionerRoleNotAvailable extends BackboneElement {
  description: FhirString;
  during?: Period;
}

export interface PractitionerRole extends DomainResource {
  resourceType: "PractitionerRole";
  identifier?: Identifier[];
  active?: FhirBoolean;
  period?: Period;
  practitioner?: Reference<"Practitioner">;
  organization?: Reference<"Organization">;
  code?: CodeableConcept[];
  specialty?: CodeableConcept[];
  location?: Reference<"Location">[];
  healthcareService?: Reference<"HealthcareService">[];
  telecom?: ContactPoint[];
  availableTime?: PractitionerRoleAvailableTime[];
  notAvailable?: PractitionerRoleNotAvailable[];
  availabilityExceptions?: FhirString;
  endpoint?: Reference<"Endpoint">[];
}
