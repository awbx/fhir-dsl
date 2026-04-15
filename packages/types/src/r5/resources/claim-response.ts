import type {
  Address,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
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

export interface ClaimResponseEvent extends BackboneElement {
  type: CodeableConcept;
  whenDateTime?: FhirDateTime;
  whenPeriod?: Period;
}

export interface ClaimResponseItemReviewOutcome extends BackboneElement {
  decision?: CodeableConcept;
  reason?: CodeableConcept[];
  preAuthRef?: FhirString;
  preAuthPeriod?: Period;
}

export interface ClaimResponseItemAdjudication extends BackboneElement {
  category: CodeableConcept;
  reason?: CodeableConcept;
  amount?: Money;
  quantity?: Quantity;
}

export interface ClaimResponseItemDetailSubDetail extends BackboneElement {
  subDetailSequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
}

export interface ClaimResponseItemDetail extends BackboneElement {
  detailSequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
  subDetail?: ClaimResponseItemDetailSubDetail[];
}

export interface ClaimResponseItem extends BackboneElement {
  itemSequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
  detail?: ClaimResponseItemDetail[];
}

export interface ClaimResponseAddItemBodySite extends BackboneElement {
  site: CodeableReference[];
  subSite?: CodeableConcept[];
}

export interface ClaimResponseAddItemDetailSubDetail extends BackboneElement {
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
}

export interface ClaimResponseAddItemDetail extends BackboneElement {
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
  subDetail?: ClaimResponseAddItemDetailSubDetail[];
}

export interface ClaimResponseAddItem extends BackboneElement {
  itemSequence?: FhirPositiveInt[];
  detailSequence?: FhirPositiveInt[];
  subdetailSequence?: FhirPositiveInt[];
  traceNumber?: Identifier[];
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">[];
  revenue?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  request?: Reference<
    "DeviceRequest" | "MedicationRequest" | "NutritionOrder" | "ServiceRequest" | "SupplyRequest" | "VisionPrescription"
  >[];
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
  tax?: Money;
  net?: Money;
  bodySite?: ClaimResponseAddItemBodySite[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ClaimResponseItemReviewOutcome;
  adjudication?: ClaimResponseItemAdjudication[];
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
  type?: CodeableConcept;
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
  expression?: FhirString[];
}

export interface ClaimResponse extends DomainResource {
  resourceType: "ClaimResponse";
  identifier?: Identifier[];
  traceNumber?: Identifier[];
  status: FhirCode;
  type: CodeableConcept;
  subType?: CodeableConcept;
  use: FhirCode;
  patient: Reference<"Patient">;
  created: FhirDateTime;
  insurer?: Reference<"Organization">;
  requestor?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  request?: Reference<"Claim">;
  outcome: FhirCode;
  decision?: CodeableConcept;
  disposition?: FhirString;
  preAuthRef?: FhirString;
  preAuthPeriod?: Period;
  event?: ClaimResponseEvent[];
  payeeType?: CodeableConcept;
  encounter?: Reference<"Encounter">[];
  diagnosisRelatedGroup?: CodeableConcept;
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
