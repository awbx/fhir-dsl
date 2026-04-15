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
import type { FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface MedicationIngredient extends BackboneElement {
  item: CodeableReference;
  isActive?: FhirBoolean;
  strengthRatio?: Ratio;
  strengthCodeableConcept?: CodeableConcept;
  strengthQuantity?: Quantity;
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
  marketingAuthorizationHolder?: Reference<"Organization">;
  doseForm?: CodeableConcept;
  totalVolume?: Quantity;
  ingredient?: MedicationIngredient[];
  batch?: MedicationBatch;
  definition?: Reference<"MedicationKnowledge">;
}
