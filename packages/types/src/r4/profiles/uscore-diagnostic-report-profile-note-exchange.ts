import type { FhirDateTime } from "../primitives.js";
import type { Period, Reference } from "../datatypes.js";
import type { DiagnosticReport } from "../resources/diagnostic-report.js";

/**
 * US Core DiagnosticReport Profile for Report and Note Exchange
 * http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note
 */
export interface USCoreDiagnosticReportProfileNoteExchange extends DiagnosticReport {
  status?: unknown;
  category: unknown;
  category?: unknown;
  code?: unknown;
  subject: Reference<"us-core-patient">;
  encounter?: Reference<"us-core-encounter">;
  effectiveDateTime?: FhirDateTime;
  effectivePeriod?: Period;
  issued?: unknown;
  performer?: Reference<"us-core-practitioner" | "us-core-organization" | "us-core-practitionerrole" | "us-core-careteam">;
  result?: Reference<"us-core-observation-lab" | "us-core-observation-clinical-result" | "Observation">;
  media?: unknown;
  presentedForm?: unknown;
}

