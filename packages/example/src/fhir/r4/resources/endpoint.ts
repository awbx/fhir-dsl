import type {
  CodeableConcept,
  Coding,
  ContactPoint,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirString, FhirUrl } from "../primitives.js";

export interface Endpoint extends DomainResource {
  resourceType: "Endpoint";
  identifier?: Identifier[];
  status: FhirCode;
  connectionType: Coding;
  name?: FhirString;
  managingOrganization?: Reference<"Organization">;
  contact?: ContactPoint[];
  period?: Period;
  payloadType: CodeableConcept[];
  payloadMimeType?: FhirCode[];
  address: FhirUrl;
  header?: FhirString[];
}
