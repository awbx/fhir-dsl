import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Duration,
  Identifier,
  Period,
  Reference,
  VirtualServiceDetail,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface EncounterParticipant extends BackboneElement {
  type?: CodeableConcept[];
  period?: Period;
  actor?: Reference<
    "Patient" | "Group" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Device" | "HealthcareService"
  >;
}

export interface EncounterReason extends BackboneElement {
  use?: CodeableConcept[];
  value?: CodeableReference[];
}

export interface EncounterDiagnosis extends BackboneElement {
  condition?: CodeableReference[];
  use?: CodeableConcept[];
}

export interface EncounterAdmission extends BackboneElement {
  preAdmissionIdentifier?: Identifier;
  origin?: Reference<"Location" | "Organization">;
  admitSource?: CodeableConcept;
  reAdmission?: CodeableConcept;
  destination?: Reference<"Location" | "Organization">;
  dischargeDisposition?: CodeableConcept;
}

export interface EncounterLocation extends BackboneElement {
  location: Reference<"Location">;
  status?: FhirCode;
  form?: CodeableConcept;
  period?: Period;
}

export interface Encounter extends DomainResource {
  resourceType: "Encounter";
  identifier?: Identifier[];
  status: FhirCode;
  class?: CodeableConcept[];
  priority?: CodeableConcept;
  type?: CodeableConcept[];
  serviceType?: CodeableReference[];
  subject?: Reference<"Patient" | "Group">;
  subjectStatus?: CodeableConcept;
  episodeOfCare?: Reference<"EpisodeOfCare">[];
  basedOn?: Reference<"CarePlan" | "DeviceRequest" | "MedicationRequest" | "ServiceRequest">[];
  careTeam?: Reference<"CareTeam">[];
  partOf?: Reference<"Encounter">;
  serviceProvider?: Reference<"Organization">;
  participant?: EncounterParticipant[];
  appointment?: Reference<"Appointment">[];
  virtualService?: VirtualServiceDetail[];
  actualPeriod?: Period;
  plannedStartDate?: FhirDateTime;
  plannedEndDate?: FhirDateTime;
  length?: Duration;
  reason?: EncounterReason[];
  diagnosis?: EncounterDiagnosis[];
  account?: Reference<"Account">[];
  dietPreference?: CodeableConcept[];
  specialArrangement?: CodeableConcept[];
  specialCourtesy?: CodeableConcept[];
  admission?: EncounterAdmission;
  location?: EncounterLocation[];
}
