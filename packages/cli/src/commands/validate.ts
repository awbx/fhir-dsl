import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Command } from "commander";

// Phase 7.1 — `fhir-gen validate <file>` performs a structural sanity
// check on a FHIR JSON resource. Deeper validation (profile slices,
// invariants, terminology binding) requires the user's generated
// validators and is out of scope for this command — the goal here is
// CI-friendly "did the LLM hand me garbage?" filtering.
//
// Checks performed:
//   1. File parses as JSON.
//   2. `resourceType` is present and a known FHIR resource type.
//   3. Optional fields with well-known cardinalities don't violate
//      basic structural rules (e.g., `id` must be string, no NaN,
//      `entry` on Bundle must be an array if present).
//
// The resource-type allowlist is the union of every layer set from
// layer-emitter — closed for FHIR R4/R5/R6.

const KNOWN_RESOURCES = new Set([
  // Foundation
  "Resource",
  "DomainResource",
  "Bundle",
  "Binary",
  "Linkage",
  "MessageHeader",
  "OperationOutcome",
  "Parameters",
  "Subscription",
  "SubscriptionStatus",
  "SubscriptionTopic",
  "CapabilityStatement",
  "StructureDefinition",
  "StructureMap",
  "ImplementationGuide",
  "SearchParameter",
  "MessageDefinition",
  "OperationDefinition",
  "CompartmentDefinition",
  "GraphDefinition",
  "ExampleScenario",
  "NamingSystem",
  "TerminologyCapabilities",
  "CodeSystem",
  "ValueSet",
  "ConceptMap",
  "AuditEvent",
  "Provenance",
  "Consent",
  // Base
  "Patient",
  "Practitioner",
  "PractitionerRole",
  "RelatedPerson",
  "Person",
  "Group",
  "Organization",
  "OrganizationAffiliation",
  "HealthcareService",
  "Endpoint",
  "Location",
  "Device",
  "DeviceMetric",
  "Substance",
  "BiologicallyDerivedProduct",
  "NutritionProduct",
  "Schedule",
  "Slot",
  "Appointment",
  "AppointmentResponse",
  "VerificationResult",
  "Encounter",
  "EpisodeOfCare",
  "Flag",
  "List",
  "Library",
  // Clinical
  "AllergyIntolerance",
  "AdverseEvent",
  "Condition",
  "Procedure",
  "FamilyMemberHistory",
  "ClinicalImpression",
  "DetectedIssue",
  "Observation",
  "Media",
  "DiagnosticReport",
  "Specimen",
  "BodyStructure",
  "ImagingStudy",
  "ImagingSelection",
  "QuestionnaireResponse",
  "MolecularSequence",
  "MedicationRequest",
  "MedicationAdministration",
  "MedicationDispense",
  "MedicationStatement",
  "Medication",
  "MedicationKnowledge",
  "Immunization",
  "ImmunizationEvaluation",
  "ImmunizationRecommendation",
  "CarePlan",
  "CareTeam",
  "Goal",
  "ServiceRequest",
  "NutritionOrder",
  "VisionPrescription",
  "RiskAssessment",
  "RequestOrchestration",
  "Communication",
  "CommunicationRequest",
  "DeviceRequest",
  "DeviceDispense",
  "DeviceUsage",
  "GuidanceResponse",
  "SupplyRequest",
  "SupplyDelivery",
  "Task",
  "Transport",
  "Composition",
  "DocumentReference",
  "Questionnaire",
  "Basic",
  "BiologicallyDerivedProductDispense",
  // Financial
  "Account",
  "ChargeItem",
  "ChargeItemDefinition",
  "Contract",
  "Invoice",
  "PaymentNotice",
  "PaymentReconciliation",
  "Coverage",
  "CoverageEligibilityRequest",
  "CoverageEligibilityResponse",
  "EnrollmentRequest",
  "EnrollmentResponse",
  "Claim",
  "ClaimResponse",
  "InsurancePlan",
  "InsuranceProduct",
  "ExplanationOfBenefit",
  // Specialized
  "ResearchStudy",
  "ResearchSubject",
  "ActivityDefinition",
  "PlanDefinition",
  "Measure",
  "MeasureReport",
  "EvidenceReport",
  "Evidence",
  "EvidenceVariable",
  "Citation",
  "ArtifactAssessment",
  "DeviceDefinition",
  "SubstanceDefinition",
]);

interface ValidationIssue {
  severity: "error" | "warning";
  path: string;
  message: string;
}

export function validateResource(input: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    issues.push({
      severity: "error",
      path: "$",
      message: "Root value must be a JSON object",
    });
    return issues;
  }

  const obj = input as Record<string, unknown>;
  const resourceType = obj.resourceType;
  if (typeof resourceType !== "string") {
    issues.push({
      severity: "error",
      path: "$.resourceType",
      message: "Missing or non-string `resourceType`",
    });
    return issues;
  }

  if (!KNOWN_RESOURCES.has(resourceType)) {
    issues.push({
      severity: "warning",
      path: "$.resourceType",
      message: `Unknown FHIR resource type "${resourceType}" — not in the R4/R5/R6 known set`,
    });
  }

  if (obj.id !== undefined && typeof obj.id !== "string") {
    issues.push({
      severity: "error",
      path: "$.id",
      message: "`id` must be a string when present",
    });
  }

  // Bundle-specific: `entry` must be an array.
  if (resourceType === "Bundle" && obj.entry !== undefined && !Array.isArray(obj.entry)) {
    issues.push({ severity: "error", path: "$.entry", message: "Bundle.entry must be an array" });
  }

  // No NaN or Infinity in any numeric leaves.
  walkForBadNumbers(obj, "$", issues);

  return issues;
}

function walkForBadNumbers(value: unknown, path: string, issues: ValidationIssue[]): void {
  if (value == null) return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      issues.push({ severity: "error", path, message: "FHIR numbers must be finite (no NaN / Infinity)" });
    }
    return;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      walkForBadNumbers(value[i], `${path}[${i}]`, issues);
    }
    return;
  }
  if (typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walkForBadNumbers(v, `${path}.${k}`, issues);
    }
  }
}

export const validateCommand = new Command("validate")
  .description("Structurally validate a FHIR JSON resource (sanity-check only — see docs for full validation)")
  .argument("<file>", "Path to a JSON file containing a FHIR resource")
  .option("--quiet", "Print nothing on success; non-zero exit on failure")
  .action((file: string, opts: { quiet?: boolean }) => {
    const path = resolve(file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(path, "utf-8"));
    } catch (err) {
      console.error(`${path}: not valid JSON — ${(err as Error).message}`);
      process.exit(1);
    }
    const issues = validateResource(parsed);
    const errors = issues.filter((i) => i.severity === "error");
    const warnings = issues.filter((i) => i.severity === "warning");
    if (errors.length > 0) {
      for (const i of issues) {
        console.error(`  ${i.severity.padEnd(7)} ${i.path}: ${i.message}`);
      }
      console.error(`\n${errors.length} error(s), ${warnings.length} warning(s) in ${path}`);
      process.exit(1);
    }
    if (warnings.length > 0 && !opts.quiet) {
      for (const i of warnings) {
        console.warn(`  ${i.severity.padEnd(7)} ${i.path}: ${i.message}`);
      }
      console.warn(`\n${warnings.length} warning(s) in ${path}`);
    }
    if (!opts.quiet) {
      const rt = (parsed as { resourceType: string }).resourceType;
      console.log(`OK — ${path} parses as a ${rt} resource`);
    }
  });
