import type { Attachment, CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";
import type { FhirBoolean, FhirString } from "../primitives.js";

export interface BodyStructure extends DomainResource {
  resourceType: "BodyStructure";
  identifier?: Identifier[];
  active?: FhirBoolean;
  morphology?: CodeableConcept;
  location?: CodeableConcept;
  locationQualifier?: CodeableConcept[];
  description?: FhirString;
  image?: Attachment[];
  patient: Reference<"Patient">;
}
