import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirDecimal, FhirPositiveInt, FhirString, FhirUnsignedInt } from "../primitives.js";
import type { Address, Attachment, BackboneElement, CodeableConcept, Coding, DomainResource, Identifier, Money, Period, Quantity, Reference } from "../datatypes.js";

export interface ExplanationOfBenefitRelated extends BackboneElement {
  claim?: Reference<"Claim">;
  relationship?: CodeableConcept;
  reference?: Identifier;
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
  qualification?: CodeableConcept;
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
  reason?: Coding;
}

export interface ExplanationOfBenefitDiagnosis extends BackboneElement {
  sequence: FhirPositiveInt;
  diagnosisCodeableConcept?: CodeableConcept;
  diagnosisReference?: Reference<"Condition">;
  type?: CodeableConcept[];
  onAdmission?: CodeableConcept;
  packageCode?: CodeableConcept;
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

export interface ExplanationOfBenefitItemAdjudication extends BackboneElement {
  category: CodeableConcept;
  reason?: CodeableConcept;
  amount?: Money;
  value?: FhirDecimal;
}

export interface ExplanationOfBenefitItemDetailSubDetail extends BackboneElement {
  sequence: FhirPositiveInt;
  revenue?: CodeableConcept;
  category?: CodeableConcept;
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  programCode?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  udi?: Reference<"Device">[];
  noteNumber?: FhirPositiveInt[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
}

export interface ExplanationOfBenefitItemDetail extends BackboneElement {
  sequence: FhirPositiveInt;
  revenue?: CodeableConcept;
  category?: CodeableConcept;
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  programCode?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  udi?: Reference<"Device">[];
  noteNumber?: FhirPositiveInt[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  subDetail?: ExplanationOfBenefitItemDetailSubDetail[];
}

export interface ExplanationOfBenefitItem extends BackboneElement {
  sequence: FhirPositiveInt;
  careTeamSequence?: FhirPositiveInt[];
  diagnosisSequence?: FhirPositiveInt[];
  procedureSequence?: FhirPositiveInt[];
  informationSequence?: FhirPositiveInt[];
  revenue?: CodeableConcept;
  category?: CodeableConcept;
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
  udi?: Reference<"Device">[];
  bodySite?: CodeableConcept;
  subSite?: CodeableConcept[];
  encounter?: Reference<"Encounter">[];
  noteNumber?: FhirPositiveInt[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  detail?: ExplanationOfBenefitItemDetail[];
}

export interface ExplanationOfBenefitAddItemDetailSubDetail extends BackboneElement {
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
}

export interface ExplanationOfBenefitAddItemDetail extends BackboneElement {
  productOrService: CodeableConcept;
  modifier?: CodeableConcept[];
  quantity?: Quantity;
  unitPrice?: Money;
  factor?: FhirDecimal;
  net?: Money;
  noteNumber?: FhirPositiveInt[];
  adjudication?: ExplanationOfBenefitItemAdjudication[];
  subDetail?: ExplanationOfBenefitAddItemDetailSubDetail[];
}

export interface ExplanationOfBenefitAddItem extends BackboneElement {
  itemSequence?: FhirPositiveInt[];
  detailSequence?: FhirPositiveInt[];
  subDetailSequence?: FhirPositiveInt[];
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
  type?: FhirCode;
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
  status: FhirCode;
  type: CodeableConcept;
  subType?: CodeableConcept;
  use: FhirCode;
  patient: Reference<"Patient">;
  billablePeriod?: Period;
  created: FhirDateTime;
  enterer?: Reference<"Practitioner" | "PractitionerRole">;
  insurer: Reference<"Organization">;
  provider: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  priority?: CodeableConcept;
  fundsReserveRequested?: CodeableConcept;
  fundsReserve?: CodeableConcept;
  related?: ExplanationOfBenefitRelated[];
  prescription?: Reference<"MedicationRequest" | "VisionPrescription">;
  originalPrescription?: Reference<"MedicationRequest">;
  payee?: ExplanationOfBenefitPayee;
  referral?: Reference<"ServiceRequest">;
  facility?: Reference<"Location">;
  claim?: Reference<"Claim">;
  claimResponse?: Reference<"ClaimResponse">;
  outcome: FhirCode;
  disposition?: FhirString;
  preAuthRef?: FhirString[];
  preAuthRefPeriod?: Period[];
  careTeam?: ExplanationOfBenefitCareTeam[];
  supportingInfo?: ExplanationOfBenefitSupportingInfo[];
  diagnosis?: ExplanationOfBenefitDiagnosis[];
  procedure?: ExplanationOfBenefitProcedure[];
  precedence?: FhirPositiveInt;
  insurance: ExplanationOfBenefitInsurance[];
  accident?: ExplanationOfBenefitAccident;
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
