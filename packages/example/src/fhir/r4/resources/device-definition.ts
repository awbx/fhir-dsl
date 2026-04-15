import type { FhirBoolean, FhirCode, FhirString, FhirUri } from "../primitives.js";
import type { Annotation, BackboneElement, CodeableConcept, ContactPoint, DomainResource, Identifier, ProdCharacteristic, ProductShelfLife, Quantity, Reference } from "../datatypes.js";

export interface DeviceDefinitionUdiDeviceIdentifier extends BackboneElement {
  deviceIdentifier: FhirString;
  issuer: FhirUri;
  jurisdiction: FhirUri;
}

export interface DeviceDefinitionDeviceName extends BackboneElement {
  name: FhirString;
  type: FhirCode;
}

export interface DeviceDefinitionSpecialization extends BackboneElement {
  systemType: FhirString;
  version?: FhirString;
}

export interface DeviceDefinitionCapability extends BackboneElement {
  type: CodeableConcept;
  description?: CodeableConcept[];
}

export interface DeviceDefinitionProperty extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity[];
  valueCode?: CodeableConcept[];
}

export interface DeviceDefinitionMaterial extends BackboneElement {
  substance: CodeableConcept;
  alternate?: FhirBoolean;
  allergenicIndicator?: FhirBoolean;
}

export interface DeviceDefinition extends DomainResource {
  resourceType: "DeviceDefinition";
  identifier?: Identifier[];
  udiDeviceIdentifier?: DeviceDefinitionUdiDeviceIdentifier[];
  manufacturerString?: FhirString;
  manufacturerReference?: Reference<"Organization">;
  deviceName?: DeviceDefinitionDeviceName[];
  modelNumber?: FhirString;
  type?: CodeableConcept;
  specialization?: DeviceDefinitionSpecialization[];
  version?: FhirString[];
  safety?: CodeableConcept[];
  shelfLifeStorage?: ProductShelfLife[];
  physicalCharacteristics?: ProdCharacteristic;
  languageCode?: CodeableConcept[];
  capability?: DeviceDefinitionCapability[];
  property?: DeviceDefinitionProperty[];
  owner?: Reference<"Organization">;
  contact?: ContactPoint[];
  url?: FhirUri;
  onlineInformation?: FhirUri;
  note?: Annotation[];
  quantity?: Quantity;
  parentDevice?: Reference<"DeviceDefinition">;
  material?: DeviceDefinitionMaterial[];
}
