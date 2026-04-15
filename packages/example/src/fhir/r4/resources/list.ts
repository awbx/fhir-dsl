import type { FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, DomainResource, Identifier, Reference } from "../datatypes.js";

export interface ListEntry extends BackboneElement {
  flag?: CodeableConcept;
  deleted?: FhirBoolean;
  date?: FhirDateTime;
  item: Reference<"Resource">;
}

export interface List extends DomainResource {
  resourceType: "List";
  identifier?: Identifier[];
  status: FhirCode;
  mode: FhirCode;
  title?: FhirString;
  code?: CodeableConcept;
  subject?: Reference<"Patient" | "Group" | "Device" | "Location">;
  encounter?: Reference<"Encounter">;
  date?: FhirDateTime;
  source?: Reference<"Practitioner" | "PractitionerRole" | "Patient" | "Device">;
  orderedBy?: CodeableConcept;
  note?: Annotation[];
  entry?: ListEntry[];
  emptyReason?: CodeableConcept;
}
