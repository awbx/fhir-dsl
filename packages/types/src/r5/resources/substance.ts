import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Ratio,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirMarkdown } from "../primitives.js";

export interface SubstanceIngredient extends BackboneElement {
  quantity?: Ratio;
  substanceCodeableConcept?: CodeableConcept;
  substanceReference?: Reference<"Substance">;
}

export interface Substance extends DomainResource {
  resourceType: "Substance";
  identifier?: Identifier[];
  instance: FhirBoolean;
  status?: FhirCode;
  category?: CodeableConcept[];
  code: CodeableReference;
  description?: FhirMarkdown;
  expiry?: FhirDateTime;
  quantity?: Quantity;
  ingredient?: SubstanceIngredient[];
}
