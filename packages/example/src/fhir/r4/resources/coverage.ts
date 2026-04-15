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

export interface CoverageClass extends BackboneElement {
  type: CodeableConcept;
  value: FhirString;
  name?: FhirString;
}

export interface CoverageCostToBeneficiaryException extends BackboneElement {
  type: CodeableConcept;
  period?: Period;
}

export interface CoverageCostToBeneficiary extends BackboneElement {
  type?: CodeableConcept;
  valueQuantity?: Quantity;
  valueMoney?: Money;
  exception?: CoverageCostToBeneficiaryException[];
}

export interface Coverage extends DomainResource {
  resourceType: "Coverage";
  identifier?: Identifier[];
  status: FhirCode;
  type?: CodeableConcept;
  policyHolder?: Reference<"Patient" | "RelatedPerson" | "Organization">;
  subscriber?: Reference<"Patient" | "RelatedPerson">;
  subscriberId?: FhirString;
  beneficiary: Reference<"Patient">;
  dependent?: FhirString;
  relationship?: CodeableConcept;
  period?: Period;
  payor: Reference<"Organization" | "Patient" | "RelatedPerson">[];
  class?: CoverageClass[];
  order?: FhirPositiveInt;
  network?: FhirString;
  costToBeneficiary?: CoverageCostToBeneficiary[];
  subrogation?: FhirBoolean;
  contract?: Reference<"Contract">[];
}
