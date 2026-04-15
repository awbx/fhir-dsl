import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface DocumentManifestRelated extends BackboneElement {
  identifier?: Identifier;
  ref?: Reference<"Resource">;
}

export interface DocumentManifest extends DomainResource {
  resourceType: "DocumentManifest";
  masterIdentifier?: Identifier;
  identifier?: Identifier[];
  status: FhirCode;
  type?: CodeableConcept;
  subject?: Reference<"Patient" | "Practitioner" | "Group" | "Device">;
  created?: FhirDateTime;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Device" | "Patient" | "RelatedPerson">[];
  recipient?: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "Organization">[];
  source?: FhirUri;
  description?: FhirString;
  content: Reference<"Resource">[];
  related?: DocumentManifestRelated[];
}
