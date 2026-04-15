import type {
  Attachment,
  Availability,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirMarkdown, FhirString } from "../primitives.js";

export interface HealthcareServiceEligibility extends BackboneElement {
  code?: CodeableConcept;
  comment?: FhirMarkdown;
}

export interface HealthcareService extends DomainResource {
  resourceType: "HealthcareService";
  identifier?: Identifier[];
  active?: FhirBoolean;
  providedBy?: Reference<"Organization">;
  offeredIn?: Reference<"HealthcareService">[];
  category?: CodeableConcept[];
  type?: CodeableConcept[];
  specialty?: CodeableConcept[];
  location?: Reference<"Location">[];
  name?: FhirString;
  comment?: FhirMarkdown;
  extraDetails?: FhirMarkdown;
  photo?: Attachment;
  contact?: ExtendedContactDetail[];
  coverageArea?: Reference<"Location">[];
  serviceProvisionCode?: CodeableConcept[];
  eligibility?: HealthcareServiceEligibility[];
  program?: CodeableConcept[];
  characteristic?: CodeableConcept[];
  communication?: CodeableConcept[];
  referralMethod?: CodeableConcept[];
  appointmentRequired?: FhirBoolean;
  availability?: Availability[];
  endpoint?: Reference<"Endpoint">[];
}
