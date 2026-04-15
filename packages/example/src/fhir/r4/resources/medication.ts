import type { FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Ratio, Reference } from "../datatypes.js";

export interface MedicationIngredient extends BackboneElement {
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference<"Substance" | "Medication">;
  isActive?: FhirBoolean;
  strength?: Ratio;
}

export interface MedicationBatch extends BackboneElement {
  lotNumber?: FhirString;
  expirationDate?: FhirDateTime;
}

export interface Medication extends DomainResource {
  resourceType: "Medication";
  identifier?: Identifier[];
  code?: CodeableConcept;
  status?: FhirCode;
  manufacturer?: Reference<"Organization">;
  form?: CodeableConcept;
  amount?: Ratio;
  ingredient?: MedicationIngredient[];
  batch?: MedicationBatch;
}
