import type {
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
  basedOn?: Reference<"Resource">[];
  category?: CodeableConcept;
  priority?: FhirCode;
  deliverFor?: Reference<"Patient">;
  item: CodeableReference;
  quantity: Quantity;
  parameter?: SupplyRequestParameter[];
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  authoredOn?: FhirDateTime;
  requester?: Reference<
    "Practitioner" | "PractitionerRole" | "Organization" | "Patient" | "RelatedPerson" | "Device" | "CareTeam"
  >;
  supplier?: Reference<"Organization" | "HealthcareService">[];
  reason?: CodeableReference[];
  deliverFrom?: Reference<"Organization" | "Location">;
  deliverTo?: Reference<"Organization" | "Location" | "Patient" | "RelatedPerson">;
}
