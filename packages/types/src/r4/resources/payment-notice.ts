import type { FhirCode, FhirDate, FhirDateTime } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Money, Reference } from "../datatypes.js";

export interface PaymentNotice extends DomainResource {
  resourceType: "PaymentNotice";
  identifier?: Identifier[];
  status: FhirCode;
  request?: Reference<"Resource">;
  response?: Reference<"Resource">;
  created: FhirDateTime;
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  payment: Reference<"PaymentReconciliation">;
  paymentDate?: FhirDate;
  payee?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  recipient: Reference<"Organization">;
  amount: Money;
  paymentStatus?: CodeableConcept;
}
