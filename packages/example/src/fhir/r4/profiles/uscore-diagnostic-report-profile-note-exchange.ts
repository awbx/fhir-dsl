import type { FhirDateTime } from "../primitives.js";
import type { Period } from "../datatypes.js";
import type { DiagnosticReport } from "../resources/diagnostic-report.js";

/**
 * US Core DiagnosticReport Profile for Report and Note Exchange
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note
 */
export interface USCoreDiagnosticReportProfileNoteExchange extends DiagnosticReport {
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
}

