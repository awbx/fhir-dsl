import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime, FhirMarkdown } from "../primitives.js";

export interface DeviceDispensePerformer extends BackboneElement {
  function?: CodeableConcept;
  actor: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "Device" | "RelatedPerson" | "CareTeam"
  >;
}

export interface DeviceDispense extends DomainResource {
  resourceType: "DeviceDispense";
  identifier?: Identifier[];
  basedOn?: Reference<"CarePlan" | "DeviceRequest">[];
  partOf?: Reference<"Procedure">[];
  status: FhirCode;
  statusReason?: CodeableReference;
  category?: CodeableConcept[];
  device: CodeableReference;
  subject: Reference<"Patient" | "Practitioner">;
  receiver?: Reference<"Patient" | "Practitioner" | "RelatedPerson" | "Location" | "PractitionerRole">;
  encounter?: Reference<"Encounter">;
  supportingInformation?: Reference<"Resource">[];
  performer?: DeviceDispensePerformer[];
  location?: Reference<"Location">;
  type?: CodeableConcept;
  quantity?: Quantity;
  preparedDate?: FhirDateTime;
  whenHandedOver?: FhirDateTime;
  destination?: Reference<"Location">;
  note?: Annotation[];
  usageInstruction?: FhirMarkdown;
  eventHistory?: Reference<"Provenance">[];
}
