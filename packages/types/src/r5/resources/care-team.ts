import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  ContactPoint,
  DomainResource,
  Identifier,
  Period,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCode, FhirString } from "../primitives.js";

export interface CareTeamParticipant extends BackboneElement {
  role?: CodeableConcept;
  member?: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Organization" | "CareTeam">;
  onBehalfOf?: Reference<"Organization">;
  coveragePeriod?: Period;
  coverageTiming?: Timing;
}

export interface CareTeam extends DomainResource {
  resourceType: "CareTeam";
  identifier?: Identifier[];
  status?: FhirCode;
  category?: CodeableConcept[];
  name?: FhirString;
  subject?: Reference<"Patient" | "Group">;
  period?: Period;
  participant?: CareTeamParticipant[];
  reason?: CodeableReference[];
  managingOrganization?: Reference<"Organization">[];
  telecom?: ContactPoint[];
  note?: Annotation[];
}
