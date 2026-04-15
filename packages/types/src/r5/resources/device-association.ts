import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface DeviceAssociationOperation extends BackboneElement {
  status: CodeableConcept;
  operator?: Reference<"Patient" | "Practitioner" | "RelatedPerson">[];
  period?: Period;
}

export interface DeviceAssociation extends DomainResource {
  resourceType: "DeviceAssociation";
  identifier?: Identifier[];
  device: Reference<"Device">;
  category?: CodeableConcept[];
  status: CodeableConcept;
  statusReason?: CodeableConcept[];
  subject?: Reference<"Patient" | "Group" | "Practitioner" | "RelatedPerson" | "Device">;
  bodyStructure?: Reference<"BodyStructure">;
  period?: Period;
  operation?: DeviceAssociationOperation[];
}
