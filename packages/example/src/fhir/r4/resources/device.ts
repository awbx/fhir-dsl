import type {
  Annotation,
  BackboneElement,
  CodeableConcept,
  ContactPoint,
  DomainResource,
  Identifier,
  Quantity,
  Reference,
} from "../datatypes.js";
import type { FhirBase64Binary, FhirCode, FhirDateTime, FhirString, FhirUri } from "../primitives.js";

export interface DeviceUdiCarrier extends BackboneElement {
  deviceIdentifier?: FhirString;
  issuer?: FhirUri;
  jurisdiction?: FhirUri;
  carrierAIDC?: FhirBase64Binary;
  carrierHRF?: FhirString;
  entryType?: FhirCode;
}

export interface DeviceDeviceName extends BackboneElement {
  name: FhirString;
  type: FhirCode;
}

export interface DeviceSpecialization extends BackboneElement {
  systemType: CodeableConcept;
  version?: FhirString;
}

export interface DeviceVersion extends BackboneElement {
  type?: CodeableConcept;
  component?: Identifier;
  value: FhirString;
}

export interface DeviceProperty extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity[];
  valueCode?: CodeableConcept[];
}

export interface Device extends DomainResource {
  resourceType: "Device";
  identifier?: Identifier[];
  definition?: Reference<"DeviceDefinition">;
  udiCarrier?: DeviceUdiCarrier[];
  status?: FhirCode;
  statusReason?: CodeableConcept[];
  distinctIdentifier?: FhirString;
  manufacturer?: FhirString;
  manufactureDate?: FhirDateTime;
  expirationDate?: FhirDateTime;
  lotNumber?: FhirString;
  serialNumber?: FhirString;
  deviceName?: DeviceDeviceName[];
  modelNumber?: FhirString;
  partNumber?: FhirString;
  type?: CodeableConcept;
  specialization?: DeviceSpecialization[];
  version?: DeviceVersion[];
  property?: DeviceProperty[];
  patient?: Reference<"Patient">;
  owner?: Reference<"Organization">;
  contact?: ContactPoint[];
  location?: Reference<"Location">;
  url?: FhirUri;
  note?: Annotation[];
  safety?: CodeableConcept[];
  parent?: Reference<"Device">;
}
