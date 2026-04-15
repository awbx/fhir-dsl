import type {
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
import type { FhirBoolean, FhirCode, FhirDateTime } from "../primitives.js";

export interface SupplyRequestParameter extends BackboneElement {
  code?: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueBoolean?: FhirBoolean;
}

export interface SupplyRequest extends DomainResource {
  resourceType: "SupplyRequest";
  identifier?: Identifier[];
  status?: FhirCode;
  category?: CodeableConcept;
  priority?: FhirCode;
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference<"Medication" | "Substance" | "Device">;
  quantity: Quantity;
  parameter?: SupplyRequestParameter[];
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  authoredOn?: FhirDateTime;
  requester?: Reference<"Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device">;
  supplier?: Reference<"Organization" | "HealthcareService">[];
  reasonCode?: CodeableConcept[];
  reasonReference?: Reference<"Condition" | "Observation" | "DiagnosticReport" | "DocumentReference">[];
  deliverFrom?: Reference<"Organization" | "Location">;
  deliverTo?: Reference<"Organization" | "Location" | "Patient">;
}
