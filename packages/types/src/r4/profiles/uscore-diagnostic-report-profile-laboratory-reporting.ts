import type { FhirDateTime } from "../primitives.js";
import type { Period, Reference } from "../datatypes.js";
import type { DiagnosticReport } from "../resources/diagnostic-report.js";

/**
 * US Core DiagnosticReport Profile for Laboratory Results Reporting
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-lab
 */
export interface USCoreDiagnosticReportProfileLaboratoryReporting extends DiagnosticReport {
  subject: Reference<"us-core-patient">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  performer?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-careteam" | "us-core-practitionerrole">;
  result?: Reference<"us-core-observation-lab">;
}

