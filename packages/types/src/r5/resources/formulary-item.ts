import type { CodeableConcept, DomainResource, Identifier } from "../datatypes.js";
import type { FhirCode } from "../primitives.js";

export interface FormularyItem extends DomainResource {
  resourceType: "FormularyItem";
  identifier?: Identifier[];
  code?: CodeableConcept;
  status?: FhirCode;
}
