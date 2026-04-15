import type { FhirCode, FhirString } from "../primitives.js";
import type { DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface ResearchSubject extends DomainResource {
  resourceType: "ResearchSubject";
  identifier?: Identifier[];
  status: FhirCode;
  period?: Period;
  study: Reference<"ResearchStudy">;
  individual: Reference<"Patient">;
  assignedArm?: FhirString;
  actualArm?: FhirString;
  consent?: Reference<"Consent">;
}
