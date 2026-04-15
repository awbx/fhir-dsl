import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Period, Range, Reference } from "../datatypes.js";
import type { Condition } from "../resources/condition.js";

/**
 * US Core Condition Problems and Health Concerns Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-problems-health-concerns
 */
export interface USCoreConditionProblemsHealthConcernsProfile extends Condition {
  clinicalStatus?: unknown;
  verificationStatus?: unknown;
  category: unknown;
  category: unknown;
  category?: unknown;
  code: unknown;
  subject?: Reference<"us-core-patient">;
  onsetDateTime?: FhirDateTime;
  onsetAge?: Age;
  onsetPeriod?: Period;
  onsetRange?: Range;
  onsetString?: FhirString;
  abatementDateTime?: FhirDateTime;
  abatementAge?: Age;
  abatementPeriod?: Period;
  abatementRange?: Range;
  abatementString?: FhirString;
  recordedDate?: unknown;
}

