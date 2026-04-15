import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type { FhirCode, FhirPositiveInt } from "../primitives.js";

export interface EpisodeOfCareStatusHistory extends BackboneElement {
  status: FhirCode;
  period: Period;
}

export interface EpisodeOfCareDiagnosis extends BackboneElement {
  condition: Reference<"Condition">;
  role?: CodeableConcept;
  rank?: FhirPositiveInt;
}

export interface EpisodeOfCare extends DomainResource {
  resourceType: "EpisodeOfCare";
  identifier?: Identifier[];
  status: FhirCode;
  statusHistory?: EpisodeOfCareStatusHistory[];
  type?: CodeableConcept[];
  diagnosis?: EpisodeOfCareDiagnosis[];
  patient: Reference<"Patient">;
  managingOrganization?: Reference<"Organization">;
  period?: Period;
  referralRequest?: Reference<"ServiceRequest">[];
  careManager?: Reference<"Practitioner" | "PractitionerRole">;
  team?: Reference<"CareTeam">[];
  account?: Reference<"Account">[];
}
