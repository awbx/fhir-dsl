import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDate, FhirDateTime, FhirString } from "../primitives.js";

export interface PaymentReconciliationDetail extends BackboneElement {
  identifier?: Identifier;
  predecessor?: Identifier;
  type: CodeableConcept;
  request?: Reference<"Resource">;
  submitter?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  response?: Reference<"Resource">;
  date?: FhirDate;
  responsible?: Reference<"PractitionerRole">;
  payee?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  amount?: Money;
}

export interface PaymentReconciliationProcessNote extends BackboneElement {
  type?: FhirCode;
  text?: FhirString;
}

export interface PaymentReconciliation extends DomainResource {
  resourceType: "PaymentReconciliation";
  identifier?: Identifier[];
  status: FhirCode;
  period?: Period;
  created: FhirDateTime;
  paymentIssuer?: Reference<"Organization">;
  request?: Reference<"Task">;
  requestor?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  outcome?: FhirCode;
  disposition?: FhirString;
  paymentDate: FhirDate;
  paymentAmount: Money;
  paymentIdentifier?: Identifier;
  detail?: PaymentReconciliationDetail[];
  formCode?: CodeableConcept;
  processNote?: PaymentReconciliationProcessNote[];
}
