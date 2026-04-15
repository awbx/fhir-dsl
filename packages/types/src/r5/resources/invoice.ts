import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  MonetaryComponent,
  Money,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDate, FhirDateTime, FhirMarkdown, FhirPositiveInt, FhirString } from "../primitives.js";

export interface InvoiceParticipant extends BackboneElement {
  role?: CodeableConcept;
  actor: Reference<"Practitioner" | "Organization" | "Patient" | "PractitionerRole" | "Device" | "RelatedPerson">;
}

export interface InvoiceLineItem extends BackboneElement {
  sequence?: FhirPositiveInt;
  servicedDate?: FhirDate;
  servicedPeriod?: Period;
  chargeItemReference?: Reference<"ChargeItem">;
  chargeItemCodeableConcept?: CodeableConcept;
  priceComponent?: MonetaryComponent[];
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
  creation?: FhirDateTime;
  periodDate?: FhirDate;
  periodPeriod?: Period;
  participant?: InvoiceParticipant[];
  issuer?: Reference<"Organization">;
  account?: Reference<"Account">;
  lineItem?: InvoiceLineItem[];
  totalPriceComponent?: MonetaryComponent[];
  totalNet?: Money;
  totalGross?: Money;
  paymentTerms?: FhirMarkdown;
  note?: Annotation[];
}
