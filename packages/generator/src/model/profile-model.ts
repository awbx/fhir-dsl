import type { PropertyModel, TypeRef } from "./resource-model.js";

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
  /** Slices defined on array-valued properties (e.g., extension:race) */
  slices: SliceModel[];
  /** Description from the StructureDefinition */
  description?: string | undefined;
}

export type DiscriminatorType = "value" | "pattern" | "type" | "profile" | "exists";

export interface DiscriminatorRule {
  type: DiscriminatorType;
  /** FHIRPath expression relative to the slice element root (e.g. "url"). */
  path: string;
}

export interface SliceModel {
  /** Property name on the parent (e.g. "extension", "component"). */
  basePropName: string;
  /** Slice identifier from `sliceName` or the suffix after `:`. */
  sliceName: string;
  /**
   * Sanitised camelCase suffix used in emitted field names
   * (e.g. `extension_usCoreRace`).
   */
  sanitizedName: string;
  /** Cardinality `min` from the slice's element (default 0). */
  min: number;
  /** Cardinality `max` from the slice's element (`*` or numeric, default "1"). */
  max: string;
  /**
   * `type[*]` of the slice element. For extension slices this is a single
   * `Extension` typeRef whose `targetProfiles` carry the extension URL.
   */
  types: TypeRef[];
  /**
   * Discriminator rules copied from the slicing parent — used by runtime
   * helpers (and a future typed `slice()` accessor) to identify which
   * array element a slice refers to.
   */
  discriminator: DiscriminatorRule[];
  /**
   * For extension slices using a single profile URL, the URL itself —
   * cached so emitters don't have to re-derive it from the typeRef.
   */
  extensionUrl?: string | undefined;
  description?: string | undefined;
}
