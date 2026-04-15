import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Narrative,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface CompositionAttester extends BackboneElement {
  mode: FhirCode;
  time?: FhirDateTime;
  party?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Organization">;
}

export interface CompositionRelatesTo extends BackboneElement {
  code: FhirCode;
  targetIdentifier?: Identifier;
  targetReference?: Reference<"Composition">;
}

export interface CompositionEvent extends BackboneElement {
  code?: CodeableConcept[];
  period?: Period;
  detail?: Reference<"Resource">[];
}

export interface CompositionSection extends BackboneElement {
  title?: FhirString;
  code?: CodeableConcept;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Patient" | "RelatedPerson" | "Organization">[];
  focus?: Reference<"Resource">;
  text?: Narrative;
  mode?: FhirCode;
  orderedBy?: CodeableConcept;
  entry?: Reference<"Resource">[];
  emptyReason?: CodeableConcept;
  section?: CompositionSection[];
}

export interface Composition extends DomainResource {
  resourceType: "Composition";
  identifier?: Identifier;
  status: FhirCode;
  type: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference<"Resource">;
  encounter?: Reference<"Encounter">;
  date: FhirDateTime;
  author: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Patient" | "RelatedPerson" | "Organization">[];
  title: FhirString;
  confidentiality?: FhirCode;
  attester?: CompositionAttester[];
  custodian?: Reference<"Organization">;
  relatesTo?: CompositionRelatesTo[];
  event?: CompositionEvent[];
  section?: CompositionSection[];
}
