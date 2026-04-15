import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Narrative,
  Period,
  Reference,
  RelatedArtifact,
  UsageContext,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface CompositionAttester extends BackboneElement {
  mode: CodeableConcept;
  time?: FhirDateTime;
  party?: Reference<"Patient" | "RelatedPerson" | "Practitioner" | "PractitionerRole" | "Organization">;
}

export interface CompositionEvent extends BackboneElement {
  period?: Period;
  detail?: CodeableReference[];
}

export interface CompositionSection extends BackboneElement {
  title?: FhirString;
  code?: CodeableConcept;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Patient" | "RelatedPerson" | "Organization">[];
  focus?: Reference<"Resource">;
  text?: Narrative;
  orderedBy?: CodeableConcept;
  entry?: Reference<"Resource">[];
  emptyReason?: CodeableConcept;
  section?: CompositionSection[];
}

export interface Composition extends DomainResource {
  resourceType: "Composition";
  url?: FhirUri;
  identifier?: Identifier[];
  version?: FhirString;
  status: FhirCode;
  type: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  date: FhirDateTime;
  useContext?: UsageContext[];
  author: Reference<"Practitioner" | "PractitionerRole" | "Device" | "Patient" | "RelatedPerson" | "Organization">[];
  name?: FhirString;
  title: FhirString;
  note?: Annotation[];
  attester?: CompositionAttester[];
  custodian?: Reference<"Organization">;
  relatesTo?: RelatedArtifact[];
  event?: CompositionEvent[];
  section?: CompositionSection[];
}
