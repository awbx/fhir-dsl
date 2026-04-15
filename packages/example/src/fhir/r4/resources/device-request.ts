import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirUri } from "../primitives.js";

export interface DeviceRequestParameter extends BackboneElement {
  code?: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueBoolean?: FhirBoolean;
}

export interface DeviceRequest extends DomainResource {
  resourceType: "DeviceRequest";
  identifier?: Identifier[];
  instantiatesCanonical?: FhirCanonical[];
  instantiatesUri?: FhirUri[];
  basedOn?: Reference<"Resource">[];
  priorRequest?: Reference<"Resource">[];
  groupIdentifier?: Identifier;
  status?: FhirCode;
  intent: FhirCode;
  priority?: FhirCode;
  codeReference?: Reference<"Device">;
  codeCodeableConcept?: CodeableConcept;
  parameter?: DeviceRequestParameter[];
  subject: Reference<"Patient" | "Group" | "Location" | "Device">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  authoredOn?: FhirDateTime;
  requester?: Reference<"Device" | "Practitioner" | "PractitionerRole" | "Organization">;
  performerType?: CodeableConcept;
  performer?: Reference<
    | "Practitioner"
    | "PractitionerRole"
    | "Organization"
    | "CareTeam"
    | "HealthcareService"
    | "Patient"
    | "Device"
    | "RelatedPerson"
  >;
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  supportingInfo?: Reference<"Resource">[];
  note?: Annotation[];
  relevantHistory?: Reference<"Provenance">[];
}
