import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface CommunicationPayload extends BackboneElement {
  contentAttachment?: Attachment;
  contentReference?: Reference<"Resource">;
  contentCodeableConcept?: CodeableConcept;
}

export interface Communication extends DomainResource {
  resourceType: "Communication";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"Resource">[];
  partOf?: Reference<"Resource">[];
  inResponseTo?: Reference<"Communication">[];
  status: FhirCode;
  statusReason?: CodeableConcept;
  category?: CodeableConcept[];
  priority?: FhirCode;
  medium?: CodeableConcept[];
  subject?: Reference<"Patient" | "Group">;
  topic?: CodeableConcept;
  about?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  sent?: FhirDateTime;
  received?: FhirDateTime;
  recipient?: Reference<
    | "CareTeam"
    | "Device"
    | "Group"
    | "HealthcareService"
    | "Location"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
    | "Endpoint"
  >[];
  sender?: Reference<
    | "Device"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
    | "HealthcareService"
    | "Endpoint"
    | "CareTeam"
  >;
  reason?: CodeableReference[];
  payload?: CommunicationPayload[];
  note?: Annotation[];
}
