import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Range,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirBoolean, FhirCanonical, FhirCode, FhirDateTime, FhirInteger, FhirUri } from "../primitives.js";

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
  replaces?: Reference<"DeviceRequest">[];
  groupIdentifier?: Identifier;
  status?: FhirCode;
  intent: FhirCode;
  priority?: FhirCode;
  doNotPerform?: FhirBoolean;
  code: CodeableReference;
  quantity?: FhirInteger;
  parameter?: DeviceRequestParameter[];
  subject: Reference<"Patient" | "Group" | "Location" | "Device">;
  encounter?: Reference<"Encounter">;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  authoredOn?: FhirDateTime;
  requester?: Reference<"Device" | "Practitioner" | "PractitionerRole" | "Organization">;
  performer?: CodeableReference;
  reason?: CodeableReference[];
  asNeeded?: FhirBoolean;
  asNeededFor?: CodeableConcept;
  insurance?: Reference<"Coverage" | "ClaimResponse">[];
  supportingInfo?: Reference<"Resource">[];
  note?: Annotation[];
  relevantHistory?: Reference<"Provenance">[];
}
