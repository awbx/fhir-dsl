import type {
  Address,
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactPoint,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDecimal, FhirString, FhirTime } from "../primitives.js";

export interface LocationPosition extends BackboneElement {
  longitude: FhirDecimal;
  latitude: FhirDecimal;
  altitude?: FhirDecimal;
}

export interface LocationHoursOfOperation extends BackboneElement {
  daysOfWeek?: FhirCode[];
  allDay?: FhirBoolean;
  openingTime?: FhirTime;
  closingTime?: FhirTime;
}

export interface Location extends DomainResource {
  resourceType: "Location";
  identifier?: Identifier[];
  status?: FhirCode;
  operationalStatus?: Coding;
  name?: FhirString;
  alias?: FhirString[];
  description?: FhirString;
  mode?: FhirCode;
  type?: CodeableConcept[];
  telecom?: ContactPoint[];
  address?: Address;
  physicalType?: CodeableConcept;
  position?: LocationPosition;
  managingOrganization?: Reference<"Organization">;
  partOf?: Reference<"Location">;
  hoursOfOperation?: LocationHoursOfOperation[];
  availabilityExceptions?: FhirString;
  endpoint?: Reference<"Endpoint">[];
}
