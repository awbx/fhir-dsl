import type { FhirCode, FhirDateTime } from "../primitives.js";
import type { Annotation, CodeableConcept, DomainResource, Identifier, Period, Reference, Timing } from "../datatypes.js";

export interface DeviceUseStatement extends DomainResource {
  resourceType: "DeviceUseStatement";
  identifier?: Identifier[];
  basedOn?: Reference<"ServiceRequest">[];
  status: FhirCode;
  subject: Reference<"Patient" | "Group">;
  derivedFrom?: Reference<"ServiceRequest" | "Procedure" | "Claim" | "Observation" | "QuestionnaireResponse" | "DocumentReference">[];
  timingTiming?: Timing;
  timingPeriod?: Period;
  timingDateTime?: FhirDateTime;
  recordedOn?: FhirDateTime;
  source?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson">;
  device: Reference<"Device">;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference" | "Media">[];
  bodySite?: CodeableConcept;
  note?: Annotation[];
}
