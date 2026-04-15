import type { FhirBoolean } from "../primitives.js";
import type { CodeableConcept, ContactPoint, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface OrganizationAffiliation extends DomainResource {
  resourceType: "OrganizationAffiliation";
  identifier?: Identifier[];
  active?: FhirBoolean;
  period?: Period;
  organization?: Reference<"Organization">;
  participatingOrganization?: Reference<"Organization">;
  network?: Reference<"Organization">[];
  code?: CodeableConcept[];
  specialty?: CodeableConcept[];
  location?: Reference<"Location">[];
  healthcareService?: Reference<"HealthcareService">[];
  telecom?: ContactPoint[];
  endpoint?: Reference<"Endpoint">[];
}
