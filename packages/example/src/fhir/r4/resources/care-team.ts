import type { FhirCode, FhirString } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, ContactPoint, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface CareTeamParticipant extends BackboneElement {
  role?: CodeableConcept[];
  member?: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Organization" | "CareTeam">;
  onBehalfOf?: Reference<"Organization">;
  period?: Period;
}

export interface CareTeam extends DomainResource {
  resourceType: "CareTeam";
  identifier?: Identifier[];
  status?: FhirCode;
  category?: CodeableConcept[];
  name?: FhirString;
  subject?: Reference<"Patient" | "Group">;
  encounter?: Reference<"Encounter">;
  period?: Period;
  participant?: CareTeamParticipant[];
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition">[];
  managingOrganization?: Reference<"Organization">[];
  telecom?: ContactPoint[];
  note?: Annotation[];
}
