import type { BackboneElement, CodeableConcept, DomainResource } from "../datatypes.js";
import type { FhirCode, FhirString } from "../primitives.js";

export interface OperationOutcomeIssue extends BackboneElement {
  severity: FhirCode;
  code: FhirCode;
  details?: CodeableConcept;
  diagnostics?: FhirString;
  location?: FhirString[];
  expression?: FhirString[];
}

export interface OperationOutcome extends DomainResource {
  resourceType: "OperationOutcome";
  issue: OperationOutcomeIssue[];
}
