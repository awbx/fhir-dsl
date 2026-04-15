import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Ratio,
  RatioRange,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirMarkdown, FhirString } from "../primitives.js";

export interface IngredientManufacturer extends BackboneElement {
  role?: FhirCode;
  manufacturer: Reference<"Organization">;
}

export interface IngredientSubstanceStrengthReferenceStrength extends BackboneElement {
  substance: CodeableReference;
  strengthRatio?: Ratio;
  strengthRatioRange?: RatioRange;
  strengthQuantity?: Quantity;
  measurementPoint?: FhirString;
  country?: CodeableConcept[];
}

export interface IngredientSubstanceStrength extends BackboneElement {
  presentationRatio?: Ratio;
  presentationRatioRange?: RatioRange;
  presentationCodeableConcept?: CodeableConcept;
  presentationQuantity?: Quantity;
  textPresentation?: FhirString;
  concentrationRatio?: Ratio;
  concentrationRatioRange?: RatioRange;
  concentrationCodeableConcept?: CodeableConcept;
  concentrationQuantity?: Quantity;
  textConcentration?: FhirString;
  basis?: CodeableConcept;
  measurementPoint?: FhirString;
  country?: CodeableConcept[];
  referenceStrength?: IngredientSubstanceStrengthReferenceStrength[];
}

export interface IngredientSubstance extends BackboneElement {
  code: CodeableReference;
  strength?: IngredientSubstanceStrength[];
}

export interface Ingredient extends DomainResource {
  resourceType: "Ingredient";
  identifier?: Identifier;
  status: FhirCode;
  for?: Reference<"MedicinalProductDefinition" | "AdministrableProductDefinition" | "ManufacturedItemDefinition">[];
  role: CodeableConcept;
  function?: CodeableConcept[];
  group?: CodeableConcept;
  allergenicIndicator?: FhirBoolean;
  comment?: FhirMarkdown;
  manufacturer?: IngredientManufacturer[];
  substance: IngredientSubstance;
}
