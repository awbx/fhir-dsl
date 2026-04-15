import type { FhirCanonical, FhirCode, FhirId, FhirString, FhirUri, FhirUrl } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, ContactPoint, DomainResource, Reference } from "../datatypes.js";

export interface MessageHeaderDestination extends BackboneElement {
  name?: FhirString;
  target?: Reference<"Device">;
  endpoint: FhirUrl;
  receiver?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
}

export interface MessageHeaderSource extends BackboneElement {
  name?: FhirString;
  software?: FhirString;
  version?: FhirString;
  contact?: ContactPoint;
  endpoint: FhirUrl;
}

export interface MessageHeaderResponse extends BackboneElement {
  identifier: FhirId;
  code: FhirCode;
  details?: Reference<"OperationOutcome">;
}

export interface MessageHeader extends DomainResource {
  resourceType: "MessageHeader";
  eventCoding?: Coding;
  eventUri?: FhirUri;
  destination?: MessageHeaderDestination[];
  sender?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  enterer?: Reference<"Practitioner" | "PractitionerRole">;
  author?: Reference<"Practitioner" | "PractitionerRole">;
  source: MessageHeaderSource;
  responsible?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  reason?: CodeableConcept;
  response?: MessageHeaderResponse;
  focus?: Reference<"Resource">[];
  definition?: FhirCanonical;
}
