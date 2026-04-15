import type { Reference } from "../datatypes.js";
import type { Coverage } from "../resources/coverage.js";

/**
 * US Core Coverage Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-coverage
 */
export interface USCoreCoverageProfile extends Coverage {
  beneficiary?: Reference<"us-core-patient">;
  payor?: Reference<"us-core-organization" | "us-core-patient" | "us-core-relatedperson">;
}

