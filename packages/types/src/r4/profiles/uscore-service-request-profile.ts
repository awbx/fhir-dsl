import type { FhirDateTime } from "../primitives.js";
import type { Period, Reference, Timing } from "../datatypes.js";
import type { ServiceRequest } from "../resources/service-request.js";

/**
 * US Core ServiceRequest Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-servicerequest
 */
export interface USCoreServiceRequestProfile extends ServiceRequest {
  status?: unknown;
  intent?: unknown;
  category?: unknown;
  category?: unknown;
  code: unknown;
  subject?: Reference<"us-core-patient">;
  occurrencePeriod?: Period;
  occurrenceDateTime?: FhirDateTime;
  occurrenceTiming?: Timing;
  authoredOn?: unknown;
  requester?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-patient" | "PractitionerRole" | "us-core-relatedperson" | "Device">;
}

