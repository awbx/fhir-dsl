import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirString, FhirUnsignedInt } from "../primitives.js";

export interface GroupCharacteristic extends BackboneElement {
  code: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueBoolean?: FhirBoolean;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueReference?: Reference;
  exclude: FhirBoolean;
  period?: Period;
}

export interface GroupMember extends BackboneElement {
  entity: Reference<"Patient" | "Practitioner" | "PractitionerRole" | "Device" | "Medication" | "Substance" | "Group">;
  period?: Period;
  inactive?: FhirBoolean;
}

export interface Group extends DomainResource {
  resourceType: "Group";
  identifier?: Identifier[];
  active?: FhirBoolean;
  type: FhirCode;
  actual: FhirBoolean;
  code?: CodeableConcept;
  name?: FhirString;
  quantity?: FhirUnsignedInt;
  managingEntity?: Reference<"Organization" | "RelatedPerson" | "Practitioner" | "PractitionerRole">;
  characteristic?: GroupCharacteristic[];
  member?: GroupMember[];
}
