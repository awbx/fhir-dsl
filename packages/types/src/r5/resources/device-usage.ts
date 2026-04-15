import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface DeviceUsageAdherence extends BackboneElement {
  code: CodeableConcept;
  reason: CodeableConcept[];
}

export interface DeviceUsage extends DomainResource {
  resourceType: "DeviceUsage";
  identifier?: Identifier[];
  basedOn?: Reference<"ServiceRequest">[];
  status: FhirCode;
  category?: CodeableConcept[];
  patient: Reference<"Patient">;
  derivedFrom?: Reference<
    "ServiceRequest" | "Procedure" | "Claim" | "Observation" | "QuestionnaireResponse" | "DocumentReference"
  >[];
  context?: Reference<"Encounter" | "EpisodeOfCare">;
  timingTiming?: Timing;
  timingPeriod?: Period;
  timingDateTime?: FhirDateTime;
  dateAsserted?: FhirDateTime;
  usageStatus?: CodeableConcept;
  usageReason?: CodeableConcept[];
  adherence?: DeviceUsageAdherence;
  informationSource?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">;
  device: CodeableReference;
  reason?: CodeableReference[];
  bodySite?: CodeableReference;
  note?: Annotation[];
}
