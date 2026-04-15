import type { ResourceSearchParams, SearchParamModel } from "../model/resource-model.js";

// --- FHIR SearchParameter types (minimal for parsing) ---

interface FhirSearchParameter {
  resourceType: "SearchParameter";
  id?: string | undefined;
  url: string;
  name: string;
  code: string;
  base: string[];
  type: string;
  description?: string | undefined;
  expression?: string | undefined;
  target?: string[] | undefined;
}

function isFhirSearchParameter(value: unknown): value is FhirSearchParameter {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.resourceType === "SearchParameter" && typeof record.code === "string" && Array.isArray(record.base);
}

// --- Parser ---

export function parseSearchParameters(searchParams: unknown[]): Map<string, ResourceSearchParams> {
  const registry = new Map<string, ResourceSearchParams>();

  for (const raw of searchParams) {
    if (!isFhirSearchParameter(raw)) continue;
    const sp = raw;
    const model: SearchParamModel = {
      name: sp.name,
      code: sp.code,
      type: sp.type,
      description: sp.description,
      expression: sp.expression,
      targets: sp.target,
    };

    for (const base of sp.base) {
      let entry = registry.get(base);
      if (!entry) {
        entry = { resourceType: base, params: [] };
        registry.set(base, entry);
      }
      entry.params.push(model);
    }
  }

  return registry;
}
