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
        const { codes: filtered, complete } = applyFilters(cs, include.filter);
        if (!complete) isComplete = false;
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

/**
 * Phase 3.2 — applies ValueSet `compose.include.filter[*]` rules to a
 * resolved CodeSystem's concept list.
 *
 * Supported ops:
 * - `=`              on `concept` — exact code match.
 * - `is-a` / `=`     on `concept` (when CS hierarchy is loaded) — code +
 *                    descendants.
 * - `descendent-of`  on `concept` — strict descendants only (no self).
 * - `regex`          on `code` — regex match against the code value.
 *
 * Returns `{ codes, complete }`. `complete=false` signals that one or
 * more filters couldn't be applied offline (e.g., is-a without
 * hierarchy data) so the caller can mark the ValueSet incomplete.
 */
function applyFilters(cs: CodeSystemModel, filters: FhirIncludeFilter[]): { codes: ResolvedCode[]; complete: boolean } {
  let result = cs.concepts;
  let complete = true;

  for (const filter of filters) {
    const op = filter.op;
    const value = filter.value;
    const prop = filter.property;
    if (!op || !value || !prop) {
      complete = false;
      continue;
    }

    if (op === "=" && prop === "concept") {
      result = result.filter((c) => c.code === value);
      continue;
    }

    if ((op === "is-a" || op === "isa") && prop === "concept") {
      if (!cs.isA) {
        complete = false;
        continue;
      }
      result = result.filter((c) => cs.isA!(value, c.code));
      continue;
    }

    if (op === "descendent-of" && prop === "concept") {
      if (!cs.isA) {
        complete = false;
        continue;
      }
      result = result.filter((c) => c.code !== value && cs.isA!(value, c.code));
      continue;
    }

    if (op === "regex") {
      try {
        const re = new RegExp(value);
        result = result.filter((c) => re.test(prop === "display" ? (c.display ?? "") : c.code));
      } catch {
        complete = false;
      }
      continue;
    }

    // Unknown op — best-effort skip, mark incomplete.
    complete = false;
  }

  return { codes: result, complete };
}
