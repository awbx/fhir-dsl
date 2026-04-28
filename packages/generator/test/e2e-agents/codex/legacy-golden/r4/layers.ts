// Auto-generated. FHIR architectural layer for each resource type.
// See https://build.fhir.org/overview-arch.html for the framework.

export type FhirLayer = "Foundation" | "Base" | "Clinical" | "Financial" | "Specialized";

export const LAYER_OF = {
  Condition: "Clinical",
  Encounter: "Base",
  MedicationRequest: "Clinical",
  Observation: "Clinical",
  Patient: "Base",
  Specimen: "Clinical",
} as const satisfies Record<string, FhirLayer>;

export type LayerOf<T extends keyof typeof LAYER_OF> = (typeof LAYER_OF)[T];

const LAYER_RANK: Record<FhirLayer, number> = {
  Foundation: 0,
  Base: 1,
  Clinical: 2,
  Financial: 3,
  Specialized: 4,
};

export function referencesUpward(source: keyof typeof LAYER_OF, target: keyof typeof LAYER_OF): boolean {
  return LAYER_RANK[LAYER_OF[source]] >= LAYER_RANK[LAYER_OF[target]];
}
