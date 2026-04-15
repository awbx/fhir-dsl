import type {
  Address,
  Attachment,
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  HumanName,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime } from "../primitives.js";

export interface PersonCommunication extends BackboneElement {
  language: CodeableConcept;
  preferred?: FhirBoolean;
}

export interface PersonLink extends BackboneElement {
  target: Reference<"Patient" | "Practitioner" | "RelatedPerson" | "Person">;
  assurance?: FhirCode;
}

export interface Person extends DomainResource {
  resourceType: "Person";
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
  photo?: Attachment[];
  communication?: PersonCommunication[];
  managingOrganization?: Reference<"Organization">;
  link?: PersonLink[];
}
