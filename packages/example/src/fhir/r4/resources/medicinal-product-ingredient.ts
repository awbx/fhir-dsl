import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Ratio, Reference } from "../datatypes.js";
import type { FhirBoolean, FhirString } from "../primitives.js";

export interface MedicinalProductIngredientSpecifiedSubstanceStrengthReferenceStrength extends BackboneElement {
  substance?: CodeableConcept;
  strength: Ratio;
  strengthLowLimit?: Ratio;
  measurementPoint?: FhirString;
  country?: CodeableConcept[];
}

export interface MedicinalProductIngredientSpecifiedSubstanceStrength extends BackboneElement {
  presentation: Ratio;
  presentationLowLimit?: Ratio;
  concentration?: Ratio;
  concentrationLowLimit?: Ratio;
  measurementPoint?: FhirString;
  country?: CodeableConcept[];
  referenceStrength?: MedicinalProductIngredientSpecifiedSubstanceStrengthReferenceStrength[];
}

export interface MedicinalProductIngredientSpecifiedSubstance extends BackboneElement {
  code: CodeableConcept;
  group: CodeableConcept;
  confidentiality?: CodeableConcept;
  strength?: MedicinalProductIngredientSpecifiedSubstanceStrength[];
}

export interface MedicinalProductIngredientSubstance extends BackboneElement {
  code: CodeableConcept;
  strength?: MedicinalProductIngredientSpecifiedSubstanceStrength[];
}

export interface MedicinalProductIngredient extends DomainResource {
  resourceType: "MedicinalProductIngredient";
  identifier?: Identifier;
  role: CodeableConcept;
  allergenicIndicator?: FhirBoolean;
  manufacturer?: Reference<"Organization">[];
  specifiedSubstance?: MedicinalProductIngredientSpecifiedSubstance[];
  substance?: MedicinalProductIngredientSubstance;
}
