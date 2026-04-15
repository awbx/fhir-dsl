import type {
  Address,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  Coding,
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
  FhirUnsignedInt,
} from "../primitives.js";

export interface ExplanationOfBenefitRelated extends BackboneElement {
  claim?: Reference<"Claim">;
  relationship?: CodeableConcept;
  reference?: Identifier;
}

export interface ExplanationOfBenefitEvent extends BackboneElement {
  type: CodeableConcept;
  whenDateTime?: FhirDateTime;
  whenPeriod?: Period;
}

export interface ExplanationOfBenefitPayee extends BackboneElement {
  type?: CodeableConcept;
  party?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson">;
}

export interface ExplanationOfBenefitCareTeam extends BackboneElement {
  sequence: FhirPositiveInt;
  provider: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  responsible?: FhirBoolean;
  role?: CodeableConcept;
  specialty?: CodeableConcept;
}

export interface ExplanationOfBenefitSupportingInfo extends BackboneElement {
  sequence: FhirPositiveInt;
  category: CodeableConcept;
  code?: CodeableConcept;
  timingDate?: FhirDate;
  timingPeriod?: Period;
  valueBoolean?: FhirBoolean;
  valueString?: FhirString;
  valueQuantity?: Quantity;
  valueAttachment?: Attachment;
  valueReference?: Reference<"Resource">;
  valueIdentifier?: Identifier;
  reason?: Coding;
}

export interface ExplanationOfBenefitDiagnosis extends BackboneElement {
  sequence: FhirPositiveInt;
  diagnosisCodeableConcept?: CodeableConcept;
  diagnosisReference?: Reference<"Condition">;
  type?: CodeableConcept[];
  onAdmission?: CodeableConcept;
}

export interface ExplanationOfBenefitProcedure extends BackboneElement {
  sequence: FhirPositiveInt;
  type?: CodeableConcept[];
  date?: FhirDateTime;
  procedureCodeableConcept?: CodeableConcept;
  procedureReference?: Reference<"Procedure">;
  udi?: Reference<"Device">[];
}

export interface ExplanationOfBenefitInsurance extends BackboneElement {
  focal: FhirBoolean;
  coverage: Reference<"Coverage">;
  preAuthRef?: FhirString[];
}

export interface ExplanationOfBenefitAccident extends BackboneElement {
  date?: FhirDate;
  type?: CodeableConcept;
  locationAddress?: Address;
  locationReference?: Reference<"Location">;
}

export interface ExplanationOfBenefitItemBodySite extends BackboneElement {
  site: CodeableReference[];
  subSite?: CodeableConcept[];
}

export interface ExplanationOfBenefitItemReviewOutcome extends BackboneElement {
  decision?: CodeableConcept;
  reason?: CodeableConcept[];
  preAuthRef?: FhirString;
  preAuthPeriod?: Period;
}

export interface ExplanationOfBenefitItemAdjudication extends BackboneElement {
  category: CodeableConcept;
  reason?: CodeableConcept;
  amount?: Money;
  quantity?: Quantity;
}

export interface ExplanationOfBenefitItemDetailSubDetail extends BackboneElement {
  sequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  category?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  programCode?: CodeableConcept[];
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  udi?: Reference<"Device">[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
}

export interface ExplanationOfBenefitItemDetail extends BackboneElement {
  sequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  category?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  programCode?: CodeableConcept[];
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  udi?: Reference<"Device">[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  subDetail?: ExplanationOfBenefitItemDetailSubDetail[];
}

export interface ExplanationOfBenefitItem extends BackboneElement {
  sequence: FhirPositiveInt;
  careTeamSequence?: FhirPositiveInt[];
  diagnosisSequence?: FhirPositiveInt[];
  procedureSequence?: FhirPositiveInt[];
  informationSequence?: FhirPositiveInt[];
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  category?: CodeableConcept;
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
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  udi?: Reference<"Device">[];
  bodySite?: ExplanationOfBenefitItemBodySite[];
  encounter?: Reference<"Encounter">[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  detail?: ExplanationOfBenefitItemDetail[];
}

export interface ExplanationOfBenefitAddItemBodySite extends BackboneElement {
  site: CodeableReference[];
  subSite?: CodeableConcept[];
}

export interface ExplanationOfBenefitAddItemDetailSubDetail extends BackboneElement {
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
}

export interface ExplanationOfBenefitAddItemDetail extends BackboneElement {
  traceNumber?: Identifier[];
  revenue?: CodeableConcept;
  productOrService?: CodeableConcept;
  productOrServiceEnd?: CodeableConcept;
  modifier?: CodeableConcept[];
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  subDetail?: ExplanationOfBenefitAddItemDetailSubDetail[];
}

export interface ExplanationOfBenefitAddItem extends BackboneElement {
  itemSequence?: FhirPositiveInt[];
  detailSequence?: FhirPositiveInt[];
  subDetailSequence?: FhirPositiveInt[];
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
  patientPaid?: Money;
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  tax?: Money;
  net?: Money;
  bodySite?: ExplanationOfBenefitAddItemBodySite[];
  noteNumber?: FhirPositiveInt[];
  reviewOutcome?: ExplanationOfBenefitItemReviewOutcome;
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  detail?: ExplanationOfBenefitAddItemDetail[];
}

export interface ExplanationOfBenefitTotal extends BackboneElement {
  category: CodeableConcept;
  amount: Money;
}

export interface ExplanationOfBenefitPayment extends BackboneElement {
  type?: CodeableConcept;
  adjustment?: Money;
  adjustmentReason?: CodeableConcept;
  date?: FhirDate;
  amount?: Money;
  identifier?: Identifier;
}

export interface ExplanationOfBenefitProcessNote extends BackboneElement {
  number?: FhirPositiveInt;
  type?: CodeableConcept;
  text?: FhirString;
  language?: CodeableConcept;
}

export interface ExplanationOfBenefitBenefitBalanceFinancial extends BackboneElement {
  type: CodeableConcept;
  allowedUnsignedInt?: FhirUnsignedInt;
  allowedString?: FhirString;
  allowedMoney?: Money;
  usedUnsignedInt?: FhirUnsignedInt;
  usedMoney?: Money;
}

export interface ExplanationOfBenefitBenefitBalance extends BackboneElement {
  category: CodeableConcept;
  excluded?: FhirBoolean;
  name?: FhirString;
  description?: FhirString;
  network?: CodeableConcept;
  unit?: CodeableConcept;
  term?: CodeableConcept;
  financial?: ExplanationOfBenefitBenefitBalanceFinancial[];
}

export interface ExplanationOfBenefit extends DomainResource {
  resourceType: "ExplanationOfBenefit";
  identifier?: Identifier[];
  traceNumber?: Identifier[];
  status: FhirCode;
  type: CodeableConcept;
  subType?: CodeableConcept;
  use: FhirCode;
  patient: Reference<"Patient">;
  billablePeriod?: Period;
  created: FhirDateTime;
  enterer?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson">;
  insurer?: Reference<"Organization">;
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  priority?: CodeableConcept;
  fundsReserveRequested?: CodeableConcept;
  fundsReserve?: CodeableConcept;
  related?: ExplanationOfBenefitRelated[];
  prescription?: Reference<"MedicationRequest" | "VisionPrescription">;
  originalPrescription?: Reference<"MedicationRequest">;
  event?: ExplanationOfBenefitEvent[];
  payee?: ExplanationOfBenefitPayee;
  referral?: Reference<"ServiceRequest">;
  encounter?: Reference<"Encounter">[];
  facility?: Reference<"Location" | "Organization">;
  claim?: Reference<"Claim">;
  claimResponse?: Reference<"ClaimResponse">;
  outcome: FhirCode;
  decision?: CodeableConcept;
  disposition?: FhirString;
  preAuthRef?: FhirString[];
  preAuthRefPeriod?: Period[];
  diagnosisRelatedGroup?: CodeableConcept;
  careTeam?: ExplanationOfBenefitCareTeam[];
  supportingInfo?: ExplanationOfBenefitSupportingInfo[];
  diagnosis?: ExplanationOfBenefitDiagnosis[];
  procedure?: ExplanationOfBenefitProcedure[];
  precedence?: FhirPositiveInt;
  insurance?: ExplanationOfBenefitInsurance[];
  accident?: ExplanationOfBenefitAccident;
  patientPaid?: Money;
  item?: ExplanationOfBenefitItem[];
  addItem?: ExplanationOfBenefitAddItem[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  total?: ExplanationOfBenefitTotal[];
  payment?: ExplanationOfBenefitPayment;
  formCode?: CodeableConcept;
  form?: Attachment;
  processNote?: ExplanationOfBenefitProcessNote[];
  benefitPeriod?: Period;
  benefitBalance?: ExplanationOfBenefitBenefitBalance[];
}
