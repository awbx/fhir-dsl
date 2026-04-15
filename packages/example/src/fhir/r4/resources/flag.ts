import type { CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";
import type { FhirCode } from "../primitives.js";

export interface Flag extends DomainResource {
  resourceType: "Flag";
  identifier?: Identifier[];
  status: FhirCode;
  category?: CodeableConcept[];
  code: CodeableConcept;
  subject: Reference<
    "Patient" | "Location" | "Group" | "Organization" | "Practitioner" | "PlanDefinition" | "Medication" | "Procedure"
  >;
  period?: Period;
  encounter?: Reference<"Encounter">;
  author?: Reference<"Device" | "Organization" | "Patient" | "Practitioner" | "PractitionerRole">;
}
