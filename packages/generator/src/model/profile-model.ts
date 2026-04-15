import type { PropertyModel } from "./resource-model.js";

export interface ProfileModel {
  /** Profile name (e.g., "USCorePatientProfile") */
  name: string;
  /** Profile URL from the StructureDefinition */
  url: string;
  /** Base resource type (e.g., "Patient") */
  baseResourceType: string;
  /** Profile slug for registry key (e.g., "us-core-patient") */
  slug: string;
  /** IG package name (e.g., "hl7.fhir.us.core") */
  igName: string;
  /** Properties that are constrained (narrowed) relative to the base */
  constrainedProperties: PropertyModel[];
  /** Description from the StructureDefinition */
  description?: string;
}
