import type { FhirBase64Binary, FhirCode } from "../primitives.js";
import type { Reference, Resource } from "../datatypes.js";

export interface Binary extends Resource {
  resourceType: "Binary";
  contentType: FhirCode;
  securityContext?: Reference<"Resource">;
  data?: FhirBase64Binary;
}
