import type { CodeSystemModel, ResolvedCode, ResolvedValueSet } from "./model.js";

interface FhirIncludeConcept {
  code?: string;
  display?: string;
}

interface FhirIncludeFilter {
  property?: string;
  op?: string;
  value?: string;
}

interface FhirComposeInclude {
  system?: string;
  concept?: FhirIncludeConcept[];
  filter?: FhirIncludeFilter[];
  valueSet?: string[];
}

interface FhirValueSetCompose {
  resourceType: "ValueSet";
  url?: string;
  name?: string;
  version?: string;
  compose?: {
    include?: FhirComposeInclude[];
    exclude?: FhirComposeInclude[];
  };
}

function isComposeValueSet(value: unknown): value is FhirValueSetCompose {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return record.resourceType === "ValueSet" && typeof record.compose === "object" && record.compose !== null;
}

export function resolveCompose(
  resource: unknown,
  codeSystemLookup: Map<string, CodeSystemModel>,
): ResolvedValueSet | undefined {
  if (!isComposeValueSet(resource)) return undefined;
  if (!resource.compose?.include?.length) return undefined;

  const includedCodes: ResolvedCode[] = [];
  let isComplete = true;

  for (const include of resource.compose.include) {
    if (include.concept?.length) {
      // Explicit concept list — always resolvable
      for (const concept of include.concept) {
        if (concept.code) {
          includedCodes.push({
            code: concept.code,
            display: concept.display,
            system: include.system,
          });
        }
      }
    } else if (include.filter?.length) {
      // Filter-based include — try to resolve from local CodeSystem
      const cs = include.system ? codeSystemLookup.get(include.system) : undefined;
      if (cs && cs.content === "complete" && cs.concepts.length > 0) {
        const filtered = applyFilters(cs.concepts, include.filter);
        includedCodes.push(...filtered.map((c) => ({ ...c, system: include.system })));
      } else {
        isComplete = false;
      }
    } else if (include.system) {
      // System-only include (all codes from the CodeSystem)
      const cs = codeSystemLookup.get(include.system);
      if (cs && cs.content === "complete" && cs.concepts.length > 0) {
        includedCodes.push(...cs.concepts.map((c) => ({ ...c, system: include.system })));
      } else {
        isComplete = false;
      }
    } else {
      // No system, no concept, no filter — skip
      isComplete = false;
    }
  }

  // Apply excludes
  if (resource.compose.exclude?.length) {
    const excludeSet = new Set<string>();
    for (const exclude of resource.compose.exclude) {
      if (exclude.concept?.length) {
        for (const concept of exclude.concept) {
          if (concept.code) {
            const key = exclude.system ? `${exclude.system}|${concept.code}` : concept.code;
            excludeSet.add(key);
          }
        }
      }
    }

    if (excludeSet.size > 0) {
      const filtered = includedCodes.filter((c) => {
        const key = c.system ? `${c.system}|${c.code}` : c.code;
        return !excludeSet.has(key);
      });
      return {
        url: resource.url ?? "",
        name: resource.name ?? "",
        version: resource.version,
        codes: filtered,
        isComplete,
      };
    }
  }

  if (includedCodes.length === 0) return undefined;

  return {
    url: resource.url ?? "",
    name: resource.name ?? "",
    version: resource.version,
    codes: includedCodes,
    isComplete,
  };
}

function applyFilters(concepts: ResolvedCode[], filters: FhirIncludeFilter[]): ResolvedCode[] {
  let result = concepts;
  for (const filter of filters) {
    if (filter.op === "=" && filter.property === "concept" && filter.value) {
      result = result.filter((c) => c.code === filter.value);
    }
    // For complex filters (is-a, descendent-of, regex, etc.) on external code systems,
    // we cannot resolve offline — return all concepts as a best-effort approximation
    // for FHIR-defined code systems (which are small and complete)
  }
  return result;
}
