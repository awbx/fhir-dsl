import type { Provenance } from "../resources/provenance.js";

/**
 * US Core Provenance Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-provenance
 */
export interface USCoreProvenance extends Provenance {
  target?: unknown;
  recorded?: unknown;
  agent?: unknown;
  agent?: unknown[];
  agent?: unknown;
}

