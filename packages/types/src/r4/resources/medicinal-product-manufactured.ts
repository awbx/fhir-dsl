import type { CodeableConcept, DomainResource, ProdCharacteristic, Quantity, Reference } from "../datatypes.js";

export interface MedicinalProductManufactured extends DomainResource {
  resourceType: "MedicinalProductManufactured";
  manufacturedDoseForm: CodeableConcept;
  unitOfPresentation?: CodeableConcept;
  quantity: Quantity;
  manufacturer?: Reference<"Organization">[];
  ingredient?: Reference<"MedicinalProductIngredient">[];
  physicalCharacteristics?: ProdCharacteristic;
  otherCharacteristics?: CodeableConcept[];
}
