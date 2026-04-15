import type {
  Address,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirDecimal,
  FhirPositiveInt,
  FhirString,
} from "../primitives.js";

export interface ClaimResponseItemAdjudication extends BackboneElement {
  category: CodeableConcept;
  reason?: CodeableConcept;
  amount?: Money;
  value?: FhirDecimal;
}

export interface ClaimResponseItemDetailSubDetail extends BackboneElement {
  subDetailSequence: FhirPositiveInt;
  noteNumber?: FhirPositiveInt[];
  adjudication?: ClaimResponseItemAdjudication[];
}

export interface ClaimResponseItemDetail extends BackboneElement {
  detailSequence: FhirPositiveInt;
  noteNumber?: FhirPositiveInt[];
  adjudication: ClaimResponseItemAdjudication[];
  subDetail?: ClaimResponseItemDetailSubDetail[];
}

export interface ClaimResponseItem extends BackboneElement {
  itemSequence: FhirPositiveInt;
  noteNumber?: FhirPositiveInt[];
  adjudication: ClaimResponseItemAdjudication[];
  detail?: ClaimResponseItemDetail[];
}

export interface ClaimResponseAddItemDetailSubDetail extends BackboneElement {
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  adjudication: ClaimResponseItemAdjudication[];
}

export interface ClaimResponseAddItemDetail extends BackboneElement {
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  adjudication: ClaimResponseItemAdjudication[];
  subDetail?: ClaimResponseAddItemDetailSubDetail[];
}

export interface ClaimResponseAddItem extends BackboneElement {
  itemSequence?: FhirPositiveInt[];
  detailSequence?: FhirPositiveInt[];
  subdetailSequence?: FhirPositiveInt[];
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">[];
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  programCode?: CodeableConcept[];
  servicedDate?: FhirDate;
  servicedPeriod?: Period;
  locationCodeableConcept?: CodeableConcept;
  locationAddress?: Address;
  locationReference?: Reference<"Location">;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  bodySite?: CodeableConcept;
  subSite?: CodeableConcept[];
  noteNumber?: FhirPositiveInt[];
  adjudication: ClaimResponseItemAdjudication[];
  detail?: ClaimResponseAddItemDetail[];
}

export interface ClaimResponseTotal extends BackboneElement {
  category: CodeableConcept;
  amount: Money;
}

export interface ClaimResponsePayment extends BackboneElement {
  type: CodeableConcept;
  adjustment?: Money;
  adjustmentReason?: CodeableConcept;
  date?: FhirDate;
  amount: Money;
  identifier?: Identifier;
}

export interface ClaimResponseProcessNote extends BackboneElement {
  number?: FhirPositiveInt;
  type?: FhirCode;
  text: FhirString;
  language?: CodeableConcept;
}

export interface ClaimResponseInsurance extends BackboneElement {
  sequence: FhirPositiveInt;
  focal: FhirBoolean;
  coverage: Reference<"Coverage">;
  businessArrangement?: FhirString;
  claimResponse?: Reference<"ClaimResponse">;
}

export interface ClaimResponseError extends BackboneElement {
  itemSequence?: FhirPositiveInt;
  detailSequence?: FhirPositiveInt;
  subDetailSequence?: FhirPositiveInt;
  code: CodeableConcept;
}

export interface ClaimResponse extends DomainResource {
  resourceType: "ClaimResponse";
  identifier?: Identifier[];
  status: FhirCode;
  type: CodeableConcept;
  subType?: CodeableConcept;
  use: FhirCode;
  patient: Reference<"Patient">;
  created: FhirDateTime;
  insurer: Reference<"Organization">;
  requestor?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  request?: Reference<"Claim">;
  outcome: FhirCode;
  disposition?: FhirString;
  preAuthRef?: FhirString;
  preAuthPeriod?: Period;
  payeeType?: CodeableConcept;
  item?: ClaimResponseItem[];
  addItem?: ClaimResponseAddItem[];
  adjudication?: ClaimResponseItemAdjudication[];
  total?: ClaimResponseTotal[];
  payment?: ClaimResponsePayment;
  fundsReserve?: CodeableConcept;
  formCode?: CodeableConcept;
  form?: Attachment;
  processNote?: ClaimResponseProcessNote[];
  communicationRequest?: Reference<"CommunicationRequest">[];
  insurance?: ClaimResponseInsurance[];
  error?: ClaimResponseError[];
}
