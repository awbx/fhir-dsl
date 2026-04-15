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
import type { FhirBoolean, FhirCode, FhirPositiveInt, FhirString } from "../primitives.js";

export interface CoveragePaymentBy extends BackboneElement {
  party: Reference<"Patient" | "RelatedPerson" | "Organization">;
  responsibility?: FhirString;
}

export interface CoverageClass extends BackboneElement {
  type: CodeableConcept;
  value: Identifier;
  name?: FhirString;
}

export interface CoverageCostToBeneficiaryException extends BackboneElement {
  type: CodeableConcept;
  period?: Period;
}

export interface CoverageCostToBeneficiary extends BackboneElement {
  type?: CodeableConcept;
  category?: CodeableConcept;
  network?: CodeableConcept;
  unit?: CodeableConcept;
  term?: CodeableConcept;
  valueQuantity?: Quantity;
  valueMoney?: Money;
  exception?: CoverageCostToBeneficiaryException[];
}

export interface Coverage extends DomainResource {
  resourceType: "Coverage";
  identifier?: Identifier[];
  status: FhirCode;
  kind: FhirCode;
  paymentBy?: CoveragePaymentBy[];
  type?: CodeableConcept;
  policyHolder?: Reference<"Patient" | "RelatedPerson" | "Organization">;
  subscriber?: Reference<"Patient" | "RelatedPerson">;
  subscriberId?: Identifier[];
  beneficiary: Reference<"Patient">;
  dependent?: FhirString;
  relationship?: CodeableConcept;
  period?: Period;
  insurer?: Reference<"Organization">;
  class?: CoverageClass[];
  order?: FhirPositiveInt;
  network?: FhirString;
  costToBeneficiary?: CoverageCostToBeneficiary[];
  subrogation?: FhirBoolean;
  contract?: Reference<"Contract">[];
  insurancePlan?: Reference<"InsurancePlan">;
}
