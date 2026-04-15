import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Ratio,
  Reference,
  Timing,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCanonical,
  FhirCode,
  FhirDateTime,
  FhirMarkdown,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface NutritionOrderOralDietSchedule extends BackboneElement {
  timing?: Timing[];
  asNeeded?: FhirBoolean;
  asNeededFor?: CodeableConcept;
}

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
  schedule?: NutritionOrderOralDietSchedule;
  nutrient?: NutritionOrderOralDietNutrient[];
  texture?: NutritionOrderOralDietTexture[];
  fluidConsistencyType?: CodeableConcept[];
  instruction?: FhirString;
}

export interface NutritionOrderSupplementSchedule extends BackboneElement {
  timing?: Timing[];
  asNeeded?: FhirBoolean;
  asNeededFor?: CodeableConcept;
}

export interface NutritionOrderSupplement extends BackboneElement {
  type?: CodeableReference;
  productName?: FhirString;
  schedule?: NutritionOrderSupplementSchedule;
  quantity?: Quantity;
  instruction?: FhirString;
}

export interface NutritionOrderEnteralFormulaAdditive extends BackboneElement {
  type?: CodeableReference;
  productName?: FhirString;
  quantity?: Quantity;
}

export interface NutritionOrderEnteralFormulaAdministrationSchedule extends BackboneElement {
  timing?: Timing[];
  asNeeded?: FhirBoolean;
  asNeededFor?: CodeableConcept;
}

export interface NutritionOrderEnteralFormulaAdministration extends BackboneElement {
  schedule?: NutritionOrderEnteralFormulaAdministrationSchedule;
  quantity?: Quantity;
  rateQuantity?: Quantity;
  rateRatio?: Ratio;
}

export interface NutritionOrderEnteralFormula extends BackboneElement {
  baseFormulaType?: CodeableReference;
  baseFormulaProductName?: FhirString;
  deliveryDevice?: CodeableReference[];
  additive?: NutritionOrderEnteralFormulaAdditive[];
  caloricDensity?: Quantity;
  routeOfAdministration?: CodeableConcept;
  administration?: NutritionOrderEnteralFormulaAdministration[];
  maxVolumeToDeliver?: Quantity;
  administrationInstruction?: FhirMarkdown;
}

export interface NutritionOrder extends DomainResource {
  resourceType: "NutritionOrder";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  instantiates?: FhirUri[];
  basedOn?: Reference<"CarePlan" | "NutritionOrder" | "ServiceRequest">[];
  groupIdentifier?: Identifier;
  status: FhirCode;
  intent: FhirCode;
  priority?: FhirCode;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  dateTime: FhirDateTime;
  orderer?: Reference<"Practitioner" | "PractitionerRole">;
  performer?: CodeableReference[];
  allergyIntolerance?: Reference<"AllergyIntolerance">[];
  foodPreferenceModifier?: CodeableConcept[];
  excludeFoodModifier?: CodeableConcept[];
  outsideFoodAllowed?: FhirBoolean;
  oralDiet?: NutritionOrderOralDiet;
  supplement?: NutritionOrderSupplement[];
  enteralFormula?: NutritionOrderEnteralFormula;
  note?: Annotation[];
}
