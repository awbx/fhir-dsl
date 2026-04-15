import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirMarkdown, FhirString } from "../primitives.js";

export interface ImmunizationEvaluation extends DomainResource {
  resourceType: "ImmunizationEvaluation";
  identifier?: Identifier[];
  status: FhirCode;
  patient: Reference<"Patient">;
  date?: FhirDateTime;
  authority?: Reference<"Organization">;
  targetDisease: CodeableConcept;
  immunizationEvent: Reference<"Immunization">;
  doseStatus: CodeableConcept;
  doseStatusReason?: CodeableConcept[];
  description?: FhirMarkdown;
  series?: FhirString;
  doseNumber?: FhirString;
  seriesDoses?: FhirString;
}
