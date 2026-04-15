import type { FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Quantity, Ratio, Reference, Timing } from "../datatypes.js";

export interface NutritionOrderOralDietNutrient extends BackboneElement {
  modifier?: CodeableConcept;
  amount?: Quantity;
}

export interface NutritionOrderOralDietTexture extends BackboneElement {
  modifier?: CodeableConcept;
  foodType?: CodeableConcept;
}

export interface NutritionOrderOralDiet extends BackboneElement {
  type?: CodeableConcept[];
  schedule?: Timing[];
  nutrient?: NutritionOrderOralDietNutrient[];
  texture?: NutritionOrderOralDietTexture[];
  fluidConsistencyType?: CodeableConcept[];
  instruction?: FhirString;
}

export interface NutritionOrderSupplement extends BackboneElement {
  type?: CodeableConcept;
  productName?: FhirString;
  schedule?: Timing[];
  quantity?: Quantity;
  instruction?: FhirString;
}

export interface NutritionOrderEnteralFormulaAdministration extends BackboneElement {
  schedule?: Timing;
  quantity?: Quantity;
  rateQuantity?: Quantity;
  rateRatio?: Ratio;
}

export interface NutritionOrderEnteralFormula extends BackboneElement {
  baseFormulaType?: CodeableConcept;
  baseFormulaProductName?: FhirString;
  additiveType?: CodeableConcept;
  additiveProductName?: FhirString;
  caloricDensity?: Quantity;
  routeofAdministration?: CodeableConcept;
  administration?: NutritionOrderEnteralFormulaAdministration[];
  maxVolumeToDeliver?: Quantity;
  administrationInstruction?: FhirString;
}

export interface NutritionOrder extends DomainResource {
  resourceType: "NutritionOrder";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  instantiates?: FhirUri[];
  status: FhirCode;
  intent: FhirCode;
  patient: Reference<"Patient">;
  encounter?: Reference<"Encounter">;
  dateTime: FhirDateTime;
  orderer?: Reference<"Practitioner" | "PractitionerRole">;
  allergyIntolerance?: Reference<"AllergyIntolerance">[];
  foodPreferenceModifier?: CodeableConcept[];
  excludeFoodModifier?: CodeableConcept[];
  oralDiet?: NutritionOrderOralDiet;
  supplement?: NutritionOrderSupplement[];
  enteralFormula?: NutritionOrderEnteralFormula;
  note?: Annotation[];
}
