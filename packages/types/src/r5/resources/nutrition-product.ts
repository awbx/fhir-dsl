import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBase64Binary, FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface NutritionProductNutrient extends BackboneElement {
  item?: CodeableReference;
  amount?: Ratio[];
}

export interface NutritionProductIngredient extends BackboneElement {
  item: CodeableReference;
  amount?: Ratio[];
}

export interface NutritionProductCharacteristic extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueQuantity?: Quantity;
  valueBase64Binary?: FhirBase64Binary;
  valueAttachment?: Attachment;
  valueBoolean?: FhirBoolean;
}

export interface NutritionProductInstance extends BackboneElement {
  quantity?: Quantity;
  identifier?: Identifier[];
  name?: FhirString;
  lotNumber?: FhirString;
  expiry?: FhirDateTime;
  useBy?: FhirDateTime;
  biologicalSourceEvent?: Identifier;
}

export interface NutritionProduct extends DomainResource {
  resourceType: "NutritionProduct";
  code?: CodeableConcept;
  status: FhirCode;
  category?: CodeableConcept[];
  manufacturer?: Reference<"Organization">[];
  nutrient?: NutritionProductNutrient[];
  ingredient?: NutritionProductIngredient[];
  knownAllergen?: CodeableReference[];
  characteristic?: NutritionProductCharacteristic[];
  instance?: NutritionProductInstance[];
  note?: Annotation[];
}
