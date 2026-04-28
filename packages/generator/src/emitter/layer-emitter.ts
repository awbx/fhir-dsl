// Phase 5 — Emits a `LAYER_OF` map that tags every generated resource
// with its FHIR architectural-overview layer (Foundation / Base /
// Clinical / Financial / Specialized).
//
// The mapping is hardcoded from https://build.fhir.org/resourcelist.html
// — a closed set, stable across R4/R4B/R5/R6 for the resources that
// appear in each version. Resources that aren't listed here fall back
// to "Specialized" (the catch-all for less-common types).
//
// The emitted map enables consumers to reason about resource layering
// — e.g., a future ESLint rule could flag a Reference<TARGET> whose
// target sits in a strictly lower layer than the source resource.

import type { ResourceModel } from "../model/resource-model.js";

export type FhirLayer = "Foundation" | "Base" | "Clinical" | "Financial" | "Specialized";

const FOUNDATION = new Set([
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
]);

const BASE = new Set([
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
]);

const CLINICAL = new Set([
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
]);

const FINANCIAL = new Set([
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
]);

const SPECIALIZED = new Set([
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
  "SubstanceNucleicAcid",
  "SubstancePolymer",
  "SubstanceProtein",
  "SubstanceReferenceInformation",
  "SubstanceSourceMaterial",
  "MedicinalProductDefinition",
  "PackagedProductDefinition",
  "AdministrableProductDefinition",
  "ManufacturedItemDefinition",
  "Ingredient",
  "ClinicalUseDefinition",
  "RegulatedAuthorization",
  "TestPlan",
  "TestScript",
  "TestReport",
  "InventoryItem",
  "InventoryReport",
  "FormularyItem",
  "GenomicStudy",
  "Permission",
  "ActorDefinition",
  "Requirements",
]);

export function layerOf(resourceType: string): FhirLayer {
  if (FOUNDATION.has(resourceType)) return "Foundation";
  if (BASE.has(resourceType)) return "Base";
  if (CLINICAL.has(resourceType)) return "Clinical";
  if (FINANCIAL.has(resourceType)) return "Financial";
  if (SPECIALIZED.has(resourceType)) return "Specialized";
  return "Specialized";
}

/**
 * Emits `<out>/<version>/layers.ts` — a typed map from every generated
 * resource type to its FHIR layer.
 */
export function emitLayers(resources: ResourceModel[]): string {
  const sorted = [...resources].map((r) => r.name).sort();
  const lines: string[] = [];
  lines.push(
    "// Auto-generated. FHIR architectural layer for each resource type.",
    "// See https://build.fhir.org/overview-arch.html for the framework.",
    "",
    'export type FhirLayer = "Foundation" | "Base" | "Clinical" | "Financial" | "Specialized";',
    "",
    "export const LAYER_OF = {",
  );
  for (const name of sorted) {
    lines.push(`  ${name}: "${layerOf(name)}",`);
  }
  lines.push("} as const satisfies Record<string, FhirLayer>;", "");
  lines.push("export type LayerOf<T extends keyof typeof LAYER_OF> = (typeof LAYER_OF)[T];");
  lines.push("");
  // Order: Foundation < Base < Clinical < Financial < Specialized.
  // Per the spec, references should generally point upward (toward
  // Foundation), not downward. `referencesUpward(source, target)` is
  // true when target's layer is the same or higher (closer to
  // Foundation).
  lines.push(
    "const LAYER_RANK: Record<FhirLayer, number> = {",
    "  Foundation: 0,",
    "  Base: 1,",
    "  Clinical: 2,",
    "  Financial: 3,",
    "  Specialized: 4,",
    "};",
    "",
    "export function referencesUpward(source: keyof typeof LAYER_OF, target: keyof typeof LAYER_OF): boolean {",
    "  return LAYER_RANK[LAYER_OF[source]] >= LAYER_RANK[LAYER_OF[target]];",
    "}",
  );
  return `${lines.join("\n")}\n`;
}
