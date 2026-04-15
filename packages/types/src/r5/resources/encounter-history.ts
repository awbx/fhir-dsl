import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface EncounterHistoryLocation extends BackboneElement {
  location: Reference<"Location">;
  form?: CodeableConcept;
}

export interface EncounterHistory extends DomainResource {
  resourceType: "EncounterHistory";
  encounter?: Reference<"Encounter">;
  identifier?: Identifier[];
  status: FhirCode;
  class: CodeableConcept;
  type?: CodeableConcept[];
  serviceType?: CodeableReference[];
  subject?: Reference<"Patient" | "Group">;
  subjectStatus?: CodeableConcept;
  actualPeriod?: Period;
  plannedStartDate?: FhirDateTime;
  plannedEndDate?: FhirDateTime;
  length?: Duration;
  location?: EncounterHistoryLocation[];
}
