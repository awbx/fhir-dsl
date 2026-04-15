import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirInteger } from "../primitives.js";
import type { Address, Attachment, BackboneElement, CodeableConcept, ContactPoint, DomainResource, HumanName, Identifier, Period, Reference } from "../datatypes.js";

export interface PatientContact extends BackboneElement {
  relationship?: CodeableConcept[];
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
  gender?: FhirCode;
  organization?: Reference<"Organization">;
  period?: Period;
}

export interface PatientCommunication extends BackboneElement {
  language: CodeableConcept;
  preferred?: FhirBoolean;
}

export interface PatientLink extends BackboneElement {
  other: Reference<"Patient" | "RelatedPerson">;
  type: FhirCode;
}

export interface Patient extends DomainResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: FhirBoolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  deceasedBoolean?: FhirBoolean;
  deceasedDateTime?: FhirDateTime;
  address?: Address[];
  maritalStatus?: CodeableConcept;
  multipleBirthBoolean?: FhirBoolean;
  multipleBirthInteger?: FhirInteger;
  photo?: Attachment[];
  contact?: PatientContact[];
  communication?: PatientCommunication[];
  generalPractitioner?: Reference<"Organization" | "Practitioner" | "PractitionerRole">[];
  managingOrganization?: Reference<"Organization">;
  link?: PatientLink[];
}
