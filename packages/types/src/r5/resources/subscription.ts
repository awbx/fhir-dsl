import type { BackboneElement, Coding, ContactPoint, DomainResource, Identifier, Reference } from "../datatypes.js";
import type {
  FhirCanonical,
  FhirCode,
  FhirInstant,
  FhirPositiveInt,
  FhirString,
  FhirUnsignedInt,
  FhirUri,
  FhirUrl,
} from "../primitives.js";

export interface SubscriptionFilterBy extends BackboneElement {
  resourceType?: FhirUri;
  filterParameter: FhirString;
  comparator?: FhirCode;
  modifier?: FhirCode;
  value: FhirString;
}

export interface SubscriptionParameter extends BackboneElement {
  name: FhirString;
  value: FhirString;
}

export interface Subscription extends DomainResource {
  resourceType: "Subscription";
  identifier?: Identifier[];
  name?: FhirString;
  status: FhirCode;
  topic: FhirCanonical;
  contact?: ContactPoint[];
  end?: FhirInstant;
  managingEntity?: Reference<
    | "CareTeam"
    | "HealthcareService"
    | "Organization"
    | "RelatedPerson"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
  >;
  reason?: FhirString;
  filterBy?: SubscriptionFilterBy[];
  channelType: Coding;
  endpoint?: FhirUrl;
  parameter?: SubscriptionParameter[];
  heartbeatPeriod?: FhirUnsignedInt;
  timeout?: FhirUnsignedInt;
  contentType?: FhirCode;
  content?: FhirCode;
  maxCount?: FhirPositiveInt;
}
