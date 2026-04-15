import type {
  Address,
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  HumanName,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirString } from "../primitives.js";

export interface OrganizationContact extends BackboneElement {
  purpose?: CodeableConcept;
  name?: HumanName;
  telecom?: ContactPoint[];
  address?: Address;
}

export interface Organization extends DomainResource {
  resourceType: "Organization";
  identifier?: Identifier[];
  active?: FhirBoolean;
  type?: CodeableConcept[];
  name?: FhirString;
  alias?: FhirString[];
  telecom?: ContactPoint[];
  address?: Address[];
  partOf?: Reference<"Organization">;
  contact?: OrganizationContact[];
  endpoint?: Reference<"Endpoint">[];
}
