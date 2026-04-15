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

export interface ClaimRelated extends BackboneElement {
  claim?: Reference<"Claim">;
  relationship?: CodeableConcept;
  reference?: Identifier;
}

export interface ClaimPayee extends BackboneElement {
  type: CodeableConcept;
  party?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson">;
}

export interface ClaimCareTeam extends BackboneElement {
  sequence: FhirPositiveInt;
  provider: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  responsible?: FhirBoolean;
  role?: CodeableConcept;
  qualification?: CodeableConcept;
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
  reason?: CodeableConcept;
}

export interface ClaimDiagnosis extends BackboneElement {
  sequence: FhirPositiveInt;
  diagnosisCodeableConcept?: CodeableConcept;
  diagnosisReference?: Reference<"Condition">;
  type?: CodeableConcept[];
  onAdmission?: CodeableConcept;
  packageCode?: CodeableConcept;
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

export interface ClaimItemDetailSubDetail extends BackboneElement {
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
}

export interface ClaimItemDetail extends BackboneElement {
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
  subDetail?: ClaimItemDetailSubDetail[];
}

export interface ClaimItem extends BackboneElement {
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
  detail?: ClaimItemDetail[];
}

export interface Claim extends DomainResource {
  resourceType: "Claim";
  identifier?: Identifier[];
  status: FhirCode;
  type: CodeableConcept;
  subType?: CodeableConcept;
  use: FhirCode;
  patient: Reference<"Patient">;
  billablePeriod?: Period;
  created: FhirDateTime;
  enterer?: Reference<"Practitioner" | "PractitionerRole">;
  insurer?: Reference<"Organization">;
  provider: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  priority: CodeableConcept;
  fundsReserve?: CodeableConcept;
  related?: ClaimRelated[];
  prescription?: Reference<"DeviceRequest" | "MedicationRequest" | "VisionPrescription">;
  originalPrescription?: Reference<"DeviceRequest" | "MedicationRequest" | "VisionPrescription">;
  payee?: ClaimPayee;
  referral?: Reference<"ServiceRequest">;
  facility?: Reference<"Location">;
  careTeam?: ClaimCareTeam[];
  supportingInfo?: ClaimSupportingInfo[];
  diagnosis?: ClaimDiagnosis[];
  procedure?: ClaimProcedure[];
  insurance: ClaimInsurance[];
  accident?: ClaimAccident;
  item?: ClaimItem[];
  total?: Money;
}
