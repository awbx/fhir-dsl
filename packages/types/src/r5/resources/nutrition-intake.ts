import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface NutritionIntakeConsumedItem extends BackboneElement {
  type: CodeableConcept;
  nutritionProduct: CodeableReference;
  schedule?: Timing;
  amount?: Quantity;
  rate?: Quantity;
  notConsumed?: FhirBoolean;
  notConsumedReason?: CodeableConcept;
}

export interface NutritionIntakeIngredientLabel extends BackboneElement {
  nutrient: CodeableReference;
  amount: Quantity;
}

export interface NutritionIntakePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "CareTeam" | "Patient" | "Device" | "RelatedPerson"
  >;
}

export interface NutritionIntake extends DomainResource {
  resourceType: "NutritionIntake";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"NutritionOrder" | "CarePlan" | "ServiceRequest">[];
  partOf?: Reference<"NutritionIntake" | "Procedure" | "Observation">[];
  status: FhirCode;
  statusReason?: CodeableConcept[];
  code?: CodeableConcept;
  subject: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  recorded?: FhirDateTime;
  reportedBoolean?: FhirBoolean;
  reportedReference?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Organization">;
  consumedItem: NutritionIntakeConsumedItem[];
  ingredientLabel?: NutritionIntakeIngredientLabel[];
  performer?: NutritionIntakePerformer[];
  location?: Reference<"Location">;
  derivedFrom?: Reference<"Resource">[];
  reason?: CodeableReference[];
  note?: Annotation[];
}
