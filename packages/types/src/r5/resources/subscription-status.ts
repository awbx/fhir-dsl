import type { BackboneElement, CodeableConcept, DomainResource, Reference } from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirInstant, integer64 } from "../primitives.js";

export interface SubscriptionStatusNotificationEvent extends BackboneElement {
  eventNumber: integer64;
  timestamp?: FhirInstant;
  focus?: Reference<"Resource">;
  additionalContext?: Reference<"Resource">[];
}

export interface SubscriptionStatus extends DomainResource {
  resourceType: "SubscriptionStatus";
  status?: FhirCode;
  type: FhirCode;
  eventsSinceSubscriptionStart?: integer64;
  notificationEvent?: SubscriptionStatusNotificationEvent[];
  subscription: Reference<"Subscription">;
  topic?: FhirCanonical;
  error?: CodeableConcept[];
}
