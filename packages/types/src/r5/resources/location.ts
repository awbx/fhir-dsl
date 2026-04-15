import type {
  Address,
  Availability,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Reference,
  VirtualServiceDetail,
} from "../datatypes.js";
import type { FhirCode, FhirDecimal, FhirMarkdown, FhirString } from "../primitives.js";

export interface LocationPosition extends BackboneElement {
  longitude: FhirDecimal;
  latitude: FhirDecimal;
  altitude?: FhirDecimal;
}

export interface Location extends DomainResource {
  resourceType: "Location";
  identifier?: Identifier[];
  status?: FhirCode;
  operationalStatus?: Coding;
  name?: FhirString;
  alias?: FhirString[];
  description?: FhirMarkdown;
  mode?: FhirCode;
  type?: CodeableConcept[];
  contact?: ExtendedContactDetail[];
  address?: Address;
  form?: CodeableConcept;
  position?: LocationPosition;
  managingOrganization?: Reference<"Organization">;
  partOf?: Reference<"Location">;
  characteristic?: CodeableConcept[];
  hoursOfOperation?: Availability[];
  virtualService?: VirtualServiceDetail[];
  endpoint?: Reference<"Endpoint">[];
}
