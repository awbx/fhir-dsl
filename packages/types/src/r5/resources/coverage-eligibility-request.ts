import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirDateTime, FhirPositiveInt, FhirString } from "../primitives.js";

export interface CoverageEligibilityRequestEvent extends BackboneElement {
  type: CodeableConcept;
  whenDateTime?: FhirDateTime;
  whenPeriod?: Period;
}

export interface CoverageEligibilityRequestSupportingInfo extends BackboneElement {
  sequence: FhirPositiveInt;
  information: Reference<"Resource">;
  appliesToAll?: FhirBoolean;
}

export interface CoverageEligibilityRequestInsurance extends BackboneElement {
  focal?: FhirBoolean;
  coverage: Reference<"Coverage">;
  businessArrangement?: FhirString;
}

export interface CoverageEligibilityRequestItemDiagnosis extends BackboneElement {
  diagnosisCodeableConcept?: CodeableConcept;
  diagnosisReference?: Reference<"Condition">;
}

export interface CoverageEligibilityRequestItem extends BackboneElement {
  supportingInfoSequence?: FhirPositiveInt[];
  category?: CodeableConcept;
  productOrService?: CodeableConcept;
  modifier?: CodeableConcept[];
  provider?: Reference<"Practitioner" | "PractitionerRole">;
  quantity?: Quantity;
  unitPrice?: Money;
  facility?: Reference<"Location" | "Organization">;
  diagnosis?: CoverageEligibilityRequestItemDiagnosis[];
  detail?: Reference<"Resource">[];
}

export interface CoverageEligibilityRequest extends DomainResource {
  resourceType: "CoverageEligibilityRequest";
  identifier?: Identifier[];
  status: FhirCode;
  priority?: CodeableConcept;
  purpose: FhirCode[];
  patient: Reference<"Patient">;
  event?: CoverageEligibilityRequestEvent[];
  servicedDate?: FhirDate;
  servicedPeriod?: Period;
  created: FhirDateTime;
  enterer?: Reference<"Practitioner" | "PractitionerRole">;
  provider?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  insurer: Reference<"Organization">;
  facility?: Reference<"Location">;
  supportingInfo?: CoverageEligibilityRequestSupportingInfo[];
  insurance?: CoverageEligibilityRequestInsurance[];
  item?: CoverageEligibilityRequestItem[];
}
