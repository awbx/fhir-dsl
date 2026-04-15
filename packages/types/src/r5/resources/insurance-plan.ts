import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Money,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirPositiveInt, FhirString } from "../primitives.js";

export interface InsurancePlanCoverageBenefitLimit extends BackboneElement {
  value?: Quantity;
  code?: CodeableConcept;
}

export interface InsurancePlanCoverageBenefit extends BackboneElement {
  type: CodeableConcept;
  requirement?: FhirString;
  limit?: InsurancePlanCoverageBenefitLimit[];
}

export interface InsurancePlanCoverage extends BackboneElement {
  type: CodeableConcept;
  network?: Reference<"Organization">[];
  benefit: InsurancePlanCoverageBenefit[];
}

export interface InsurancePlanPlanGeneralCost extends BackboneElement {
  type?: CodeableConcept;
  groupSize?: FhirPositiveInt;
  cost?: Money;
  comment?: FhirString;
}

export interface InsurancePlanPlanSpecificCostBenefitCost extends BackboneElement {
  type: CodeableConcept;
  applicability?: CodeableConcept;
  qualifiers?: CodeableConcept[];
  value?: Quantity;
}

export interface InsurancePlanPlanSpecificCostBenefit extends BackboneElement {
  type: CodeableConcept;
  cost?: InsurancePlanPlanSpecificCostBenefitCost[];
}

export interface InsurancePlanPlanSpecificCost extends BackboneElement {
  category: CodeableConcept;
  benefit?: InsurancePlanPlanSpecificCostBenefit[];
}

export interface InsurancePlanPlan extends BackboneElement {
  identifier?: Identifier[];
  type?: CodeableConcept;
  coverageArea?: Reference<"Location">[];
  network?: Reference<"Organization">[];
  generalCost?: InsurancePlanPlanGeneralCost[];
  specificCost?: InsurancePlanPlanSpecificCost[];
}

export interface InsurancePlan extends DomainResource {
  resourceType: "InsurancePlan";
  identifier?: Identifier[];
  status?: FhirCode;
  type?: CodeableConcept[];
  name?: FhirString;
  alias?: FhirString[];
  period?: Period;
  ownedBy?: Reference<"Organization">;
  administeredBy?: Reference<"Organization">;
  coverageArea?: Reference<"Location">[];
  contact?: ExtendedContactDetail[];
  endpoint?: Reference<"Endpoint">[];
  network?: Reference<"Organization">[];
  coverage?: InsurancePlanCoverage[];
  plan?: InsurancePlanPlan[];
}
