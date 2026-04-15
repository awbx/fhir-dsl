import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Reference,
} from "../datatypes.js";
import type { FhirCanonical, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface CommunicationPayload extends BackboneElement {
  contentString?: FhirString;
  contentAttachment?: Attachment;
  contentReference?: Reference<"Resource">;
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
  payload?: CommunicationPayload[];
  note?: Annotation[];
}
