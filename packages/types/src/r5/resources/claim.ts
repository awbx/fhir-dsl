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

export interface ClaimRelated extends BackboneElement {
  claim?: Reference<"Claim">;
  relationship?: CodeableConcept;
  reference?: Identifier;
}

export interface ClaimPayee extends BackboneElement {
  type: CodeableConcept;
  party?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson">;
}

export interface ClaimEvent extends BackboneElement {
  type: CodeableConcept;
  whenDateTime?: FhirDateTime;
  whenPeriod?: Period;
}

export interface ClaimCareTeam extends BackboneElement {
  sequence: FhirPositiveInt;
  provider: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  responsible?: FhirBoolean;
  role?: CodeableConcept;
  specialty?: CodeableConcept;
}

export interface ClaimSupportingInfo extends BackboneElement {
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
  reason?: CodeableConcept;
}

export interface ClaimDiagnosis extends BackboneElement {
  sequence: FhirPositiveInt;
  diagnosisCodeableConcept?: CodeableConcept;
  diagnosisReference?: Reference<"Condition">;
  type?: CodeableConcept[];
  onAdmission?: CodeableConcept;
}

export interface ClaimProcedure extends BackboneElement {
  sequence: FhirPositiveInt;
  type?: CodeableConcept[];
  date?: FhirDateTime;
  procedureCodeableConcept?: CodeableConcept;
  procedureReference?: Reference<"Procedure">;
  udi?: Reference<"Device">[];
}

export interface ClaimInsurance extends BackboneElement {
  sequence: FhirPositiveInt;
  focal: FhirBoolean;
  identifier?: Identifier;
  coverage: Reference<"Coverage">;
  businessArrangement?: FhirString;
  preAuthRef?: FhirString[];
  claimResponse?: Reference<"ClaimResponse">;
}

export interface ClaimAccident extends BackboneElement {
  date: FhirDate;
  type?: CodeableConcept;
  locationAddress?: Address;
  locationReference?: Reference<"Location">;
}

export interface ClaimItemBodySite extends BackboneElement {
  site: CodeableReference[];
  subSite?: CodeableConcept[];
}

export interface ClaimItemDetailSubDetail extends BackboneElement {
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
}

export interface ClaimItemDetail extends BackboneElement {
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
  subDetail?: ClaimItemDetailSubDetail[];
}

export interface ClaimItem extends BackboneElement {
  sequence: FhirPositiveInt;
  traceNumber?: Identifier[];
  careTeamSequence?: FhirPositiveInt[];
  diagnosisSequence?: FhirPositiveInt[];
  procedureSequence?: FhirPositiveInt[];
  informationSequence?: FhirPositiveInt[];
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
  bodySite?: ClaimItemBodySite[];
  encounter?: Reference<"Encounter">[];
  detail?: ClaimItemDetail[];
}

export interface Claim extends DomainResource {
  resourceType: "Claim";
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
  fundsReserve?: CodeableConcept;
  related?: ClaimRelated[];
  prescription?: Reference<"DeviceRequest" | "MedicationRequest" | "VisionPrescription">;
  originalPrescription?: Reference<"DeviceRequest" | "MedicationRequest" | "VisionPrescription">;
  payee?: ClaimPayee;
  referral?: Reference<"ServiceRequest">;
  encounter?: Reference<"Encounter">[];
  facility?: Reference<"Location" | "Organization">;
  diagnosisRelatedGroup?: CodeableConcept;
  event?: ClaimEvent[];
  careTeam?: ClaimCareTeam[];
  supportingInfo?: ClaimSupportingInfo[];
  diagnosis?: ClaimDiagnosis[];
  procedure?: ClaimProcedure[];
  insurance?: ClaimInsurance[];
  accident?: ClaimAccident;
  patientPaid?: Money;
  item?: ClaimItem[];
  total?: Money;
}
