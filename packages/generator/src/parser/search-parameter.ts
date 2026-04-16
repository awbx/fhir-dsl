import type { CompositeComponent, ResourceSearchParams, SearchParamModel } from "../model/resource-model.js";

// --- FHIR SearchParameter types (minimal for parsing) ---

interface FhirSearchParameterComponent {
  definition: string;
  expression?: string | undefined;
}

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
  component?: FhirSearchParameterComponent[] | undefined;
}

function isFhirSearchParameter(value: unknown): value is FhirSearchParameter {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.resourceType === "SearchParameter" && typeof record.code === "string" && Array.isArray(record.base);
}

// --- Parser ---

export function parseSearchParameters(searchParams: unknown[]): Map<string, ResourceSearchParams> {
  const registry = new Map<string, ResourceSearchParams>();

  // First pass: index all search params by URL so we can resolve composite component definitions
  const byUrl = new Map<string, FhirSearchParameter>();
  for (const raw of searchParams) {
    if (!isFhirSearchParameter(raw)) continue;
    byUrl.set(raw.url, raw);
  }

  // Second pass: build the registry, resolving composite components
  for (const raw of searchParams) {
    if (!isFhirSearchParameter(raw)) continue;
    const sp = raw;

    let components: CompositeComponent[] | undefined;
    if (sp.type === "composite" && sp.component?.length) {
      components = [];
      for (const comp of sp.component) {
        const resolved = byUrl.get(comp.definition);
        if (resolved) {
          components.push({ code: resolved.code, type: resolved.type });
        }
      }
      if (components.length === 0) {
        components = undefined;
      }
    }

    const model: SearchParamModel = {
      name: sp.name,
      code: sp.code,
      type: sp.type,
      description: sp.description,
      expression: sp.expression,
      targets: sp.target,
      components,
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
