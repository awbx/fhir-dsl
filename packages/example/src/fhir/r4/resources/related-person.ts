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

export interface RelatedPersonCommunication extends BackboneElement {
  language: CodeableConcept;
  preferred?: FhirBoolean;
}

export interface RelatedPerson extends DomainResource {
  resourceType: "RelatedPerson";
  identifier?: Identifier[];
  active?: FhirBoolean;
  patient: Reference<"Patient">;
  relationship?: CodeableConcept[];
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  address?: Address[];
  photo?: Attachment[];
  period?: Period;
  communication?: RelatedPersonCommunication[];
}
