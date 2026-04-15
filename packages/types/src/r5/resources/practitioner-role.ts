import type {
  Availability,
  CodeableConcept,
  DomainResource,
  ExtendedContactDetail,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean } from "../primitives.js";

export interface PractitionerRole extends DomainResource {
  resourceType: "PractitionerRole";
  identifier?: Identifier[];
  active?: FhirBoolean;
  period?: Period;
  practitioner?: Reference<"Practitioner">;
  organization?: Reference<"Organization">;
  code?: CodeableConcept[];
  specialty?: CodeableConcept[];
  location?: Reference<"Location">[];
  healthcareService?: Reference<"HealthcareService">[];
  contact?: ExtendedContactDetail[];
  characteristic?: CodeableConcept[];
  communication?: CodeableConcept[];
  availability?: Availability[];
  endpoint?: Reference<"Endpoint">[];
}
