import type { FhirBoolean, FhirCode, FhirDate } from "../primitives.js";
import type { Address, Attachment, BackboneElement, ContactPoint, DomainResource, HumanName, Identifier, Reference } from "../datatypes.js";

export interface PersonLink extends BackboneElement {
  target: Reference<"Patient" | "Practitioner" | "RelatedPerson" | "Person">;
  assurance?: FhirCode;
}

export interface Person extends DomainResource {
  resourceType: "Person";
  identifier?: Identifier[];
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: FhirCode;
  birthDate?: FhirDate;
  address?: Address[];
  photo?: Attachment;
  managingOrganization?: Reference<"Organization">;
  active?: FhirBoolean;
  link?: PersonLink[];
}
