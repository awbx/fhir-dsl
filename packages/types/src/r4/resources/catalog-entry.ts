import type { FhirBoolean, FhirCode, FhirDateTime } from "../primitives.js";
import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Period, Reference } from "../datatypes.js";

export interface CatalogEntryRelatedEntry extends BackboneElement {
  relationtype: FhirCode;
  item: Reference<"CatalogEntry">;
}

export interface CatalogEntry extends DomainResource {
  resourceType: "CatalogEntry";
  identifier?: Identifier[];
  type?: CodeableConcept;
  orderable: FhirBoolean;
  referencedItem: Reference<"Medication" | "Device" | "Organization" | "Practitioner" | "PractitionerRole" | "HealthcareService" | "ActivityDefinition" | "PlanDefinition" | "SpecimenDefinition" | "ObservationDefinition" | "Binary">;
  additionalIdentifier?: Identifier[];
  classification?: CodeableConcept[];
  status?: FhirCode;
  validityPeriod?: Period;
  validTo?: FhirDateTime;
  lastUpdated?: FhirDateTime;
  additionalCharacteristic?: CodeableConcept[];
  additionalClassification?: CodeableConcept[];
  relatedEntry?: CatalogEntryRelatedEntry[];
}
