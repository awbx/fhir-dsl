import type { FhirDate } from "../primitives.js";
import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface Basic extends DomainResource {
  resourceType: "Basic";
  identifier?: Identifier[];
  code: CodeableConcept;
  subject?: Reference<"Resource">;
  created?: FhirDate;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Organization">;
}
