import type { Reference } from "../datatypes.js";
import type { Device } from "../resources/device.js";

/**
 * US Core Implantable Device Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-implantable-device
 */
export interface USCoreImplantableDeviceProfile extends Device {
  udiCarrier?: unknown;
  distinctIdentifier?: unknown;
  manufactureDate?: unknown;
  expirationDate?: unknown;
  lotNumber?: unknown;
  serialNumber?: unknown;
  type: unknown;
  patient: Reference<"us-core-patient">;
}

