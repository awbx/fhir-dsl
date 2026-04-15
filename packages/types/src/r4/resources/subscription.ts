import type { FhirCode, FhirInstant, FhirString, FhirUrl } from "../primitives.js";
import type { BackboneElement, ContactPoint, DomainResource } from "../datatypes.js";

export interface SubscriptionChannel extends BackboneElement {
  type: FhirCode;
  endpoint?: FhirUrl;
  payload?: FhirCode;
  header?: FhirString[];
}

export interface Subscription extends DomainResource {
  resourceType: "Subscription";
  status: FhirCode;
  contact?: ContactPoint[];
  end?: FhirInstant;
  reason: FhirString;
  criteria: FhirString;
  error?: FhirString;
  channel: SubscriptionChannel;
}
