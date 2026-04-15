import type {
  Address,
  Attachment,
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  HumanName,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime } from "../primitives.js";

export interface PractitionerQualification extends BackboneElement {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference<"Organization">;
}

export interface PractitionerCommunication extends BackboneElement {
  language: CodeableConcept;
  preferred?: FhirBoolean;
}

export interface Practitioner extends DomainResource {
  resourceType: "Practitioner";
  identifier?: Identifier[];
  active?: FhirBoolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  deceasedBoolean?: FhirBoolean;
  deceasedDateTime?: FhirDateTime;
  address?: Address[];
  photo?: Attachment[];
  qualification?: PractitionerQualification[];
  communication?: PractitionerCommunication[];
}
