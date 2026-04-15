import type { FhirDateTime, FhirString } from "../primitives.js";
import type { Age, Period, Range, Reference } from "../datatypes.js";
import type { Condition } from "../resources/condition.js";

/**
 * US Core Condition Encounter Diagnosis Profile
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis
 */
export interface USCoreConditionEncounterDiagnosisProfile extends Condition {
  clinicalStatus?: unknown;
  verificationStatus?: unknown;
  category: unknown;
  category: unknown;
  code: unknown;
  subject?: Reference<"us-core-patient">;
  encounter?: Reference<"us-core-encounter">;
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

