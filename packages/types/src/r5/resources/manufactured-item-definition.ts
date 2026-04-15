import type {
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  DomainResource,
  Identifier,
  MarketingStatus,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBoolean, FhirCode, FhirDate, FhirMarkdown, FhirString } from "../primitives.js";

export interface ManufacturedItemDefinitionProperty extends BackboneElement {
  type: CodeableConcept;
  valueCodeableConcept?: CodeableConcept;
  valueQuantity?: Quantity;
  valueDate?: FhirDate;
  valueBoolean?: FhirBoolean;
  valueMarkdown?: FhirMarkdown;
  valueAttachment?: Attachment;
  valueReference?: Reference<"Binary">;
}

export interface ManufacturedItemDefinitionComponentConstituent extends BackboneElement {
  amount?: Quantity[];
  location?: CodeableConcept[];
  function?: CodeableConcept[];
  hasIngredient?: CodeableReference[];
}

export interface ManufacturedItemDefinitionComponent extends BackboneElement {
  type: CodeableConcept;
  function?: CodeableConcept[];
  amount?: Quantity[];
  constituent?: ManufacturedItemDefinitionComponentConstituent[];
  property?: ManufacturedItemDefinitionProperty[];
  component?: ManufacturedItemDefinitionComponent[];
}

export interface ManufacturedItemDefinition extends DomainResource {
  resourceType: "ManufacturedItemDefinition";
  identifier?: Identifier[];
  status: FhirCode;
  name?: FhirString;
  manufacturedDoseForm: CodeableConcept;
  unitOfPresentation?: CodeableConcept;
  manufacturer?: Reference<"Organization">[];
  marketingStatus?: MarketingStatus[];
  ingredient?: CodeableConcept[];
  property?: ManufacturedItemDefinitionProperty[];
  component?: ManufacturedItemDefinitionComponent[];
}
