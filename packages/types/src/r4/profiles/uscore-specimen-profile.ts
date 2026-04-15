import type { Reference } from "../datatypes.js";
import type { Specimen } from "../resources/specimen.js";

/**
 * US Core Specimen Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-specimen
 */
export interface USCoreSpecimenProfile extends Specimen {
  subject?: Reference<"us-core-patient">;
}

