import type { FhirCode, FhirPositiveInt } from "../primitives.js";
import type { BackboneElement, CodeableConcept, Coding, DomainResource, Duration, Identifier, Period, Reference } from "../datatypes.js";

export interface EncounterStatusHistory extends BackboneElement {
  status: FhirCode;
  period: Period;
}

export interface EncounterClassHistory extends BackboneElement {
  class: Coding;
  period: Period;
}

export interface EncounterParticipant extends BackboneElement {
  type?: CodeableConcept[];
  period?: Period;
  individual?: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson">;
}

export interface EncounterDiagnosis extends BackboneElement {
  condition: Reference<"Condition" | "Procedure">;
  use?: CodeableConcept;
  rank?: FhirPositiveInt;
}

export interface EncounterHospitalization extends BackboneElement {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference<"Location" | "Organization">;
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  dietPreference?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  destination?: Reference<"Location" | "Organization">;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation extends BackboneElement {
  location: Reference<"Location">;
  status?: FhirCode;
  physicalType?: CodeableConcept;
  period?: Period;
}

export interface Encounter extends DomainResource {
  resourceType: "Encounter";
  identifier?: Identifier[];
  status: FhirCode;
  statusHistory?: EncounterStatusHistory[];
  class: Coding;
  classHistory?: EncounterClassHistory[];
  type?: CodeableConcept[];
  serviceType?: CodeableConcept;
  priority?: CodeableConcept;
  subject?: Reference<"Patient" | "Group">;
  episodeOfCare?: Reference<"EpisodeOfCare">[];
  basedOn?: Reference<"ServiceRequest">[];
  participant?: EncounterParticipant[];
  appointment?: Reference<"Appointment">[];
  period?: Period;
  length?: Duration;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Procedure" | "Observation" | "ImmunizationRecommendation">[];
  diagnosis?: EncounterDiagnosis[];
  account?: Reference<"Account">[];
  hospitalization?: EncounterHospitalization;
  location?: EncounterLocation[];
  serviceProvider?: Reference<"Organization">;
  partOf?: Reference<"Encounter">;
}
