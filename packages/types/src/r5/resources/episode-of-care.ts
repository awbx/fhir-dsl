import type {
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode } from "../primitives.js";

export interface EpisodeOfCareStatusHistory extends BackboneElement {
  status: FhirCode;
  period: Period;
}

export interface EpisodeOfCareReason extends BackboneElement {
  use?: CodeableConcept;
  value?: CodeableReference[];
}

export interface EpisodeOfCareDiagnosis extends BackboneElement {
  condition?: CodeableReference[];
  use?: CodeableConcept;
}

export interface EpisodeOfCare extends DomainResource {
  resourceType: "EpisodeOfCare";
  identifier?: Identifier[];
  status: FhirCode;
  statusHistory?: EpisodeOfCareStatusHistory[];
  type?: CodeableConcept[];
  reason?: EpisodeOfCareReason[];
  diagnosis?: EpisodeOfCareDiagnosis[];
  patient: Reference<"Patient">;
  managingOrganization?: Reference<"Organization">;
  period?: Period;
  referralRequest?: Reference<"ServiceRequest">[];
  careManager?: Reference<"Practitioner" | "PractitionerRole">;
  careTeam?: Reference<"CareTeam">[];
  account?: Reference<"Account">[];
}
