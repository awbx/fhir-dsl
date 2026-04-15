import type { ResourceSearchParams, SearchParamModel } from "../model/resource-model.js";

// --- FHIR SearchParameter types (minimal for parsing) ---

interface FhirSearchParameter {
  resourceType: "SearchParameter";
  id?: string;
  url: string;
  name: string;
  code: string;
  base: string[];
  type: string;
  description?: string;
  expression?: string;
  target?: string[];
}

// --- Parser ---

export function parseSearchParameters(searchParams: FhirSearchParameter[]): Map<string, ResourceSearchParams> {
  const registry = new Map<string, ResourceSearchParams>();

  for (const sp of searchParams) {
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
