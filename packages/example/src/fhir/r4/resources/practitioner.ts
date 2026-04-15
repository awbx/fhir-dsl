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
import type { FhirBoolean, FhirCode, FhirDate } from "../primitives.js";

export interface PractitionerQualification extends BackboneElement {
  identifier?: Identifier[];
  code: CodeableConcept;
  period?: Period;
  issuer?: Reference<"Organization">;
}

export interface Practitioner extends DomainResource {
  resourceType: "Practitioner";
  identifier?: Identifier[];
  active?: FhirBoolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  address?: Address[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  photo?: Attachment[];
  qualification?: PractitionerQualification[];
  communication?: CodeableConcept[];
}
