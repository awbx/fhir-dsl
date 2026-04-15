import type { Period } from "../datatypes.js";
import type { FhirDateTime } from "../primitives.js";
import type { DiagnosticReport } from "../resources/diagnostic-report.js";

/**
 * US Core DiagnosticReport Profile for Laboratory Results Reporting
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-lab
 */
export interface USCoreDiagnosticReportProfileLaboratoryReporting extends DiagnosticReport {
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
}
