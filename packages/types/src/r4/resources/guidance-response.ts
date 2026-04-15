import type { FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";
import type { Annotation, CodeableConcept, DataRequirement, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface GuidanceResponse extends DomainResource {
  resourceType: "GuidanceResponse";
  requestIdentifier?: Identifier;
  identifier?: Identifier[];
  moduleUri?: FhirUri;
  moduleCanonical?: FhirCanonical;
  moduleCodeableConcept?: CodeableConcept;
  status: FhirCode;
  subject?: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  performer?: Reference<"Device">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  note?: Annotation[];
  evaluationMessage?: Reference<"OperationOutcome">[];
  outputParameters?: Reference<"Parameters">;
  result?: Reference<"CarePlan" | "RequestGroup">;
  dataRequirement?: DataRequirement[];
}
