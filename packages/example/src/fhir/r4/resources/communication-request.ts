import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDateTime, FhirString } from "../primitives.js";

export interface CommunicationRequestPayload extends BackboneElement {
  contentString?: FhirString;
  contentAttachment?: Attachment;
  contentReference?: Reference<"Resource">;
}

export interface CommunicationRequest extends DomainResource {
  resourceType: "CommunicationRequest";
  identifier?: Identifier[];
  basedOn?: Reference<"Resource">[];
  replaces?: Reference<"CommunicationRequest">[];
  groupIdentifier?: Identifier;
  status: FhirCode;
  statusReason?: CodeableConcept;
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
  >[];
  sender?: Reference<
    "Device" | "Organization" | "Patient" | "Practitioner" | "PractitionerRole" | "RelatedPerson" | "HealthcareService"
  >;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  note?: Annotation[];
}
