import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirDecimal, FhirMarkdown, FhirPositiveInt, FhirString } from "../primitives.js";

export interface InvoiceParticipant extends BackboneElement {
  role?: CodeableConcept;
  actor: Reference<"Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "Device" | "RelatedPerson">;
}

export interface InvoiceLineItemPriceComponent extends BackboneElement {
  type: FhirCode;
  code?: CodeableConcept;
  factor?: FhirDecimal;
  amount?: Money;
}

export interface InvoiceLineItem extends BackboneElement {
  sequence?: FhirPositiveInt;
  chargeItemReference?: Reference<"ChargeItem">;
  chargeItemCodeableConcept?: CodeableConcept;
  priceComponent?: InvoiceLineItemPriceComponent[];
}

export interface Invoice extends DomainResource {
  resourceType: "Invoice";
  identifier?: Identifier[];
  status: FhirCode;
  cancelledReason?: FhirString;
  type?: CodeableConcept;
  subject?: Reference<"Patient" | "Group">;
  recipient?: Reference<"Organization" | "Patient" | "RelatedPerson">;
  date?: FhirDateTime;
  participant?: InvoiceParticipant[];
  issuer?: Reference<"Organization">;
  account?: Reference<"Account">;
  lineItem?: InvoiceLineItem[];
  totalPriceComponent?: InvoiceLineItemPriceComponent[];
  totalNet?: Money;
  totalGross?: Money;
  paymentTerms?: FhirMarkdown;
  note?: Annotation[];
}
