import type { Reference } from "../datatypes.js";
import type { CareTeam } from "../resources/care-team.js";

/**
 * US Core CareTeam Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-careteam
 */
export interface USCoreCareTeam extends CareTeam {
  subject: Reference<"us-core-patient">;
}

