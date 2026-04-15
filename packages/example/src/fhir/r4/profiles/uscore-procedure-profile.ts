import type { Age, Period, Range } from "../datatypes.js";
import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Procedure } from "../resources/procedure.js";

/**
 * US Core Procedure Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure
 */
export interface USCoreProcedureProfile extends Procedure {
  performedDateTime?: FhirDateTime;
  performedPeriod?: Period;
  performedString?: FhirString;
  performedAge?: Age;
  performedRange?: Range;
}
