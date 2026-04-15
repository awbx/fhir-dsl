import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirMarkdown, FhirString, FhirTime } from "../primitives.js";

export interface HealthcareServiceEligibility extends BackboneElement {
  code?: CodeableConcept;
  comment?: FhirMarkdown;
}

export interface HealthcareServiceAvailableTime extends BackboneElement {
  daysOfWeek?: FhirCode[];
  allDay?: FhirBoolean;
  availableStartTime?: FhirTime;
  availableEndTime?: FhirTime;
}

export interface HealthcareServiceNotAvailable extends BackboneElement {
  description: FhirString;
  during?: Period;
}

export interface HealthcareService extends DomainResource {
  resourceType: "HealthcareService";
  identifier?: Identifier[];
  active?: FhirBoolean;
  providedBy?: Reference<"Organization">;
  category?: CodeableConcept[];
  type?: CodeableConcept[];
  specialty?: CodeableConcept[];
  location?: Reference<"Location">[];
  name?: FhirString;
  comment?: FhirString;
  extraDetails?: FhirMarkdown;
  photo?: Attachment;
  telecom?: ContactPoint[];
  coverageArea?: Reference<"Location">[];
  serviceProvisionCode?: CodeableConcept[];
  eligibility?: HealthcareServiceEligibility[];
  program?: CodeableConcept[];
  characteristic?: CodeableConcept[];
  communication?: CodeableConcept[];
  referralMethod?: CodeableConcept[];
  appointmentRequired?: FhirBoolean;
  availableTime?: HealthcareServiceAvailableTime[];
  notAvailable?: HealthcareServiceNotAvailable[];
  availabilityExceptions?: FhirString;
  endpoint?: Reference<"Endpoint">[];
}
