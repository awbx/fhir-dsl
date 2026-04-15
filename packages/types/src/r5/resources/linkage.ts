import type { BackboneElement, DomainResource, Reference } from "../datatypes.js";
import type { FhirBoolean, FhirCode } from "../primitives.js";

export interface LinkageItem extends BackboneElement {
  type: FhirCode;
  resource: Reference<"Resource">;
}

export interface Linkage extends DomainResource {
  resourceType: "Linkage";
  active?: FhirBoolean;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  item: LinkageItem[];
}
