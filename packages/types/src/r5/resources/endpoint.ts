import type {
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirString, FhirUrl } from "../primitives.js";

export interface EndpointPayload extends BackboneElement {
  type?: CodeableConcept[];
  mimeType?: FhirCode[];
}

export interface Endpoint extends DomainResource {
  resourceType: "Endpoint";
  identifier?: Identifier[];
  status: FhirCode;
  connectionType: CodeableConcept[];
  name?: FhirString;
  description?: FhirString;
  environmentType?: CodeableConcept[];
  managingOrganization?: Reference<"Organization">;
  contact?: ContactPoint[];
  period?: Period;
  payload?: EndpointPayload[];
  address: FhirUrl;
  header?: FhirString[];
}
