import type { Reference } from "../datatypes.js";
import type { DocumentReference } from "../resources/document-reference.js";

/**
 * US Core DocumentReference Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference
 */
export interface USCoreDocumentReferenceProfile extends DocumentReference {
  identifier?: unknown;
  status?: unknown;
  type: unknown;
  category: unknown;
  subject: Reference<"us-core-patient">;
  date?: unknown;
  author?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "us-core-practitionerrole" | "us-core-relatedperson" | "Device">;
  content?: unknown;
  context?: unknown;
}

