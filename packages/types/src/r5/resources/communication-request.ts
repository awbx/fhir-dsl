import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime } from "../primitives.js";

export interface CommunicationRequestPayload extends BackboneElement {
  contentAttachment?: Attachment;
  contentReference?: Reference<"Resource">;
  contentCodeableConcept?: CodeableConcept;
}

export interface CommunicationRequest extends DomainResource {
  resourceType: "CommunicationRequest";
  identifier?: Identifier[];
  basedOn?: Reference<"Resource">[];
  replaces?: Reference<"CommunicationRequest">[];
  groupIdentifier?: Identifier;
  status: FhirCode;
  statusReason?: CodeableConcept;
  intent: FhirCode;
  category?: CodeableConcept[];
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  medium?: CodeableConcept[];
  subject?: Reference<"Patient" | "Group">;
  about?: Reference<"Resource">[];
  encounter?: Reference<"Encounter">;
  payload?: CommunicationRequestPayload[];
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  authoredOn?: FhirDateTime;
  requester?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  recipient?: Reference<
    | "Device"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
    | "Group"
    | "CareTeam"
    | "HealthcareService"
    | "Endpoint"
  >[];
  informationProvider?: Reference<
    | "Device"
    | "Organization"
    | "Patient"
    | "Practitioner"
    | "PractitionerRole"
    | "RelatedPerson"
    | "HealthcareService"
    | "Endpoint"
  >[];
  reason?: CodeableReference[];
  note?: Annotation[];
}
