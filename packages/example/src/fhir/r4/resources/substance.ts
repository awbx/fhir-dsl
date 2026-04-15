import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Quantity, Ratio, Reference } from "../datatypes.js";

export interface SubstanceInstance extends BackboneElement {
  identifier?: Identifier;
  expiry?: FhirDateTime;
  quantity?: Quantity;
}

export interface SubstanceIngredient extends BackboneElement {
  quantity?: Ratio;
  substanceCodeableConcept?: CodeableConcept;
  substanceReference?: Reference<"Substance">;
}

export interface Substance extends DomainResource {
  resourceType: "Substance";
  identifier?: Identifier[];
  status?: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  description?: FhirString;
  instance?: SubstanceInstance[];
  ingredient?: SubstanceIngredient[];
}
