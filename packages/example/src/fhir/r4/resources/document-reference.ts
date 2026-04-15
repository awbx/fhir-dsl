import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirInstant, FhirString } from "../primitives.js";

export interface DocumentReferenceRelatesTo extends BackboneElement {
  code: FhirCode;
  target: Reference<"DocumentReference">;
}

export interface DocumentReferenceContent extends BackboneElement {
  attachment: Attachment;
  format?: Coding;
}

export interface DocumentReferenceContext extends BackboneElement {
  encounter?: Reference<"Encounter" | "EpisodeOfCare">[];
  event?: CodeableConcept[];
  period?: Period;
  facilityType?: CodeableConcept;
  practiceSetting?: CodeableConcept;
  sourcePatientInfo?: Reference<"Patient">;
  related?: Reference<"Resource">[];
}

export interface DocumentReference extends DomainResource {
  resourceType: "DocumentReference";
  masterIdentifier?: Identifier;
  identifier?: Identifier[];
  status: FhirCode;
  docStatus?: FhirCode;
  type?: CodeableConcept;
  category?: CodeableConcept[];
  subject?: Reference<"Patient" | "Practitioner" | "Group" | "Device">;
  date?: FhirInstant;
  author?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Device" | "Patient" | "RelatedPerson">[];
  authenticator?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  custodian?: Reference<"Organization">;
  relatesTo?: DocumentReferenceRelatesTo[];
  description?: FhirString;
  securityLabel?: CodeableConcept[];
  content: DocumentReferenceContent[];
  context?: DocumentReferenceContext;
}
