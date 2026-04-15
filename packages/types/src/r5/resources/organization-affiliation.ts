import type {
  CodeableConcept,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean } from "../primitives.js";

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
  contact?: ExtendedContactDetail[];
  endpoint?: Reference<"Endpoint">[];
}
