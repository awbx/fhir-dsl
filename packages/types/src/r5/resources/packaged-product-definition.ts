import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  MarketingStatus,
  ProductShelfLife,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirDate, FhirDateTime, FhirInteger, FhirMarkdown, FhirString } from "../primitives.js";

export interface PackagedProductDefinitionLegalStatusOfSupply extends BackboneElement {
  code?: CodeableConcept;
  jurisdiction?: CodeableConcept;
}

export interface PackagedProductDefinitionPackagingProperty extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueDate?: FhirDate;
  valueBoolean?: FhirBoolean;
  valueAttachment?: Attachment;
}

export interface PackagedProductDefinitionPackagingContainedItem extends BackboneElement {
  item: CodeableReference;
  amount?: Quantity;
}

export interface PackagedProductDefinitionPackaging extends BackboneElement {
  identifier?: Identifier[];
  type?: CodeableConcept;
  componentPart?: FhirBoolean;
  quantity?: FhirInteger;
  material?: CodeableConcept[];
  alternateMaterial?: CodeableConcept[];
  shelfLifeStorage?: ProductShelfLife[];
  manufacturer?: Reference<"Organization">[];
  property?: PackagedProductDefinitionPackagingProperty[];
  containedItem?: PackagedProductDefinitionPackagingContainedItem[];
  packaging?: PackagedProductDefinitionPackaging[];
}

export interface PackagedProductDefinition extends DomainResource {
  resourceType: "PackagedProductDefinition";
  identifier?: Identifier[];
  name?: FhirString;
  type?: CodeableConcept;
  packageFor?: Reference<"MedicinalProductDefinition">[];
  status?: CodeableConcept;
  statusDate?: FhirDateTime;
  containedItemQuantity?: Quantity[];
  description?: FhirMarkdown;
  legalStatusOfSupply?: PackagedProductDefinitionLegalStatusOfSupply[];
  marketingStatus?: MarketingStatus[];
  copackagedIndicator?: FhirBoolean;
  manufacturer?: Reference<"Organization">[];
  attachedDocument?: Reference<"DocumentReference">[];
  packaging?: PackagedProductDefinitionPackaging;
  characteristic?: PackagedProductDefinitionPackagingProperty[];
}
