import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  Period,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirCode, FhirDateTime } from "../primitives.js";

export interface InventoryReportInventoryListingItem extends BackboneElement {
  category?: CodeableConcept;
  quantity: Quantity;
  item: CodeableReference;
}

export interface InventoryReportInventoryListing extends BackboneElement {
  location?: Reference<"Location">;
  itemStatus?: CodeableConcept;
  countingDateTime?: FhirDateTime;
  item?: InventoryReportInventoryListingItem[];
}

export interface InventoryReport extends DomainResource {
  resourceType: "InventoryReport";
  identifier?: Identifier[];
  status: FhirCode;
  countType: FhirCode;
  operationType?: CodeableConcept;
  operationTypeReason?: CodeableConcept;
  reportedDateTime: FhirDateTime;
  reporter?: Reference<"Practitioner" | "Patient" | "RelatedPerson" | "Device">;
  reportingPeriod?: Period;
  inventoryListing?: InventoryReportInventoryListing[];
  note?: Annotation[];
}
