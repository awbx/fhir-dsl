import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Period, Range, Reference } from "../datatypes.js";
import type { Procedure } from "../resources/procedure.js";

/**
 * US Core Procedure Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure
 */
export interface USCoreProcedureProfile extends Procedure {
  basedOn?: Reference<"us-core-careplan" | "us-core-servicerequest">;
  subject?: Reference<"us-core-patient">;
  performedDateTime?: FhirDateTime;
  performedPeriod?: Period;
  performedString?: FhirString;
  performedAge?: Age;
  performedRange?: Range;
}

