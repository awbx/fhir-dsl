import type { BackboneElement, CodeableConcept, DomainResource, Period, Reference, Signature } from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirInstant, FhirUri } from "../primitives.js";

export interface ProvenanceAgent extends BackboneElement {
  type?: CodeableConcept;
  role?: CodeableConcept[];
  who: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Device" | "Organization">;
  onBehalfOf?: Reference<"Practitioner" | "PractitionerRole" | "RelatedPerson" | "Patient" | "Device" | "Organization">;
}

export interface ProvenanceEntity extends BackboneElement {
  role: FhirCode;
  what: Reference<"Resource">;
  agent?: ProvenanceAgent[];
}

export interface Provenance extends DomainResource {
  resourceType: "Provenance";
  target: Reference<"Resource">[];
  occurredPeriod?: Period;
  occurredDateTime?: FhirDateTime;
  recorded: FhirInstant;
  policy?: FhirUri[];
  location?: Reference<"Location">;
  reason?: CodeableConcept[];
  activity?: CodeableConcept;
  agent: ProvenanceAgent[];
  entity?: ProvenanceEntity[];
  signature?: Signature[];
}
