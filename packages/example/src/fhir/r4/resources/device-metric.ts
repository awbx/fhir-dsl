import type { BackboneElement, CodeableConcept, DomainResource, Identifier, Reference, Timing } from "../datatypes.js";
import type { FhirCode, FhirInstant } from "../primitives.js";

export interface DeviceMetricCalibration extends BackboneElement {
  type?: FhirCode;
  state?: FhirCode;
  time?: FhirInstant;
}

export interface DeviceMetric extends DomainResource {
  resourceType: "DeviceMetric";
  identifier?: Identifier[];
  type: CodeableConcept;
  unit?: CodeableConcept;
  source?: Reference<"Device">;
  parent?: Reference<"Device">;
  operationalStatus?: FhirCode;
  color?: FhirCode;
  category: FhirCode;
  measurementPeriod?: Timing;
  calibration?: DeviceMetricCalibration[];
}
