import type { CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirDateTime } from "../primitives.js";

export interface Basic extends DomainResource {
  resourceType: "Basic";
  identifier?: Identifier[];
  code: CodeableConcept;
  subject?: Reference<"Resource">;
  created?: FhirDateTime;
  author?: Reference<
    "Practitioner" | "PractitionerRole" | "Patient" | "RelatedPerson" | "Organization" | "Device" | "CareTeam"
  >;
}
