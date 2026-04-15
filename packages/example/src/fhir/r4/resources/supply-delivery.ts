import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Reference,
  Timing,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface SupplyDeliverySuppliedItem extends BackboneElement {
  quantity?: Quantity;
  itemCodeableConcept?: CodeableConcept;
  itemReference?: Reference<"Medication" | "Substance" | "Device">;
}

export interface SupplyDelivery extends DomainResource {
  resourceType: "SupplyDelivery";
  identifier?: Identifier[];
  basedOn?: Reference<"SupplyRequest">[];
  partOf?: Reference<"SupplyDelivery" | "Contract">[];
  status?: FhirCode;
  patient?: Reference<"Patient">;
  type?: CodeableConcept;
  suppliedItem?: SupplyDeliverySuppliedItem;
  occurrenceDateTime?: FhirDateTime;
  occurrencePeriod?: Period;
  occurrenceTiming?: Timing;
  supplier?: Reference<"Practitioner" | "PractitionerRole" | "Organization">;
  destination?: Reference<"Location">;
  receiver?: Reference<"Practitioner" | "PractitionerRole">[];
}
