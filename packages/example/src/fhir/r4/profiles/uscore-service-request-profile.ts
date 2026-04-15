import type { Period, Timing } from "../datatypes.js";
import type { FhirDateTime } from "../primitives.js";
import type { ServiceRequest } from "../resources/service-request.js";

/**
 * US Core ServiceRequest Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-servicerequest
 */
export interface USCoreServiceRequestProfile extends ServiceRequest {
  occurrencePeriod?: Period;
  occurrenceDateTime?: FhirDateTime;
  occurrenceTiming?: Timing;
}
