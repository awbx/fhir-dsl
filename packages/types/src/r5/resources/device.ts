import type {
  Annotation,
  Attachment,
  BackboneElement,
  CodeableConcept,
  CodeableReference,
  ContactPoint,
  Count,
  DomainResource,
  Duration,
  Identifier,
  Quantity,
  Range,
  Reference,
} from "../datatypes.js";
import type {
  FhirBase64Binary,
  FhirBoolean,
  FhirCode,
  FhirDateTime,
  FhirInteger,
  FhirString,
  FhirUri,
} from "../primitives.js";

export interface DeviceUdiCarrier extends BackboneElement {
  deviceIdentifier: FhirString;
  issuer: FhirUri;
  jurisdiction?: FhirUri;
  carrierAIDC?: FhirBase64Binary;
  carrierHRF?: FhirString;
  entryType?: FhirCode;
}

export interface DeviceName extends BackboneElement {
  value: FhirString;
  type: FhirCode;
  display?: FhirBoolean;
}

export interface DeviceVersion extends BackboneElement {
  type?: CodeableConcept;
  component?: Identifier;
  installDate?: FhirDateTime;
  value: FhirString;
}

export interface DeviceConformsTo extends BackboneElement {
  category?: CodeableConcept;
  specification: CodeableConcept;
  version?: FhirString;
}

export interface DeviceProperty extends BackboneElement {
  type: CodeableConcept;
  valueQuantity?: Quantity;
  valueCodeableConcept?: CodeableConcept;
  valueString?: FhirString;
  valueBoolean?: FhirBoolean;
  valueInteger?: FhirInteger;
  valueRange?: Range;
  valueAttachment?: Attachment;
}

export interface Device extends DomainResource {
  resourceType: "Device";
  identifier?: Identifier[];
  displayName?: FhirString;
  definition?: CodeableReference;
  udiCarrier?: DeviceUdiCarrier[];
  status?: FhirCode;
  availabilityStatus?: CodeableConcept;
  biologicalSourceEvent?: Identifier;
  manufacturer?: FhirString;
  manufactureDate?: FhirDateTime;
  expirationDate?: FhirDateTime;
  lotNumber?: FhirString;
  serialNumber?: FhirString;
  name?: DeviceName[];
  modelNumber?: FhirString;
  partNumber?: FhirString;
  category?: CodeableConcept[];
  type?: CodeableConcept[];
  version?: DeviceVersion[];
  conformsTo?: DeviceConformsTo[];
  property?: DeviceProperty[];
  mode?: CodeableConcept;
  cycle?: Count;
  duration?: Duration;
  owner?: Reference<"Organization">;
  contact?: ContactPoint[];
  location?: Reference<"Location">;
  url?: FhirUri;
  endpoint?: Reference<"Endpoint">[];
  gateway?: CodeableReference[];
  note?: Annotation[];
  safety?: CodeableConcept[];
  parent?: Reference<"Device">;
}
