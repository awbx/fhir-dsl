import type { FhirCode, FhirDateTime, FhirPositiveInt, FhirString } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

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
  description?: FhirString;
  series?: FhirString;
  doseNumberPositiveInt?: FhirPositiveInt;
  doseNumberString?: FhirString;
  seriesDosesPositiveInt?: FhirPositiveInt;
  seriesDosesString?: FhirString;
}
