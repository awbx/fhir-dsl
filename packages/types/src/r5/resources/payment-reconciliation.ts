import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDate, FhirDateTime, FhirPositiveInt, FhirString } from "../primitives.js";

export interface PaymentReconciliationAllocation extends BackboneElement {
  identifier?: Identifier;
  predecessor?: Identifier;
  target?: Reference<"Claim" | "Account" | "Invoice" | "ChargeItem" | "Encounter" | "Contract">;
  targetItemString?: FhirString;
  targetItemIdentifier?: Identifier;
  targetItemPositiveInt?: FhirPositiveInt;
  encounter?: Reference<"Encounter">;
  account?: Reference<"Account">;
  type?: CodeableConcept;
  submitter?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  response?: Reference<"ClaimResponse">;
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
  type: CodeableConcept;
  status: FhirCode;
  kind?: CodeableConcept;
  period?: Period;
  created: FhirDateTime;
  enterer?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  issuerType?: CodeableConcept;
  paymentIssuer?: Reference<"Organization" | "Patient" | "RelatedPerson">;
  request?: Reference<"Task">;
  requestor?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  outcome?: FhirCode;
  disposition?: FhirString;
  date: FhirDate;
  location?: Reference<"Location">;
  method?: CodeableConcept;
  cardBrand?: FhirString;
  accountNumber?: FhirString;
  expirationDate?: FhirDate;
  processor?: FhirString;
  referenceNumber?: FhirString;
  authorization?: FhirString;
  tenderedAmount?: Money;
  returnedAmount?: Money;
  amount: Money;
  paymentIdentifier?: Identifier;
  allocation?: PaymentReconciliationAllocation[];
  formCode?: CodeableConcept;
  processNote?: PaymentReconciliationProcessNote[];
}
