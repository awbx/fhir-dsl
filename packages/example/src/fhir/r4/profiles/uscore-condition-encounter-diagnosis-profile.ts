import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Period, Range } from "../datatypes.js";
import type { Condition } from "../resources/condition.js";

/**
 * US Core Condition Encounter Diagnosis Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis
 */
export interface USCoreConditionEncounterDiagnosisProfile extends Condition {
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
}

