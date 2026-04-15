import type {
  Address,
  Annotation,
  BackboneElement,
  CodeableConcept,
  Coding,
  DomainResource,
  Duration,
  Identifier,
  Quantity,
  Range,
  Ratio,
  Reference,
} from "../datatypes.js";
import type {
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirDecimal,
  FhirInteger,
  FhirString,
  FhirUrl,
} from "../primitives.js";

export interface InventoryItemName extends BackboneElement {
  nameType: Coding;
  language: FhirCode;
  name: FhirString;
}

export interface InventoryItemResponsibleOrganization extends BackboneElement {
  role: CodeableConcept;
  organization: Reference<"Organization">;
}

export interface InventoryItemDescription extends BackboneElement {
  language?: FhirCode;
  description?: FhirString;
}

export interface InventoryItemAssociation extends BackboneElement {
  associationType: CodeableConcept;
  relatedItem: Reference<
    | "InventoryItem"
    | "Medication"
    | "MedicationKnowledge"
    | "Device"
    | "DeviceDefinition"
    | "NutritionProduct"
    | "BiologicallyDerivedProduct"
  >;
  quantity: Ratio;
}

export interface InventoryItemCharacteristic extends BackboneElement {
  characteristicType: CodeableConcept;
  valueString?: FhirString;
  valueInteger?: FhirInteger;
  valueDecimal?: FhirDecimal;
  valueBoolean?: FhirBoolean;
  valueUrl?: FhirUrl;
  valueDateTime?: FhirDateTime;
  valueQuantity?: Quantity;
  valueRange?: Range;
  valueRatio?: Ratio;
  valueAnnotation?: Annotation;
  valueAddress?: Address;
  valueDuration?: Duration;
  valueCodeableConcept?: CodeableConcept;
}

export interface InventoryItemInstance extends BackboneElement {
  identifier?: Identifier[];
  lotNumber?: FhirString;
  expiry?: FhirDateTime;
  subject?: Reference<"Patient" | "Organization">;
  location?: Reference<"Location">;
}

export interface InventoryItem extends DomainResource {
  resourceType: "InventoryItem";
  identifier?: Identifier[];
  status: FhirCode;
  category?: CodeableConcept[];
  code?: CodeableConcept[];
  name?: InventoryItemName[];
  responsibleOrganization?: InventoryItemResponsibleOrganization[];
  description?: InventoryItemDescription;
  inventoryStatus?: CodeableConcept[];
  baseUnit?: CodeableConcept;
  netContent?: Quantity;
  association?: InventoryItemAssociation[];
  characteristic?: InventoryItemCharacteristic[];
  instance?: InventoryItemInstance;
  productReference?: Reference<"Medication" | "Device" | "NutritionProduct" | "BiologicallyDerivedProduct">;
}
