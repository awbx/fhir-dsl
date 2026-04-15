import type {
  BackboneElement,
  CodeableConcept,
  Coding,
  ContactPoint,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirString, FhirUrl } from "../primitives.js";

export interface MessageHeaderDestination extends BackboneElement {
  endpointUrl?: FhirUrl;
  endpointReference?: Reference<"Endpoint">;
  name?: FhirString;
  target?: Reference<"Device">;
  receiver?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}

export interface MessageHeaderSource extends BackboneElement {
  endpointUrl?: FhirUrl;
  endpointReference?: Reference<"Endpoint">;
  name?: FhirString;
  software?: FhirString;
  version?: FhirString;
  contact?: ContactPoint;
}

export interface MessageHeaderResponse extends BackboneElement {
  identifier: Identifier;
  code: FhirCode;
  details?: Reference<"OperationOutcome">;
}

export interface MessageHeader extends DomainResource {
  resourceType: "MessageHeader";
  eventCoding?: Coding;
  eventCanonical?: FhirCanonical;
  destination?: MessageHeaderDestination[];
  sender?: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Organization">;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Organization">;
  source: MessageHeaderSource;
  responsible?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  reason?: CodeableConcept;
  response?: MessageHeaderResponse;
  focus?: Reference<"Resource">[];
  definition?: FhirCanonical;
}
