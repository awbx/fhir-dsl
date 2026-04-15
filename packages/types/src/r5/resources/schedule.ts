import type {
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirMarkdown, FhirString } from "../primitives.js";

export interface Schedule extends DomainResource {
  resourceType: "Schedule";
  identifier?: Identifier[];
  active?: FhirBoolean;
  serviceCategory?: CodeableConcept[];
  serviceType?: CodeableReference[];
  specialty?: CodeableConcept[];
  name?: FhirString;
  actor: Reference<
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "CareTeam"
    | "RelatedPerson"
    | "Device"
    | "HealthcareService"
    | "Location"
  >[];
  planningHorizon?: Period;
  comment?: FhirMarkdown;
}
