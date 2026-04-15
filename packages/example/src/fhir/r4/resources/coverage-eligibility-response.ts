import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Money,
  Period,
  Reference,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDate,
  FhirDateTime,
  FhirString,
  FhirUnsignedInt,
  FhirUri,
} from "../primitives.js";

export interface CoverageEligibilityResponseInsuranceItemBenefit extends BackboneElement {
  type: CodeableConcept;
  allowedUnsignedInt?: FhirUnsignedInt;
  allowedString?: FhirString;
  allowedMoney?: Money;
  usedUnsignedInt?: FhirUnsignedInt;
  usedString?: FhirString;
  usedMoney?: Money;
}

export interface CoverageEligibilityResponseInsuranceItem extends BackboneElement {
  category?: CodeableConcept;
  productOrService?: CodeableConcept;
  modifier?: CodeableConcept[];
  provider?: Reference<"Practitioner" | "PractitionerRole">;
  excluded?: FhirBoolean;
  name?: FhirString;
  description?: FhirString;
  network?: CodeableConcept;
  unit?: CodeableConcept;
  term?: CodeableConcept;
  benefit?: CoverageEligibilityResponseInsuranceItemBenefit[];
  authorizationRequired?: FhirBoolean;
  authorizationSupporting?: CodeableConcept[];
  authorizationUrl?: FhirUri;
}

export interface CoverageEligibilityResponseInsurance extends BackboneElement {
  coverage: Reference<"Coverage">;
  inforce?: FhirBoolean;
  benefitPeriod?: Period;
  item?: CoverageEligibilityResponseInsuranceItem[];
}

export interface CoverageEligibilityResponseError extends BackboneElement {
  code: CodeableConcept;
}

export interface CoverageEligibilityResponse extends DomainResource {
  resourceType: "CoverageEligibilityResponse";
  identifier?: Identifier[];
  status: FhirCode;
  purpose: FhirCode[];
  patient: Reference<"Patient">;
  servicedDate?: FhirDate;
  servicedPeriod?: Period;
  created: FhirDateTime;
  requestor?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  request: Reference<"CoverageEligibilityRequest">;
  outcome: FhirCode;
  disposition?: FhirString;
  insurer: Reference<"Organization">;
  insurance?: CoverageEligibilityResponseInsurance[];
  preAuthRef?: FhirString;
  form?: CodeableConcept;
  error?: CoverageEligibilityResponseError[];
}
