import type {
  BackboneElement,
  CodeableConcept,
  DomainResource,
  Identifier,
  MarketingStatus,
  ProdCharacteristic,
  ProductShelfLife,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirString } from "../primitives.js";

export interface MedicinalProductPackagedBatchIdentifier extends BackboneElement {
  outerPackaging: Identifier;
  immediatePackaging?: Identifier;
}

export interface MedicinalProductPackagedPackageItem extends BackboneElement {
  identifier?: Identifier[];
  type: CodeableConcept;
  quantity: Quantity;
  material?: CodeableConcept[];
  alternateMaterial?: CodeableConcept[];
  device?: Reference<"DeviceDefinition">[];
  manufacturedItem?: Reference<"MedicinalProductManufactured">[];
  packageItem?: MedicinalProductPackagedPackageItem[];
  physicalCharacteristics?: ProdCharacteristic;
  otherCharacteristics?: CodeableConcept[];
  shelfLifeStorage?: ProductShelfLife[];
  manufacturer?: Reference<"Organization">[];
}

export interface MedicinalProductPackaged extends DomainResource {
  resourceType: "MedicinalProductPackaged";
  identifier?: Identifier[];
  subject?: Reference<"MedicinalProduct">[];
  description?: FhirString;
  legalStatusOfSupply?: CodeableConcept;
  marketingStatus?: MarketingStatus[];
  marketingAuthorization?: Reference<"MedicinalProductAuthorization">;
  manufacturer?: Reference<"Organization">[];
  batchIdentifier?: MedicinalProductPackagedBatchIdentifier[];
  packageItem: MedicinalProductPackagedPackageItem[];
}
